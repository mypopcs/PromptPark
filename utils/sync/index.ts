/**
 * @file utils/sync/index.ts
 * @description 同步引擎抽象接口与工厂 (Strategy & Factory Pattern)
 */
import type {
  PromptItem,
  DictionaryItem,
  CategoryItem,
  PlatformItem,
  AIModelItem,
  TagItem,
} from "@/types";

// 统一的本地数据载体
export interface SyncDataPayload {
  prompts: PromptItem[];
  dictionaries: DictionaryItem[];
  categories: CategoryItem[];
  platforms: PlatformItem[];
  models: AIModelItem[];
  tags: TagItem[];
  timestamp: number;
}

/**
 * 核心策略接口：所有同步提供商（Github, 飞书, Notion）都必须实现此标准
 */
export interface ISyncProvider {
  /**
   * 测试连通性或凭证有效性
   */
  testConnection(): Promise<boolean>;

  /**
   * 将本地完整数据推送到云端 (覆盖或合并)
   */
  pushData(payload: SyncDataPayload): Promise<void | string>;

  /**
   * 从云端拉取完整数据
   */
  pullData(): Promise<SyncDataPayload>;

  /**
   * 【单点写入预留】专为您提到的“公开反馈表单”等单条记录提交设计
   * @param tableName 表标识
   * @param record 单条数据记录
   */
  insertRecord?(tableName: string, record: any): Promise<boolean>;
}
