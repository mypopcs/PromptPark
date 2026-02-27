/**
 * 路径: utils/github.ts
 * 逻辑: 接收 File 对象，转化为 Base64 并提交至 GitHub API
 */
import { getSettings } from "./storage";

export async function uploadToGithub(file: File): Promise<string> {
  const settings = await getSettings();
  const { token, owner, repo, path } = settings.github;

  if (!token || !owner || !repo) throw new Error("请先完善 GitHub 配置");

  const base64Content = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
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
  const result = await response.json();
  return result.content.download_url; // 返回直连链接
}
