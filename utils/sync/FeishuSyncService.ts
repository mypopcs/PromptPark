/**
 * @file utils/sync/FeishuSyncService.ts
 * @description 飞书多维表格同步策略实现 (支持多表关联与公开单点写入)
 */
import type { ISyncProvider, SyncDataPayload } from "./index";
import type { FeishuSyncConfig } from "@/types";

const FEISHU_API_BASE = "https://open.feishu.cn/open-apis";

export class FeishuSyncService implements ISyncProvider {
  private config: FeishuSyncConfig;
  private tenantAccessToken: string | null = null;
  private tokenExpireTime: number = 0;

  constructor(config: FeishuSyncConfig) {
    this.config = config;
  }

  /**
   * 核心鉴权：获取或刷新 tenant_access_token
   */
  private async getAccessToken(): Promise<string> {
    // 如果 Token 还在有效期内（提前 5 分钟刷新），直接返回
    if (
      this.tenantAccessToken &&
      Date.now() < this.tokenExpireTime - 5 * 60 * 1000
    ) {
      return this.tenantAccessToken;
    }

    const response = await fetch(
      `${FEISHU_API_BASE}/auth/v3/tenant_access_token/internal`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          app_id: this.config.appId,
          app_secret: this.config.appSecret,
        }),
      },
    );

    const data = await response.json();
    if (data.code !== 0) {
      throw new Error(`飞书鉴权失败: ${data.msg}`);
    }

    this.tenantAccessToken = data.tenant_access_token;
    // 飞书 token 有效期通常是 7200 秒 (2小时)
    this.tokenExpireTime = Date.now() + data.expire * 1000;
    return data.tenant_access_token;
  }

  /**
   * 封装统一的飞书 API 请求
   */
  private async request(path: string, options: RequestInit = {}) {
    const token = await this.getAccessToken();
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
      ...(options.headers || {}),
    };

    const response = await fetch(`${FEISHU_API_BASE}${path}`, {
      ...options,
      headers,
    });
    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(`飞书 API 错误 [${data.code}]: ${data.msg}`);
    }
    return data;
  }

  /**
   * 接口实现 1：测试连通性
   */
  async testConnection(): Promise<boolean> {
    try {
      // 1. 测试 Token 获取
      await this.getAccessToken();
      // 2. 测试多维表格基础信息读取权限
      if (this.config.appToken) {
        await this.request(`/bitable/v1/apps/${this.config.appToken}`);
      }
      return true;
    } catch (error) {
      console.error("Feishu connection test failed:", error);
      return false;
    }
  }

  /**
   * 接口实现 2：公共反馈/单点写入 (为你未来的功能量身定制！)
   * @param tableId 飞书多维表格的具体数据表 ID
   * @param fields 对应飞书表格的字段键值对
   */
  async insertRecord(
    tableId: string,
    fields: Record<string, any>,
  ): Promise<boolean> {
    if (!this.config.appToken || !tableId) {
      throw new Error("缺失飞书 appToken 或 tableId，无法写入数据");
    }

    try {
      await this.request(
        `/bitable/v1/apps/${this.config.appToken}/tables/${tableId}/records`,
        {
          method: "POST",
          body: JSON.stringify({ fields }),
        },
      );
      return true;
    } catch (error) {
      console.error("Failed to insert record:", error);
      throw error;
    }
  }

  /**
   * 辅助方法：清空某个飞书表的所有旧数据 (覆盖同步策略)
   */
  private async clearTable(tableId: string) {
    if (!tableId) return;

    // 1. 获取表内所有记录的 record_id (需处理分页，此处简化演示单页500条)
    const listRes = await this.request(
      `/bitable/v1/apps/${this.config.appToken}/tables/${tableId}/records?page_size=500`,
    );
    if (!listRes.data || !listRes.data.items || listRes.data.items.length === 0)
      return;

    const recordIds = listRes.data.items.map((item: any) => item.record_id);

    // 2. 批量删除
    await this.request(
      `/bitable/v1/apps/${this.config.appToken}/tables/${tableId}/records/batch_delete`,
      {
        method: "POST",
        body: JSON.stringify({ records: recordIds }),
      },
    );
  }

  /**
   * 辅助方法：批量写入数据到某个飞书表
   */
  private async batchInsertTable(tableId: string, items: any[]) {
    if (!tableId || items.length === 0) return;

    // 构造飞书批量创建要求的格式 [{ fields: { "字段A": "值A" } }]
    const records = items.map((item) => ({
      fields: {
        // 注意：这里需要确保飞书表格的字段名与这里映射的 key 完全一致
        // 在实际应用中，你可能需要在飞书表格里将字段名命名为 id, name, prompt 等英文，或者在这里做中文映射
        id: item.id,
        数据内容: JSON.stringify(item), // 为了保证数据不丢失的最简单做法：整块存入长文本列
      },
    }));

    // 飞书限制单次最大 500 条，如果你的数据非常多，这里需要写 chunk 分块逻辑
    await this.request(
      `/bitable/v1/apps/${this.config.appToken}/tables/${tableId}/records/batch_create`,
      {
        method: "POST",
        body: JSON.stringify({ records }),
      },
    );
  }

  /**
   * 接口实现 3：推送数据到云端 (全量覆盖)
   */
  async pushData(payload: SyncDataPayload): Promise<string> {
    const { mapping, appToken } = this.config;
    if (!appToken) throw new Error("缺失飞书多维表格 appToken");

    // 我们以“字典表”为例，演示清理后重新插入的同步逻辑
    // 为了防止过程过长，这里用 Promise.all 并发处理各个表
    const syncTasks = [];

    if (mapping.promptsTableId) {
      syncTasks.push(
        this.clearTable(mapping.promptsTableId).then(() =>
          this.batchInsertTable(mapping.promptsTableId, payload.prompts),
        ),
      );
    }
    if (mapping.dictionariesTableId) {
      syncTasks.push(
        this.clearTable(mapping.dictionariesTableId).then(() =>
          this.batchInsertTable(
            mapping.dictionariesTableId,
            payload.dictionaries,
          ),
        ),
      );
    }
    // ... 可以以此类推添加 categories, tags 等表的同步

    await Promise.all(syncTasks);
    return "feishu_sync_success"; // 飞书不需要返回特定的 GistID
  }

  /**
   * 接口实现 4：从云端拉取数据
   */
  async pullData(): Promise<SyncDataPayload> {
    // 拉取逻辑是 push 的逆向过程：读取各表的数据，并解析 `数据内容` 字段反序列化。
    // 这里为了演示架构，仅写出结构：
    throw new Error("飞书拉取功能暂未完整实现，请期待后续迭代。");
  }
}
