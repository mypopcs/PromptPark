/**
 * @file utils/sync/SyncFactory.ts
 * @description 同步服务提供商工厂类
 */
import type { AppSettings, SyncProviderType } from "@/types";
import type { ISyncProvider } from "./index";
import { GithubSyncService } from "./GithubSyncService";
import { FeishuSyncService } from "./FeishuSyncService";
import { NotionSyncService } from "./NotionSyncService";

export class SyncFactory {
  /**
   * 根据提供商类型和全局配置，创建对应的同步服务实例
   * @param provider 指定的同步平台
   * @param settings 全局配置
   */
  static createProvider(
    provider: SyncProviderType,
    settings: AppSettings,
  ): ISyncProvider {
    switch (provider) {
      case "github":
        return new GithubSyncService(settings.githubSync);
      case "feishu":
        return new FeishuSyncService(settings.feishuSync);
      case "notion":
        return new NotionSyncService(settings.notionSync);
      case "none":
        throw new Error("当前未开启数据同步服务");
      default:
        throw new Error(`不支持的同步提供商类型: ${provider}`);
    }
  }
}
