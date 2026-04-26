---
name: promptpark-scaffold
description: 当用户要初始化 PromptPark 项目、搭建脚手架、创建 config 配置文件、初始化数据库 Schema、或设置 wxt.config.ts 权限时触发。
---

# PromptPark 基建与脚手架任务

## 本 Session 范围

WXT 配置 (`wxt.config.ts`)、`config/` 字典初始化、`src/shared/` 基础设施骨架搭建。不包含具体业务 UI。

## wxt.config.ts 权限声明 (一次性冻结)

- `permissions`: `["storage", "unlimitedStorage", "clipboardWrite", "clipboardRead", "alarms", "contextMenus"]`
- `host_permissions`: `["<all_urls>"]` （保留全网页权限，用于 F12 全网页注入探测及跨域请求）

## 数据库 Schema V1 (必须严格按照此结构)

```typescript
db.version(1).stores({
  dictionaries: "id, name, isDeleted, updatedAt",
  categories: "id, name, isDeleted",
  tags: "id, name, isDeleted",
  // 🟢 *tagIds 为 Dexie 多值索引，用于代替多对多关联表
  prompts: "id, dictionaryId, categoryId, *tagIds, isDeleted, updatedAt",
  platforms: "id, domain, isPreset",
  models: "id, platformId, isPreset",
});
```