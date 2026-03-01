/**
 * @file config/index.ts
 * @description 全局集中配置，包含存储Key、默认设置、常量等
 */
import type { AppSettings } from "@/types";

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
// 🌟 开发者私有的反馈接收配置 (硬编码，不随用户设置改变)
export const DEVELOPER_FEEDBACK_CONFIG = {
  appId: "cli_xxxxxxxxxxxx", // 你的飞书应用 ID
  appSecret: "xxxxxxxxxxxxxxxx", // 你的飞书应用 Secret
  appToken: "bascnxxxxxxxxxxxx", // 你的反馈多维表格 Token
  tableId: "tblxxxxxx", // 你的反馈数据表 ID
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
