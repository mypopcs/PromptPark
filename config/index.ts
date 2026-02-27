/**
 * PromptPark 全局配置中心
 * 用于集中管理插件的基础信息、存储键名、默认设置以及外部 API 链接。
 * 严禁在其他业务代码中硬编码这些魔法字符串。
 */

export const AppConfig = {
  // 插件基础信息 (将用于 WXT manifest 生成和 UI 展示)
  info: {
    name: "PromptPark",
    version: "1.0.0",
    description: "助力AI提示词私有化的效率工具，便捷采集、管理和组合使用提示词",
  },

  // 统一管理的本地存储 Key (配合 @wxt-dev/storage 使用)
  storageKeys: {
    SETTINGS: "local:app_settings", // 插件全局设置
    DICTIONARIES: "local:data_dictionaries", // 词典数据
    CATEGORIES: "local:data_categories", // 分类数据
    PROMPTS: "local:data_prompts", // 提示词数据
    TAGS: "local:data_tags", // 标签数据
    PLATFORMS: "local:data_platforms", // 平台数据
    MODELS: "local:data_models", // 模型数据
    CURRENT_DICT_ID: "local:ui_current_dict", // UI状态：当前选中的词典ID
  },

  // 默认全局设置项
  defaultSettings: {
    syncInterval: 3600, // 默认同步间隔（秒），1小时
    enableAutoSync: false, // 默认关闭自动同步
    syncOnStartup: true, // 默认启动时尝试同步
    language: "zh-CN" as const, // 默认中文
    theme: "light" as const, // 默认明亮模式
  },

  // 外部 API 与链接配置
  api: {
    feishu: {
      baseUrl: "https://open.feishu.cn/open-apis",
      authPath: "/auth/v3/tenant_access_token/internal",
      bitablePath: "/bitable/v1/apps",
    },
    github: {
      apiBaseUrl: "https://api.github.com",
      uploadPath: "/repos/{owner}/{repo}/contents/{path}", // 动态替换参数
    },
  },

  // UI 交互相关常量
  ui: {
    drawerWidth: "400px", // Content Drawer 抽屉的默认宽度
    toastDuration: 3000, // 提示信息默认展示时长 (毫秒)
    gridCols: 3, // 提示词展示默认列数
  },
};
