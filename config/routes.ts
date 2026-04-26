/**
 * 🟢 路由路径常量
 * 冻结文件：控制 Options/全屏管理页的路由跳转
 */
export const ROUTES = {
  /** 仪表盘主页 */
  HOME: "/",
  /** 词典管理（最外层容器） */
  DICTIONARIES: "/dictionaries",
  /** 提示词列表页 */
  PROMPTS: "/prompts",
  /** 分类管理 */
  CATEGORIES: "/categories",
  /** 标签管理 */
  TAGS: "/tags",
  /** 平台与模型配置 */
  PLATFORMS: "/platforms",
  /** 数据同步中心（飞书） */
  SYNC: "/sync",
  /** 导入导出与备份 */
  BACKUP: "/backup",
  /** 许可证激活页 */
  ACTIVATION: "/activation",
  /** 注入黑白名单控制 */
  INJECT_CONTROL: "/inject-control",
  /** 偏好设置 */
  SETTINGS: "/settings",
} as const;
