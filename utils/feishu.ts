/**
 * 路径: utils/feishu.ts
 * 功能: 实现本地提示词数据与飞书多维表格的双向/增量同步
 */
import { getSettings } from "./storage";
import type { Prompt } from "@/types";

/**
 * 获取飞书鉴权 Token
 */
async function getTenantAccessToken(
  appId: string,
  appSecret: string,
): Promise<string> {
  const res = await fetch(
    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    },
  );
  const data = await res.json();
  return data.tenant_access_token;
}

/**
 * 将本地提示词推送至飞书
 * @param prompts 需要同步的提示词列表
 */
export async function syncToFeishu(prompts: Prompt[]): Promise<Prompt[]> {
  const settings = await getSettings();
  const { appId, appSecret, bitableId, tableId } = settings.feishu;

  if (!appId || !appSecret || !bitableId || !tableId) {
    throw new Error("请先完成飞书同步配置");
  }

  const token = await getTenantAccessToken(appId, appSecret);
  const updatedPrompts = [...prompts];

  for (const prompt of updatedPrompts) {
    // 构造飞书记录字段映射
    const fields = {
      Prompt内容: prompt.text,
      中文解释: prompt.chinese,
      备注: prompt.remark,
      图片链接: prompt.imageUrl || "",
      更新时间: new Date(prompt.updatedAt).toISOString(),
    };

    let url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${bitableId}/tables/${tableId}/records`;
    let method = "POST";

    // 如果已有 feishuRecordId，执行更新操作，否则执行创建
    if (prompt.feishuRecordId) {
      url += `/${prompt.feishuRecordId}`;
      method = "PUT";
    }

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });

    const result = await res.json();
    if (result.code === 0 && method === "POST") {
      // 保存返回的记录 ID 用于下次更新
      prompt.feishuRecordId = result.data.record.record_id;
    }
  }

  return updatedPrompts;
}
/**
 * 修正：导出 fetchFromFeishu 函数
 * 从飞书多维表格拉取最新记录并与本地合并
 */
export async function fetchFromFeishu(
  localPrompts: Prompt[],
): Promise<Prompt[]> {
  const settings = await getSettings();
  const { appId, appSecret, bitableId, tableId } = settings.feishu;

  if (!appId || !appSecret || !bitableId || !tableId) {
    throw new Error("请先完成飞书同步配置");
  }

  const token = await getTenantAccessToken(appId, appSecret);
  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${bitableId}/tables/${tableId}/records`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  if (data.code !== 0) throw new Error(data.msg);

  const feishuRecords = data.data.items;
  const updatedList = [...localPrompts];

  // 合并逻辑：以飞书 RecordID 为准更新，不存在则新增
  feishuRecords.forEach((item: any) => {
    const fields = item.fields;
    const existingIdx = updatedList.findIndex(
      (p) => p.feishuRecordId === item.record_id,
    );

    const promptData: Partial<Prompt> = {
      text: fields["Prompt内容"],
      chinese: fields["中文解释"],
      remark: fields["备注"],
      imageUrl: fields["图片链接"],
      feishuRecordId: item.record_id,
      updatedAt: Date.now(),
    };

    if (existingIdx > -1) {
      updatedList[existingIdx] = { ...updatedList[existingIdx], ...promptData };
    } else {
      updatedList.push({
        ...promptData,
        id: "p_fs_" + item.record_id,
        libraryId: "", // 默认分配逻辑
        categoryId: "",
        tagIds: [],
        AIPlatformIds: [],
        AIModelIds: [],
        createdAt: Date.now(),
        viewNum: 0,
        favoriteNum: 0,
        useNum: 0,
      } as Prompt);
    }
  });

  return updatedList;
}
