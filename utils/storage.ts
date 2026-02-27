import { browser } from "wxt/browser";
import { AppConfig } from "@/config";
import type {
  AppSettings,
  Dictionary,
  Category,
  Prompt,
  PromptTag,
  AIPlatform,
  AIModel,
} from "@/types";

/** 存储键前缀 */
const STORAGE_PREFIX = "local:";

/** 获取存储键（移除 local: 前缀） */
function getStorageKey(key: string): string {
  return key.replace(STORAGE_PREFIX, "");
}

/**
 * 获取插件全局配置
 * 如果本地没有存储，则返回默认的空配置
 */
export async function getSettings(): Promise<AppSettings> {
  const defaultSettings: AppSettings = {
    feishu: {
      appId: "",
      appSecret: "",
      bitableId: "",
      tableId: "",
      wikiNodeId: "",
    },
    github: { token: "", owner: "", repo: "", path: "" },
    ...AppConfig.defaultSettings,
  };
  const key = getStorageKey(AppConfig.storageKeys.SETTINGS);
  const result = await browser.storage.local.get(key);
  return (result[key] as AppSettings) || defaultSettings;
}

/**
 * 保存插件全局配置
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  const key = getStorageKey(AppConfig.storageKeys.SETTINGS);
  await browser.storage.local.set({ [key]: settings });
}

/**
 * 获取所有提示词典
 */
export async function getDictionaries(): Promise<Dictionary[]> {
  console.log("🔍 开始获取词典数据");
  const key = getStorageKey(AppConfig.storageKeys.DICTIONARIES);
  console.log("🔍 存储键:", key);
  const result = await browser.storage.local.get(key);
  const dicts = result[key] as Dictionary[] | undefined;
  console.log("🔍 从存储中获取的数据:", dicts);
  const returnResult = dicts || [];
  console.log("🔍 返回的数据:", returnResult);
  return returnResult;
}

/**
 * 保存提示词典列表
 */
export async function saveDictionaries(
  dictionaries: Dictionary[],
): Promise<void> {
  console.log("💾 开始保存词典数据");
  const key = getStorageKey(AppConfig.storageKeys.DICTIONARIES);
  console.log("💾 存储键:", key);
  console.log("💾 要保存的数据:", dictionaries);
  // 将 Proxy 对象转换为普通数组，确保数据能正确保存
  const plainDictionaries = JSON.parse(JSON.stringify(dictionaries));
  console.log("💾 转换后的普通数组:", plainDictionaries);
  await browser.storage.local.set({ [key]: plainDictionaries });
  console.log("💾 保存完成");
}

/**
 * 获取所有提示词分类
 */
export async function getCategories(): Promise<Category[]> {
  const key = getStorageKey(AppConfig.storageKeys.CATEGORIES);
  const result = await browser.storage.local.get(key);
  return (result[key] as Category[]) || [];
}

/**
 * 保存提示词分类列表
 */
export async function saveCategories(categories: Category[]): Promise<void> {
  console.log("💾 开始保存分类数据");
  const key = getStorageKey(AppConfig.storageKeys.CATEGORIES);
  console.log("💾 存储键:", key);
  console.log("💾 要保存的数据:", categories);
  // 将 Proxy 对象转换为普通数组，确保数据能正确保存
  const plainCategories = JSON.parse(JSON.stringify(categories));
  console.log("💾 转换后的普通数组:", plainCategories);
  await browser.storage.local.set({ [key]: plainCategories });
  console.log("💾 保存完成");
}

/**
 * 获取所有提示词
 */
export async function getPrompts(): Promise<Prompt[]> {
  const key = getStorageKey(AppConfig.storageKeys.PROMPTS);
  const result = await browser.storage.local.get(key);
  return (result[key] as Prompt[]) || [];
}

/**
 * 保存提示词列表
 */
export async function savePrompts(prompts: Prompt[]): Promise<void> {
  console.log("💾 开始保存提示词数据");
  const key = getStorageKey(AppConfig.storageKeys.PROMPTS);
  console.log("💾 存储键:", key);
  console.log("💾 要保存的数据:", prompts);
  // 将 Proxy 对象转换为普通数组，确保数据能正确保存
  const plainPrompts = JSON.parse(JSON.stringify(prompts));
  console.log("💾 转换后的普通数组:", plainPrompts);
  await browser.storage.local.set({ [key]: plainPrompts });
  console.log("💾 保存完成");
}

/**
 * 获取/保存 当前选中的词典 ID (用于抽屉组件的记忆)
 */
export async function getCurrentDictionaryId(): Promise<string | null> {
  const key = getStorageKey(AppConfig.storageKeys.CURRENT_DICT_ID);
  const result = await browser.storage.local.get(key);
  return (result[key] as string) || null;
}

export async function saveCurrentDictionaryId(id: string): Promise<void> {
  const key = getStorageKey(AppConfig.storageKeys.CURRENT_DICT_ID);
  await browser.storage.local.set({ [key]: id });
}

// 注：标签 (Tags)、平台 (Platforms)、模型 (Models) 的存取逻辑同理，
// 为了保持代码简洁，我们在后续具体开发对应模块时，可根据需要继续在此文件补充。
// utils/storage.ts 补全部分

/** 获取/保存 标签 */
export async function getTags(): Promise<PromptTag[]> {
  console.log("🔍 开始获取标签数据");
  const key = getStorageKey(AppConfig.storageKeys.TAGS);
  console.log("🔍 存储键:", key);
  const result = await browser.storage.local.get(key);
  const data = result[key] as PromptTag[] | undefined;
  console.log("🔍 从存储中获取的数据:", data);
  const returnResult = data || [];
  console.log("🔍 返回的数据:", returnResult);
  return returnResult;
}
export async function saveTags(tags: PromptTag[]): Promise<void> {
  console.log("💾 开始保存标签数据");
  const key = getStorageKey(AppConfig.storageKeys.TAGS);
  console.log("💾 存储键:", key);
  console.log("💾 要保存的数据:", tags);
  // 将 Proxy 对象转换为普通数组，确保数据能正确保存
  const plainTags = JSON.parse(JSON.stringify(tags));
  console.log("💾 转换后的普通数组:", plainTags);
  await browser.storage.local.set({ [key]: plainTags });
  console.log("💾 保存完成");
}

/** 获取/保存 平台 */
export async function getPlatforms(): Promise<AIPlatform[]> {
  console.log("🔍 开始获取平台数据");
  const key = getStorageKey(AppConfig.storageKeys.PLATFORMS);
  console.log("🔍 存储键:", key);
  const result = await browser.storage.local.get(key);
  const data = result[key] as AIPlatform[] | undefined;
  console.log("🔍 从存储中获取的数据:", data);
  const returnResult = data || [];
  console.log("🔍 返回的数据:", returnResult);
  return returnResult;
}
export async function savePlatforms(platforms: AIPlatform[]): Promise<void> {
  console.log("💾 开始保存平台数据");
  const key = getStorageKey(AppConfig.storageKeys.PLATFORMS);
  console.log("💾 存储键:", key);
  console.log("💾 要保存的数据:", platforms);
  // 将 Proxy 对象转换为普通数组，确保数据能正确保存
  const plainPlatforms = JSON.parse(JSON.stringify(platforms));
  console.log("💾 转换后的普通数组:", plainPlatforms);
  await browser.storage.local.set({ [key]: plainPlatforms });
  console.log("💾 保存完成");
}

/** 获取/保存 模型 */
export async function getModels(): Promise<AIModel[]> {
  console.log("🔍 开始获取模型数据");
  const key = getStorageKey(AppConfig.storageKeys.MODELS);
  console.log("🔍 存储键:", key);
  const result = await browser.storage.local.get(key);
  const data = result[key] as AIModel[] | undefined;
  console.log("🔍 从存储中获取的数据:", data);
  const returnResult = data || [];
  console.log("🔍 返回的数据:", returnResult);
  return returnResult;
}
export async function saveModels(models: AIModel[]): Promise<void> {
  console.log("💾 开始保存模型数据");
  const key = getStorageKey(AppConfig.storageKeys.MODELS);
  console.log("💾 存储键:", key);
  console.log("💾 要保存的数据:", models);
  // 将 Proxy 对象转换为普通数组，确保数据能正确保存
  const plainModels = JSON.parse(JSON.stringify(models));
  console.log("💾 转换后的普通数组:", plainModels);
  await browser.storage.local.set({ [key]: plainModels });
  console.log("💾 保存完成");
}
