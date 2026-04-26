---
name: shadow-dom-drawer
description: 当开发 F03 侧边抽屉、Shadow DOM、Content Script UI 时触发。
---

# F03 侧边抽屉规范

## 基本参数
- 默认宽度：380px（DRAWER_DEFAULT_WIDTH from params.ts）
- 最小宽度：300px（DRAWER_MIN_WIDTH from params.ts）
- 最大宽度：600px（DRAWER_MAX_WIDTH from params.ts）
- 宽度持久化：browser.storage
- 触发方式：右侧手柄 | Ctrl+Alt+S | Popup 按钮
- 拼合分隔符：', '（逗号+空格，COMBINE_SEPARATOR from presets.ts）

## Shadow DOM 挂载方式
```typescript
// 在 content script 中挂载抽屉
const host = document.createElement('div');
host.id = 'promptpark-drawer-host';
document.body.appendChild(host);

const shadow = host.attachShadow({ mode: 'open' });

// 注入 CSS 变量（通过 adoptedStyleSheets）
const sheet = new CSSStyleSheet();
sheet.replaceSync(`:host { --pp-primary: #6366f1; /* 更多变量 */ }`);
shadow.adoptedStyleSheets = [sheet];

// 挂载 Vue 应用到 Shadow DOM
const app = createApp(DrawerApp);
const container = document.createElement('div');
shadow.appendChild(container);
app.mount(container);
```

## 主题切换
```typescript
// 宿主页面 → Shadow DOM
window.addEventListener('message', (e) => {
  if (e.data?.type === 'PP_THEME_CHANGE') {
    // 更新 Shadow DOM 内的 CSS 变量
  }
});
```