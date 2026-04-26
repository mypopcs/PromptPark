---
name: promptpark-f01b-prompt
description: 当用户要开发 PromptPark 提示词管理功能、提示词列表、提示词新建编辑、提示词与分类标签的关联关系时触发。
---

# F01b 提示词管理

## 本 Session 范围

`src/features/crud/prompt/` 目录。依赖 F01a 与 F01c。

## 数据关系与约束 (Dexie NoSQL 模式)

- **分类 (必填)**：存入 `categoryId` (String)。
- **标签 (选填/多选)**：存入 `tagIds: string[]`。**严禁创建 PromptTag 关联表**，直接利用 Dexie 的 `*tagIds` 多值索引查询。
- **主键**：新建 `id` 使用 `crypto.randomUUID()`。
- **搜索范围**：原文 + 中文解释（排除 note 备注），防抖 `PARAMS.SEARCH_DEBOUNCE`。

## UI 规范

- 标签选择必须使用 shadcn-vue 的 Combobox（支持多选）。
- 卡片展示剥离为独立组件。软删除需红色二次确认。