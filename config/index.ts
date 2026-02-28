/**
 * PromptPark 全局配置中心。
 * 说明：
 * 1. 所有可配置项必须集中维护，禁止在业务代码中硬编码。
 * 2. 本文件同时兼容历史字段（如 AppConfig.api.feishu）。
 */

/** 运行环境类型 */
export type RuntimeEnv = "development" | "staging" | "production";

/** API 配置结构 */
export interface ApiEndpointConfig {
  /** 飞书 API 基础地址 */
  feishuBaseUrl: string;
  /** GitHub API 基础地址 */
  githubBaseUrl: string;
}

/** 主题配置结构 */
export interface ThemeConfig {
  /** 默认主题 */
  defaultTheme: "light" | "dark";
  /** 支持的主题列表 */
  availableThemes: Array<"light" | "dark" | "promptpark">;
}

/**
 * 根据 Vite 模式返回当前运行环境。
 */
export function getRuntimeEnv(): RuntimeEnv {
  const mode = (typeof process !== "undefined" ? process.env.NODE_ENV : "development") ?? "development";
  if (mode === "production") {
    return "production";
  }
  if (mode === "staging") {
    return "staging";
  }
  return "development";
}

/**
 * 按环境读取 API 地址。
 */
export function getApiConfig(env: RuntimeEnv = getRuntimeEnv()): ApiEndpointConfig {
  const apiMap: Record<RuntimeEnv, ApiEndpointConfig> = {
    development: {
      feishuBaseUrl: "https://open.feishu.cn/open-apis",
      githubBaseUrl: "https://api.github.com"
    },
    staging: {
      feishuBaseUrl: "https://open.feishu.cn/open-apis",
      githubBaseUrl: "https://api.github.com"
    },
    production: {
      feishuBaseUrl: "https://open.feishu.cn/open-apis",
      githubBaseUrl: "https://api.github.com"
    }
  };
  return apiMap[env];
}

/**
 * 全局应用配置。
 */
export const AppConfig = {
  info: {
    name: "PromptPark",
    version: "1.0.0",
    description: "助力AI提示词私有化的效率工具，便捷采集、管理和组合使用提示词",
    author: "PromptPark Team"
  },

  storageKeys: {
    SETTINGS: "local:app_settings",
    DICTIONARIES: "local:data_dictionaries",
    CATEGORIES: "local:data_categories",
    PROMPTS: "local:data_prompts",
    TAGS: "local:data_tags",
    PLATFORMS: "local:data_platforms",
    MODELS: "local:data_models",
    CURRENT_DICT_ID: "local:ui_current_dict",
    UI_THEME: "local:ui_theme",
    UI_LOCALE: "local:ui_locale"
  },

  defaultSettings: {
    syncInterval: 3600,
    enableAutoSync: false,
    syncOnStartup: true,
    language: "zh-CN" as const,
    theme: "light" as const
  },

  /** 兼容历史调用方式 */
  api: {
    feishu: {
      baseUrl: getApiConfig().feishuBaseUrl,
      authPath: "/auth/v3/tenant_access_token/internal",
      bitablePath: "/bitable/v1/apps"
    },
    github: {
      apiBaseUrl: getApiConfig().githubBaseUrl,
      uploadPath: "/repos/{owner}/{repo}/contents/{path}"
    }
  },

  theme: {
    defaultTheme: "light",
    availableThemes: ["light", "dark", "promptpark"]
  } as ThemeConfig,

  ui: {
    drawerWidth: "400px",
    toastDuration: 3000,
    gridCols: 3
  }
};
