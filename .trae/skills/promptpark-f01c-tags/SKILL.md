---
name: promptpark-f01c-tags
description: 当用户要开发 PromptPark 分类管理、标签管理、分类标签的全局共享逻辑时触发。
---

# F01c 分类与标签管理

## 本 Session 范围

`src/features/crud/category/` 和 `src/features/crud/tag/` 目录。全局共享资源。

## 数据约束

- **主键**：`crypto.randomUUID()`。
- **引用保护**：删除前必须查 `db.prompts`。若有提示词正在使用（count > 0），阻断删除并 Toast 提示用户“请先解除关联”。
- **重名校验**：入库前查询名称是否存在（忽略大小写），同类型不允许重名。
- **软删除**：`isDeleted = true`。