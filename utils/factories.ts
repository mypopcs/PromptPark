/**
 * @file utils/factories.ts
 * @description 全局实体工厂：负责生成带有默认值和唯一 ID 的标准数据结构，贯彻 DRY 原则
 */
import type {
  DictionaryItem,
  CategoryItem,
  PlatformItem,
  AIModelItem,
  TagItem,
  PromptItem,
} from "@/types";

export const createDefaultDictionary = (): DictionaryItem => ({
  id: crypto.randomUUID(),
  name: "",
  description: "",
  coverImage: "",
  isOfficialRecommended: false,
  price: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  categoryCount: 0,
  promptCount: 0,
});

export const createDefaultCategory = (
  dictionaryId: string = "",
  name: string = "",
): CategoryItem => ({
  id: crypto.randomUUID(),
  dictionaryId,
  name,
  createdAt: Date.now(),
  promptCount: 0,
});

export const createDefaultPlatform = (): PlatformItem => ({
  id: crypto.randomUUID(),
  name: "",
  createdAt: Date.now(),
  modelCount: 0,
  promptCount: 0,
});

export const createDefaultModel = (
  platformId: string = "",
  name: string = "",
): AIModelItem => ({
  id: crypto.randomUUID(),
  platformId,
  name,
  createdAt: Date.now(),
  promptCount: 0,
});

// 🌟 新增：高级柔和色 (莫兰迪色系) 生成器
const generatePastelColor = () => {
  const h = Math.floor(Math.random() * 360); // 随机色相 0-360
  const s = Math.floor(Math.random() * 20) + 60; // 饱和度控制在 60%-80%
  const l = Math.floor(Math.random() * 10) + 65; // 亮度控制在 65%-75% (保证文字可读性)
  return `hsl(${h}, ${s}%, ${l}%)`;
};

export const createDefaultTag = (
  name: string = "",
  color: string = "",
): TagItem => ({
  id: crypto.randomUUID(),
  name,
  // 如果没有传入颜色，自动生成一个绝美的高级颜色
  color: color || generatePastelColor(),
  createdAt: Date.now(),
  promptCount: 0,
});

export const createDefaultPrompt = (): PromptItem => ({
  id: crypto.randomUUID(),
  dictionaryId: "",
  categoryId: "",
  prompt: "",
  translation: "",
  notes: "",
  tags: [],
  platforms: [],
  models: [],
  useCount: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});
