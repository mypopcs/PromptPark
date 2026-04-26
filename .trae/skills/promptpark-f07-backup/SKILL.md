---
name: promptpark-f07-backup
description: 当用户要开发 PromptPark 数据备份、导出 JSON、导入 JSON、数据恢复功能时触发。
---

# F07 数据备份与恢复

## 本 Session 范围

`src/features/backup/` 目录。

## 格式与流转

- **导出**：将 Dexie 全部 6 张表完整查出序列化为 JSON，保留 `isDeleted=true` 的数据。
- **导入**：严格校验 JSON 结构，跳过已被标记软删除的脏数据。导入前必须红色弹窗警告“将覆盖现有数据”。
- **被动触发**：在 Background 中监听 `shared/messaging.ts` 定义的备份指令（如 F04 同步前发出的请求），执行导出而不弹窗。