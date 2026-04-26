/**
 * 🟢 Storage Keys 全局字典
 * 冻结文件：所有写入 browser.storage 的键名必须从这里获取，防止拼写错误
 */
export const STORAGE_KEYS = {
  /** 主题模式 (light/dark/system) */
  THEME: "theme",
  /** 序列号原始值 */
  LICENSE_RAW: "licenseRaw",
  /** 激活状态 */
  ACTIVATION_STATUS: "activationStatus",
  /** 最后一次成功心跳验证的时间戳 */
  LAST_HEARTBEAT: "lastHeartbeat",

  /** 开发者飞书租户 Token（用于序列号验证，极高风险） */
  DEV_TENANT_TOKEN: "devTenantToken",
  /** 用户飞书租户 Token（用于用户自有数据同步） */
  USER_TENANT_TOKEN: "userTenantToken",
  /** GitHub 个人访问令牌（用于图床） */
  GITHUB_TOKEN: "githubToken",

  /** 飞书 App 凭据（用户级） */
  USER_APP_ID: "userAppId",
  USER_APP_SECRET: "userAppSecret",
  USER_APP_TOKEN: "userAppToken",
  /** 飞书多维表格 ID 映射表 */
  TABLE_IDS: "tableIds",

  /** 注入模式：白名单(whitelist) 或 全局(global) */
  INJECT_MODE: "injectMode",
  /** 全局注入模式下的黑名单域名列表 */
  BLACKLIST: "blacklist",
  /** 侧边抽屉的用户自定义宽度 */
  DRAWER_WIDTH: "drawerWidth",

  /** GitHub 图床配置 */
  GITHUB_REPO: "githubRepo",
  GITHUB_BRANCH: "githubBranch",
  /** 同步锁（防止并发触发同步导致数据错乱） */
  SYNC_LOCK: "syncLock",
} as const;

/** 提取 Value 的联合类型，方便 TypeScript 类型校验 */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
