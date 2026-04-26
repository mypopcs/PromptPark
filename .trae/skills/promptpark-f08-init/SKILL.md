---
name: promptpark-f08-init
description: 当用户要开发 PromptPark 首次安装初始化、onInstalled 事件处理、预设平台和模型数据写入时触发。
---

# F08 首次安装初始化

## 本 Session 范围

`src/entrypoints/background.ts` 中的 `onInstalled` 逻辑。

## 初始化内容

`browser.runtime.onInstalled` 监听 `reason === 'install'`（仅首次安装执行，update 跳过）时：

1. 写入预设数据：从 `config/presets.ts` 引入 `PRESETS.PLATFORMS` 和 `PRESETS.MODELS`，遍历写入 Dexie（`id` 使用 `crypto.randomUUID()`，`isPreset: true`）。
2. 初始化设置：向 `browser.storage.local` 写入默认值：
   - 注入模式：`[STORAGE_KEYS.INJECT_MODE]: 'whitelist'`
   - 主题模式：`[STORAGE_KEYS.THEME]: 'system'`

## 约束

- 写入前需通过 `db.platforms.count()` 判断，防重复写入。
- 必须在 `defineBackground(() => {})` 内部执行。