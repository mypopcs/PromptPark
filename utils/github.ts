/**
 * 路径: utils/github.ts
 * 逻辑: 接收 File 对象，转化为 Base64 并提交至 GitHub API
 */
import { getSettings } from "./storage";

export async function uploadToGithub(file: File): Promise<string> {
  const settings = await getSettings();
  const { token, owner, repo, path } = settings.github;

  if (!token || !owner || !repo) throw new Error("请先完善 GitHub 配置");

  const base64Content = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("图片读取失败：格式异常"));
        return;
      }
      const content = reader.result.split(",")[1];
      if (!content) {
        reject(new Error("图片读取失败：内容为空"));
        return;
      }
      resolve(content);
    };
    reader.onerror = () => {
      reject(new Error("图片读取失败：无法解析文件"));
    };
    reader.readAsDataURL(file);
  });

  const fileName = `pp_${Date.now()}_${file.name}`;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}/${fileName}`;

  const response = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `upload by PromptPark: ${fileName}`,
      content: base64Content,
    }),
  });

  if (!response.ok) throw new Error("图片上传 GitHub 失败");
  const result: { content?: { download_url?: string } } = await response.json();
  const downloadUrl = result.content?.download_url;
  if (!downloadUrl) {
    throw new Error("图片上传成功但未返回可用链接");
  }
  return downloadUrl;
}
