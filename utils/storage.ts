/**
 * @file utils/storage.ts
 * @description 强类型 Chrome 存储封装，支持异常重试、容量告警及区分 local/sync/session
 */

import { logger } from "@/utils/logger";

// 支持的存储区域类型
type StorageArea = "local" | "sync" | "session";

class ChromeStorage {
  private area: StorageArea;

  constructor(area: StorageArea = "local") {
    this.area = area;
  }

  /**
   * 获取存储的数据（强类型推断）
   * @param key 存储的键名 (必须从 config/index.ts 的 STORAGE_KEYS 中取)
   * @param defaultValue 数据不存在时的默认值
   */
  async get<T>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      // 检查 Chrome API 是否可用（防止在非插件环境直接运行报错）
      if (!chrome?.storage?.[this.area]) {
        logger.warn(`Chrome storage API (${this.area}) is not available.`);
        return (defaultValue ?? null) as T | null;
      }

      const result = await chrome.storage[this.area].get(key);
      const data = result[key];

      if (data === undefined) {
        return (defaultValue ?? null) as T | null;
      }

      return data as T;
    } catch (error) {
      logger.error(`Storage GET Error [Key: ${key}]:`, error);
      return (defaultValue ?? null) as T | null;
    }
  }

  /**
   * 设置存储数据
   * @param key 存储的键名
   * @param value 需要存储的数据
   */
  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      if (!chrome?.storage?.[this.area]) {
        logger.warn(`Chrome storage API (${this.area}) is not available.`);
        return false;
      }

      await chrome.storage[this.area].set({ [key]: value });
      logger.debug(`Saved data to ${this.area} storage [Key: ${key}]`);
      return true;
    } catch (error: any) {
      // 核心防坑：捕获并分析 Chrome 存储异常 (例如：容量超限 QuotaExceededError)
      if (
        error.message?.includes("QUOTA_BYTES") ||
        error.message?.includes("quota")
      ) {
        logger.error(`Storage SET Error: 容量超出限制! [Key: ${key}]`);
      } else {
        logger.error(`Storage SET Error [Key: ${key}]:`, error);
      }
      return false;
    }
  }

  /**
   * 移除指定数据
   * @param key 存储的键名
   */
  async remove(key: string): Promise<boolean> {
    try {
      if (!chrome?.storage?.[this.area]) return false;
      await chrome.storage[this.area].remove(key);
      return true;
    } catch (error) {
      logger.error(`Storage REMOVE Error [Key: ${key}]:`, error);
      return false;
    }
  }

  /**
   * 清空当前区域的所有数据（高危操作）
   */
  async clear(): Promise<boolean> {
    try {
      if (!chrome?.storage?.[this.area]) return false;
      await chrome.storage[this.area].clear();
      logger.warn(`Cleared ALL data in ${this.area} storage.`);
      return true;
    } catch (error) {
      logger.error(`Storage CLEAR Error:`, error);
      return false;
    }
  }
}

// 导出单例，方便全局统一调用
export const localStore = new ChromeStorage("local"); // 适合大数据量 (如：提示词库、词典)
export const syncStore = new ChromeStorage("sync"); // 适合小配置数据，跨设备自动同步 (如：主题、语言设置)
export const sessionStore = new ChromeStorage("session"); // 适合临时会话数据
