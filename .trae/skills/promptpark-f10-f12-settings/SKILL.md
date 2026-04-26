---
name: promptpark-f10-f12-settings
description: 当用户要开发 PromptPark 主题切换、深色模式、浅色模式、注入范围管理、黑白名单配置时触发。
---

# F10 主题切换 & F12 注入范围

## 本 Session 范围

`src/entrypoints/options/` 下的设置页 + `content.ts` 中的拦截逻辑。

## F10 主题切换机制

- **存储**：读取/写入 `STORAGE_KEYS.THEME` (light/dark/system)。
- **宿主 UI**：基于 Tailwind 规范，给 `html` 标签切换 `.dark` class。
- **抽屉 (Shadow DOM) 同步**：通过 `src/shared/messaging.ts` 发送 `THEME_CHANGE` 载荷，Content Script 接收后更新 ShadowRoot 内部的主题状态。

## F12 注入拦截机制 (Content Script)

- **存储**：读取 `STORAGE_KEYS.INJECT_MODE` 与 `STORAGE_KEYS.BLACKLIST` (string[])。
- **执行时序 (极其重要)**：由于我们在 manifest 开启了 `<all_urls>`，`content.ts` 顶层执行的第一步必须是拦截。
- **拦截逻辑**：提取当前 `window.location.hostname`，若为全局模式且命中黑名单，或者为白名单模式且未匹配预设平台，则直接 `return`，绝不挂载 Vue 实例和 CSS。