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

export const createDefaultTag = (
  name: string = "",
  color: string = "badge-primary",
): TagItem => ({
  id: crypto.randomUUID(),
  name,
  color,
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
