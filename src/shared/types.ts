/**
 * PromptPark 全局类型定义
 * 🔒 冻结文件 · 修改需人工审批
 */

// ─── 主题 ────────────────────────────────────────────────────
export type Theme = "light" | "dark" | "system";

// ─── 注入模式 ─────────────────────────────────────────────────
export type InjectMode = "whitelist" | "global";

// ─── 激活状态 ─────────────────────────────────────────────────
export type ActivationStatus = "active" | "inactive" | "grace" | "expired";

// ─── 数据库实体 ───────────────────────────────────────────────

export interface Dictionary {
  id: string;
  name: string;
  description?: string;
  coverImage?: string; // 字段预留，MVP 不渲染
  isDeleted: boolean;
  createdAt: number; // Unix timestamp ms
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  isDeleted: boolean;
  createdAt: number;
}

export interface Tag {
  id: string;
  name: string;
  isDeleted: boolean;
  createdAt: number;
}

export interface Platform {
  id: string;
  name: string;
  domain: string; // 用于注入范围匹配
  isPreset: boolean;
  isDeleted: boolean;
}

export interface Model {
  id: string;
  platformId: string;
  name: string;
  isPreset: boolean;
  isDeleted: boolean;
}

export interface Prompt {
  id: string;
  dictionaryId: string;
  categoryId: string; // 必填
  tagIds: string[];
  title: string;
  content: string; // 原文
  contentZh?: string; // 中文解释（搜索范围之一）
  note?: string; // 备注（不在搜索范围内）
  image?: string; // GitHub 图床 URL
  sourceUrl?: string; // 采集来源页面 URL
  isDeleted: boolean;
  createdAt: number;
  updatedAt: number;
}

// ─── 消息载荷 ─────────────────────────────────────────────────

export interface CollectTextPayload {
  text: string;
  sourceUrl: string;
}

export interface ThemeChangePayload {
  theme: Theme;
}

export interface OpenDrawerPayload {
  dictionaryId?: string; // 可选：打开时预选某个词典
}

// ─── 通用工具类型 ─────────────────────────────────────────────

export type ID = string;

/** 分页结果 */
export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** 操作结果 */
export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/** 错误日志条目 */
export interface ErrorLogEntry {
  timestamp: number;
  message: string;
  stack?: string;
  context?: string;
}
