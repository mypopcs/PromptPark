/**
 * 路径: utils/feishu.ts
 * 功能: 实现本地提示词数据与飞书多维表格的双向/增量同步
 */
import { getSettings } from "./storage";
import type { Prompt } from "@/types";

/** 飞书记录字段结构 */
interface FeishuPromptFields {
  "Prompt内容"?: string;
  "中文解释"?: string;
  "备注"?: string;
  "图片链接"?: string;
}

/** 飞书记录结构 */
interface FeishuPromptRecord {
  record_id: string;
  fields: FeishuPromptFields;
}

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
  const data: { tenant_access_token?: string } = await res.json();
  if (!data.tenant_access_token) {
    throw new Error("飞书鉴权失败，请检查 appId 或 appSecret");
  }
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
    const fields: FeishuPromptFields = {
      Prompt内容: prompt.text,
      中文解释: prompt.chinese,
      备注: prompt.remark,
      图片链接: prompt.imageUrl || "",
    };

    let url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${bitableId}/tables/${tableId}/records`;
    let method = "POST";

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

    const result: { code?: number; data?: { record?: { record_id?: string } } } =
      await res.json();

    if (result.code === 0 && method === "POST") {
      const createdRecordId = result.data?.record?.record_id;
      if (createdRecordId) {
        prompt.feishuRecordId = createdRecordId;
      }
    }
  }

  return updatedPrompts;
}

/**
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
  const data: {
    code?: number;
    msg?: string;
    data?: { items?: FeishuPromptRecord[] };
  } = await res.json();

  if (data.code !== 0) throw new Error(data.msg || "飞书拉取失败");

  const feishuRecords = data.data?.items ?? [];
  const updatedList = [...localPrompts];

  for (const item of feishuRecords) {
    const fields = item.fields;
    const existingIdx = updatedList.findIndex(
      (p) => p.feishuRecordId === item.record_id,
    );

    const promptData = {
      text: fields["Prompt内容"] ?? "",
      chinese: fields["中文解释"] ?? "",
      remark: fields["备注"] ?? "",
      imageUrl: fields["图片链接"] || undefined,
      feishuRecordId: item.record_id,
      updatedAt: Date.now(),
    };

    if (existingIdx > -1) {
      const existingPrompt = updatedList[existingIdx];
      if (existingPrompt) {
        updatedList[existingIdx] = { ...existingPrompt, ...promptData };
      }
    } else {
      updatedList.push({
        id: `p_fs_${item.record_id}`,
        dictionaryId: "",
        categoryId: "",
        text: promptData.text,
        chinese: promptData.chinese,
        remark: promptData.remark,
        imageUrl: promptData.imageUrl,
        viewNum: 0,
        favoriteNum: 0,
        useNum: 0,
        tagIds: [],
        AIPlatformIds: [],
        AIModelIds: [],
        parkUseNum: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        feishuRecordId: item.record_id,
      });
    }
  }

  return updatedList;
}
