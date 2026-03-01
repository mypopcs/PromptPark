/**
 * @file utils/sync/NotionSyncService.ts
 * @description Notion Database 同步策略实现 (骨架)
 */
import type { ISyncProvider, SyncDataPayload } from "./index";
import type { NotionSyncConfig } from "@/types";

export class NotionSyncService implements ISyncProvider {
  private config: NotionSyncConfig;

  constructor(config: NotionSyncConfig) {
    this.config = config;
  }

  async testConnection(): Promise<boolean> {
    if (!this.config.token) return false;
    // TODO: 实现 Notion Token 连通性测试 (例如请求 /v1/users/me)
    console.log("Testing Notion connection...");
    return true;
  }

  async pushData(payload: SyncDataPayload): Promise<void> {
    if (!this.config.mapping.promptsTableId) {
      throw new Error("未绑定 Notion Database ID");
    }
    // TODO: 1. 清空绑定的 Notion Database
    // TODO: 2. 将 payload 里的数据映射并写入 Notion
    console.log("Pushing to Notion...", payload);
  }

  async pullData(): Promise<SyncDataPayload> {
    // TODO: 从 Notion 拉取并反序列化回 SyncDataPayload 格式
    throw new Error("Notion 拉取功能暂未完整实现");
  }
}
