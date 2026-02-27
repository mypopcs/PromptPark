import { getSettings, savePrompts, getPrompts } from "@/utils/storage";
import { uploadToGithub } from "@/utils/github"; // 之前实现的逻辑
import { syncToFeishu, fetchFromFeishu } from "@/utils/feishu";

/**
 * 测试 GitHub 配置连通性
 */
export async function testGithubConfig() {
  const settings = await getSettings();
  const { token, owner, repo, path } = settings.github;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const res = await fetch(url, {
    headers: { Authorization: `token ${token}` },
  });
  if (!res.ok) throw new Error("GitHub 配置校验失败，请检查 Token 或仓库信息");
  return true;
}

/**
 * 测试飞书 API 连通性
 */
export async function testFeishuConfig() {
  const settings = await getSettings();
  const { appId, appSecret, bitableId } = settings.feishu;
  // 通过尝试获取多维表格元数据来测试
  const tokenRes = await fetch(
    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    },
  );
  const tokenData = await tokenRes.json();
  if (tokenData.code !== 0) throw new Error("飞书 AppId 或 Secret 错误");

  const metaRes = await fetch(
    `https://open.feishu.cn/open-apis/bitable/v1/apps/${bitableId}`,
    {
      headers: { Authorization: `Bearer ${tokenData.tenant_access_token}` },
    },
  );
  const metaData = await metaRes.json();
  if (metaData.code !== 0)
    throw new Error(`多维表格 ID 校验失败: ${metaData.msg}`);
  return true;
}
