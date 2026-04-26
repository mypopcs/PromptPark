---
name: promptpark-f03-drawer
description: 当用户要开发 PromptPark 侧边抽屉、Shadow DOM 挂载、提示词筛选拼合、抽屉拖拽宽度、Ctrl+Alt+S 快捷键时触发。
---

# F03 侧边抽屉 (Shadow DOM)

## 本 Session 范围

`src/features/drawer/` 目录。核心 UI 容器。

## Shadow DOM 铁律

1. 必须使用 WXT 的 `createShadowRootUi` API。
2. **样式注入**：在 `mount` 阶段，必须通过 `browser.runtime.getURL('/assets/tailwind.css')` 获取样式，转换为 `CSSStyleSheet` 后注入 `shadowRoot.adoptedStyleSheets`。

## 业务逻辑

- **触发**：右侧手柄 / `PRESETS.SHORTCUTS.DRAWER` / Popup 按钮消息。
- **多选拼合**：选中项以 `PRESETS.PROMPT_JOIN_SEPARATOR` 拼接写入剪贴板。
- **宽度持久化**：范围 `PARAMS.DRAWER_MIN_WIDTH` ~ `MAX`，拖拽结束写入 `STORAGE_KEYS.DRAWER_WIDTH`。