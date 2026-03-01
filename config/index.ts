/**
 * @file config/index.ts
 * @description 全局集中配置，包含存储Key、默认设置、常量等
 */
import type { AppSettings } from "@/types";

// 1. 基础信息
export const APP_CONFIG = {
  name: "PromptPark",
  githubRepo: "https://github.com/your-repo/promptpark",
  timeout: 5000,
} as const;

// 2. Chrome Storage Keys (严格防止拼写错误)
export const STORAGE_KEYS = {
  SETTINGS: "pp_settings",
  PROMPTS: "pp_prompts",
  DICTIONARIES: "pp_dictionaries",
  CATEGORIES: "pp_categories",
  TAGS: "pp_tags",
  PLATFORMS: "pp_platforms",
  MODELS: "pp_models",
} as const;

const emptyTableMapping = {
  promptsTableId: "",
  dictionariesTableId: "",
  categoriesTableId: "",
  platformsTableId: "",
  modelsTableId: "",
  tagsTableId: "",
};

// 3. 默认设置
export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  locale: "zh-CN",
  syncProvider: "none",
  imageHostProvider: "none",

  githubSync: { token: "", gistId: "" },
  feishuSync: {
    appId: "",
    appSecret: "",
    appToken: "",
    mapping: { ...emptyTableMapping },
  },
  notionSync: { token: "", mapping: { ...emptyTableMapping } },
  githubImageHost: { token: "", repo: "", branch: "main", path: "uploads/" },
};

// 4. 主题配置选项
export const THEME_OPTIONS = [
  { label: "浅色", value: "light", daisyTheme: "light" },
  { label: "深色", value: "dark", daisyTheme: "dark" },
  { label: "跟随系统", value: "system", daisyTheme: "auto" },
] as const;

// 5. 环境变量辅助
export const isDev = import.meta.env?.DEV ?? false;
export const isProd = import.meta.env?.PROD ?? true;
