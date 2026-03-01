/**
 * @file utils/githubSync.ts
 * @description Github Gist 数据同步引擎，负责与 Github API 交互
 */
import { localStore, syncStore } from "@/utils/storage";
import { STORAGE_KEYS, DEFAULT_SETTINGS } from "@/config";
import type {
  PromptItem,
  DictionaryItem,
  CategoryItem,
  PlatformItem,
  AIModelItem,
  TagItem,
  AppSettings,
} from "@/types";

// 我们将所有表打包成一个整块的大 JSON 结构进行同步
export interface SyncDataPayload {
  prompts: PromptItem[];
  dictionaries: DictionaryItem[];
  categories: CategoryItem[];
  platforms: PlatformItem[];
  models: AIModelItem[];
  tags: TagItem[];
  timestamp: number; // 同步时间戳
}

const GIST_FILENAME = "promptpark_sync_data.json";
const GITHUB_API_URL = "https://api.github.com/gists";

export const githubSync = {
  /**
   * 获取保存在同步存储中的 Github Token
   */
  async getAuthHeaders() {
    // 👇 加上 || DEFAULT_SETTINGS 明确类型断言
    const settings =
      (await syncStore.get<AppSettings>(STORAGE_KEYS.SETTINGS)) ||
      DEFAULT_SETTINGS;
    if (!settings.githubToken) {
      throw new Error("未配置 Github Token");
    }
    return {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${settings.githubToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
    };
  },

  /**
   * 打包本地所有数据
   */
  async packLocalData(): Promise<SyncDataPayload> {
    const [prompts, dictionaries, categories, platforms, models, tags] =
      await Promise.all([
        localStore.get<PromptItem[]>(STORAGE_KEYS.PROMPTS, []),
        localStore.get<DictionaryItem[]>(STORAGE_KEYS.DICTIONARIES, []),
        localStore.get<CategoryItem[]>(STORAGE_KEYS.CATEGORIES, []),
        localStore.get<PlatformItem[]>(STORAGE_KEYS.PLATFORMS, []),
        localStore.get<AIModelItem[]>(STORAGE_KEYS.MODELS, []),
        localStore.get<TagItem[]>(STORAGE_KEYS.TAGS, []),
      ]);

    return {
      prompts: prompts || [],
      dictionaries: dictionaries || [],
      categories: categories || [],
      platforms: platforms || [],
      models: models || [],
      tags: tags || [],
      timestamp: Date.now(),
    };
  },

  /**
   * 将云端数据解包并覆盖到本地存储
   */
  async unpackToLocal(payload: SyncDataPayload) {
    await Promise.all([
      localStore.set(STORAGE_KEYS.PROMPTS, payload.prompts || []),
      localStore.set(STORAGE_KEYS.DICTIONARIES, payload.dictionaries || []),
      localStore.set(STORAGE_KEYS.CATEGORIES, payload.categories || []),
      localStore.set(STORAGE_KEYS.PLATFORMS, payload.platforms || []),
      localStore.set(STORAGE_KEYS.MODELS, payload.models || []),
      localStore.set(STORAGE_KEYS.TAGS, payload.tags || []),
    ]);
  },

  /**
   * 推送数据到 Github Gist (如果有 Gist ID 则更新，否则创建)
   */
  async pushToCloud(): Promise<string> {
    const settings =
      (await syncStore.get<AppSettings>(STORAGE_KEYS.SETTINGS)) ||
      DEFAULT_SETTINGS;
    const headers = await this.getAuthHeaders();
    const payload = await this.packLocalData();

    const body = {
      description: "PromptPark Data Sync Backup",
      public: false, // 设为私密 Gist
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(payload, null, 2),
        },
      },
    };

    let response;
    // 如果已经有 Gist ID，执行 PATCH 更新
    if (settings.gistId) {
      response = await fetch(`${GITHUB_API_URL}/${settings.gistId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });
    } else {
      // 否则执行 POST 创建全新 Gist
      response = await fetch(GITHUB_API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
    }

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(`同步失败: ${response.status} ${errorMsg}`);
    }

    const data = await response.json();

    // 如果是新建的，需要把返回的 Gist ID 保存到设置里
    if (!settings.gistId && data.id) {
      settings.gistId = data.id;
      await syncStore.set(STORAGE_KEYS.SETTINGS, settings);
    }

    return data.id;
  },

  /**
   * 从 Github Gist 拉取数据覆盖本地
   */
  async pullFromCloud(): Promise<void> {
    const settings =
      (await syncStore.get<AppSettings>(STORAGE_KEYS.SETTINGS)) ||
      DEFAULT_SETTINGS;
    if (!settings.gistId) {
      throw new Error("未配置 Gist ID，无法拉取数据");
    }

    const headers = await this.getAuthHeaders();
    const response = await fetch(`${GITHUB_API_URL}/${settings.gistId}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`拉取失败: ${response.status}`);
    }

    const data = await response.json();
    const fileContent = data.files[GIST_FILENAME]?.content;

    if (!fileContent) {
      throw new Error("云端 Gist 中未找到备份文件");
    }

    const payload = JSON.parse(fileContent) as SyncDataPayload;
    await this.unpackToLocal(payload);
  },

  /**
   * 测试 Token 是否有效
   */
  async testToken(token: string): Promise<boolean> {
    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  },
};
