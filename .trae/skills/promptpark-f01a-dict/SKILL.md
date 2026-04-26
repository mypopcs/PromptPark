---
name: promptpark-f01a-dict
description: 当用户要开发 PromptPark 词典管理功能、词典列表页、词典新建编辑删除、或词典 CRUD 相关代码时触发。
---

# F01a 词典管理

## 本 Session 范围

`src/features/crud/dict/` 目录。不含提示词/标签/同步等逻辑。

## 数据约束

- **主键**：新建时 `id` 必须由 `crypto.randomUUID()` 生成。
- **关联统计**：列表显示时，调用 `db.prompts.where({ dictionaryId }).count()` 实时获取，不存冗余字段。
- **软删除**：执行 `isDeleted = true`，禁止物理删除。
- **列表配置**：防抖引用 `PARAMS.SEARCH_DEBOUNCE`，分页引用 `PARAMS.PAGE_SIZE`。

## UI 规范

- 空状态/分页/二次确认弹窗（确认键红色）必须抽离为基础组件或使用 shadcn-vue。
- 表单提交前：去首尾空格，拦截空名称。