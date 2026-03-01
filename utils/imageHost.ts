/**
 * @file utils/imageHost.ts
 * @description 全局图床上传服务 (根据用户配置动态路由)
 */
import { syncStore } from "@/utils/storage";
import { STORAGE_KEYS, DEFAULT_SETTINGS } from "@/config";
import type { AppSettings, GithubImageHostConfig } from "@/types";

export const ImageHostService = {
  /**
   * 统一上传入口
   * @param file 用户选择的图片文件
   * @returns 最终可用于 img 标签渲染的 URL (Base64 或 CDN 链接)
   */
  async upload(file: File): Promise<string> {
    const settings =
      (await syncStore.get<AppSettings>(STORAGE_KEYS.SETTINGS)) ||
      DEFAULT_SETTINGS;

    // 如果没有配置图床，直接转为 Base64 字符串
    if (settings.imageHostProvider === "none") {
      return this.fileToBase64(file);
    }

    // 如果启用了 Github 图床
    if (settings.imageHostProvider === "github") {
      return this.uploadToGithub(file, settings.githubImageHost);
    }

    throw new Error("未知的图床提供商配置");
  },

  /**
   * 将文件上传到 Github Repository 并返回 jsDelivr CDN 链接
   */
  async uploadToGithub(
    file: File,
    config: GithubImageHostConfig,
  ): Promise<string> {
    if (!config.token || !config.repo) {
      throw new Error("Github 图床配置不完整，请前往设置页检查");
    }

    // 1. 将 File 转为 Base64 (Github API 要求)
    const base64Url = await this.fileToBase64(file);
    // 截取掉 "data:image/png;base64," 这类前缀，只保留真正的 Base64 编码
    const b64Data = base64Url.split(",")[1];

    // 2. 生成唯一且安全的文件名 (时间戳 + 随机字符 + 原扩展名)
    const ext = file.name.split(".").pop() || "png";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // 3. 拼接路径 (处理开头或结尾多余的斜杠)
    const pathPrefix = config.path
      ? config.path.replace(/^\/|\/$/g, "") + "/"
      : "";
    const branch = config.branch || "main";
    const fullPath = `${pathPrefix}${filename}`;

    const url = `https://api.github.com/repos/${config.repo}/contents/${fullPath}`;

    // 4. 发起 PUT 请求创建文件
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        message: `Upload image ${filename} via PromptPark`,
        content: b64Data,
        branch: branch,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`图床上传失败: ${err.message}`);
    }

    // 5. 组装 jsDelivr 免费全球加速 CDN 链接返回
    // 格式: https://cdn.jsdelivr.net/gh/用户名/仓库名@分支名/文件路径
    return `https://cdn.jsdelivr.net/gh/${config.repo}@${branch}/${fullPath}`;
  },

  /**
   * 基础工具：File 对象转 Base64
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  },
};
