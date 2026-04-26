---
name: promptpark-f02-collect
description: 当用户要开发 PromptPark 文字采集功能、框选文字触发悬浮按钮、快捷键采集、Content Script 采集逻辑时触发。
---

# F02 框选采集

## 本 Session 范围

`src/features/collection/` 目录 + `content.ts` 注入点。

## 触发与时序

- **框选**：选中文本后延迟 `PARAMS.COLLECT_HOVER_DELAY` 出现按钮；移出区域 `PARAMS.COLLECT_HIDE_DELAY` 后隐藏。
- **快捷键**：监听 `PRESETS.SHORTCUTS.COLLECT`。
- **右键菜单**：Background 注册 `browser.contextMenus`。

## 执行约束 (Content Script)

- **草稿态**：页面未关闭前存入 `sessionStorage`。
- **样式隔离**：悬浮按钮使用 inline-style 配合 CSS 变量映射。
- **数据流**：用户确认采集后，通过 `shared/messaging.ts` 发送通信载荷至 Background 执行 Dexie 写入。严禁 Content Script 直连数据库。