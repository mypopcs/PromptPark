/**
 * @file types/index.ts
 * @description 全局核心类型定义（基于商业级关系型数据模型重构）
 */

// ==========================================
// 1. 核心业务模型 (实体定义)
// ==========================================

/** * 词典模型 (Dictionary)
 */
export interface DictionaryItem {
  id: string;
  name: string; // 词典名
  description?: string; // 词典描述
  coverImage?: string; // 词典封面图
  isOfficialRecommended: boolean; // 是否为官方推荐词典
  price: number; // 销售价格
  createdAt: number; // 创建时间
  updatedAt: number; // 更新时间

  // 关联冗余字段 (前端展示用，通常在增删改时动态维护)
  categoryCount: number; // 下属分类数量
  promptCount: number; // 下属提示词数量
}

/** * 提示词分类模型 (Category) - 隶属于词典
 */
export interface CategoryItem {
  id: string;
  dictionaryId: string; // 绑定的词典 ID
  name: string; // 分类名
  createdAt: number;

  promptCount: number; // 下属提示词数量
}

/** * 适用平台模型 (Platform)
 */
export interface PlatformItem {
  id: string;
  name: string; // 平台名
  createdAt: number;
  modelCount: number; // 下属模型数量
  promptCount: number; // 下属提示词数量
}

/** * 适用模型 (Model) - 隶属于平台
 */
export interface AIModelItem {
  id: string;
  platformId: string; // 绑定的平台 ID
  name: string; // 模型名
  createdAt: number;

  promptCount: number; // 下属提示词数量
}

/** * 标签模型 (Tag)
 */
export interface TagItem {
  id: string;
  name: string; // 标签名
  color?: string; // 标签颜色
  createdAt: number;

  promptCount: number; // 关联提示词数量
}

/** * 提示词核心模型 (Prompt)
 */
export interface PromptItem {
  id: string;
  dictionaryId: string; // 所属词典 ID
  categoryId: string; // 所属分类 ID

  prompt: string; // 提示词内容
  translation: string; // 中文解释
  notes?: string; // 备注
  thumbnail?: string; // 缩略图

  // 关联列表 (存储 ID 数组)
  tags: string[]; // 标签 ID 列表 (至少1个)
  platforms: string[]; // 适用平台 ID 列表
  models: string[]; // 适用模型 ID 列表

  useCount: number; // 提示词使用次数(被用于抽屉组合后一键复制的次数)

  createdAt: number; // 创建时间
  updatedAt: number; // 更新时间

  // ================= 预留迭代字段 =================
  viewCount?: number; // 提示词查看次数
  favoriteCount?: number; // 提示词收藏次数
  isOfficialAdopted?: boolean; // 官方采用（是否被官方采用，默认否）
}

// ==========================================
// 2. 插件配置与状态模型 (保持不变)
// ==========================================
export type ThemeType = "light" | "dark" | "system";
export type LocaleType = "zh-CN" | "en-US";

export interface AppSettings {
  theme: ThemeType;
  locale: LocaleType;
  syncEnabled: boolean;
  githubToken?: string;
  gistId?: string;
}

// ==========================================
// 3. 消息通信模型 (保持不变)
// ==========================================
export enum MessageAction {
  SYNC_DATA = "SYNC_DATA",
  GET_PROMPT = "GET_PROMPT",
  SAVE_PROMPT = "SAVE_PROMPT",
  NOTIFY_CONTENT = "NOTIFY_CONTENT",
}

export interface MessagePayload<T = unknown> {
  action: MessageAction;
  data?: T;
}

// ==========================================
// 4. UI 组件专用类型 (保持不变)
// ==========================================
export interface TableSortOption<T> {
  key: keyof T;
  order: "asc" | "desc" | null;
}
