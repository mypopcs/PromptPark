import { storage } from "@wxt-dev/storage";
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
  const settings = await storage.getItem<AppSettings>(
    AppConfig.storageKeys.SETTINGS as any,
  );
  return settings || defaultSettings;
}

/**
 * 保存插件全局配置
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  await storage.setItem(AppConfig.storageKeys.SETTINGS as any, settings);
}

/**
 * 获取所有提示词典
 */
export async function getDictionaries(): Promise<Dictionary[]> {
  console.log("🔍 开始获取词典数据");
  const storageKey = AppConfig.storageKeys.DICTIONARIES as any;
  console.log("🔍 存储键:", storageKey);
  const dicts = await storage.getItem<Dictionary[]>(storageKey);
  console.log("🔍 从存储中获取的数据:", dicts);
  const result = dicts || [];
  console.log("🔍 返回的数据:", result);
  return result;
}

/**
 * 保存提示词典列表
 */
export async function saveDictionaries(
  dictionaries: Dictionary[],
): Promise<void> {
  console.log("💾 开始保存词典数据");
  const storageKey = AppConfig.storageKeys.DICTIONARIES as any;
  console.log("💾 存储键:", storageKey);
  console.log("💾 要保存的数据:", dictionaries);
  // 将 Proxy 对象转换为普通数组，确保数据能正确保存
  const plainDictionaries = JSON.parse(JSON.stringify(dictionaries));
  console.log("💾 转换后的普通数组:", plainDictionaries);
  await storage.setItem(storageKey, plainDictionaries);
  console.log("💾 保存完成");
}

/**
 * 获取所有提示词分类
 */
export async function getCategories(): Promise<Category[]> {
  const categories = await storage.getItem<Category[]>(
    AppConfig.storageKeys.CATEGORIES as any,
  );
  return categories || [];
}

/**
 * 保存提示词分类列表
 */
export async function saveCategories(categories: Category[]): Promise<void> {
  console.log("💾 开始保存分类数据");
  const storageKey = AppConfig.storageKeys.CATEGORIES as any;
  console.log("💾 存储键:", storageKey);
  console.log("💾 要保存的数据:", categories);
  // 将 Proxy 对象转换为普通数组，确保数据能正确保存
  const plainCategories = JSON.parse(JSON.stringify(categories));
  console.log("💾 转换后的普通数组:", plainCategories);
  await storage.setItem(storageKey, plainCategories);
  console.log("💾 保存完成");
}

/**
 * 获取所有提示词
 */
export async function getPrompts(): Promise<Prompt[]> {
  const prompts = await storage.getItem<Prompt[]>(
    AppConfig.storageKeys.PROMPTS as any,
  );
  return prompts || [];
}

/**
 * 保存提示词列表
 */
export async function savePrompts(prompts: Prompt[]): Promise<void> {
  console.log("💾 开始保存提示词数据");
  const storageKey = AppConfig.storageKeys.PROMPTS as any;
  console.log("💾 存储键:", storageKey);
  console.log("💾 要保存的数据:", prompts);
  // 将 Proxy 对象转换为普通数组，确保数据能正确保存
  const plainPrompts = JSON.parse(JSON.stringify(prompts));
  console.log("💾 转换后的普通数组:", plainPrompts);
  await storage.setItem(storageKey, plainPrompts);
  console.log("💾 保存完成");
}

/**
 * 获取/保存 当前选中的词典 ID (用于抽屉组件的记忆)
 */
export async function getCurrentDictionaryId(): Promise<string | null> {
  return await storage.getItem<string>(
    AppConfig.storageKeys.CURRENT_DICT_ID as any,
  );
}

export async function saveCurrentDictionaryId(id: string): Promise<void> {
  await storage.setItem(AppConfig.storageKeys.CURRENT_DICT_ID as any, id);
}

// 注：标签 (Tags)、平台 (Platforms)、模型 (Models) 的存取逻辑同理，
// 为了保持代码简洁，我们在后续具体开发对应模块时，可根据需要继续在此文件补充。
// utils/storage.ts 补全部分

/** 获取/保存 标签 */
export async function getTags(): Promise<PromptTag[]> {
  console.log("🔍 开始获取标签数据");
  const storageKey = AppConfig.storageKeys.TAGS as any;
  console.log("🔍 存储键:", storageKey);
  const data = await storage.getItem<PromptTag[]>(storageKey);
  console.log("🔍 从存储中获取的数据:", data);
  const result = data || [];
  console.log("🔍 返回的数据:", result);
  return result;
}
export async function saveTags(tags: PromptTag[]): Promise<void> {
  console.log("💾 开始保存标签数据");
  const storageKey = AppConfig.storageKeys.TAGS as any;
  console.log("💾 存储键:", storageKey);
  console.log("💾 要保存的数据:", tags);
  // 将 Proxy 对象转换为普通数组，确保数据能正确保存
  const plainTags = JSON.parse(JSON.stringify(tags));
  console.log("💾 转换后的普通数组:", plainTags);
  await storage.setItem(storageKey, plainTags);
  console.log("💾 保存完成");
}

/** 获取/保存 平台 */
export async function getPlatforms(): Promise<AIPlatform[]> {
  console.log("🔍 开始获取平台数据");
  const storageKey = AppConfig.storageKeys.PLATFORMS as any;
  console.log("🔍 存储键:", storageKey);
  const data = await storage.getItem<AIPlatform[]>(storageKey);
  console.log("🔍 从存储中获取的数据:", data);
  const result = data || [];
  console.log("🔍 返回的数据:", result);
  return result;
}
export async function savePlatforms(platforms: AIPlatform[]): Promise<void> {
  console.log("💾 开始保存平台数据");
  const storageKey = AppConfig.storageKeys.PLATFORMS as any;
  console.log("💾 存储键:", storageKey);
  console.log("💾 要保存的数据:", platforms);
  // 将 Proxy 对象转换为普通数组，确保数据能正确保存
  const plainPlatforms = JSON.parse(JSON.stringify(platforms));
  console.log("💾 转换后的普通数组:", plainPlatforms);
  await storage.setItem(storageKey, plainPlatforms);
  console.log("💾 保存完成");
}

/** 获取/保存 模型 */
export async function getModels(): Promise<AIModel[]> {
  console.log("🔍 开始获取模型数据");
  const storageKey = AppConfig.storageKeys.MODELS as any;
  console.log("🔍 存储键:", storageKey);
  const data = await storage.getItem<AIModel[]>(storageKey);
  console.log("🔍 从存储中获取的数据:", data);
  const result = data || [];
  console.log("🔍 返回的数据:", result);
  return result;
}
export async function saveModels(models: AIModel[]): Promise<void> {
  console.log("💾 开始保存模型数据");
  const storageKey = AppConfig.storageKeys.MODELS as any;
  console.log("💾 存储键:", storageKey);
  console.log("💾 要保存的数据:", models);
  // 将 Proxy 对象转换为普通数组，确保数据能正确保存
  const plainModels = JSON.parse(JSON.stringify(models));
  console.log("💾 转换后的普通数组:", plainModels);
  await storage.setItem(storageKey, plainModels);
  console.log("💾 保存完成");
}
