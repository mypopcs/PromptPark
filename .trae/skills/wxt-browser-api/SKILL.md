---
name: wxt-browser-api
description: 当涉及 background、content script、entrypoint、消息通信、browser storage、browser alarms、Shadow DOM 时触发。
---

# WXT Browser API 规范

## Background Service Worker
```typescript
// background.ts 必须这样写
export default defineBackground(() => {
  // 所有代码在这里
  // 禁止 setInterval，用 browser.alarms
  browser.alarms.create('heartbeat', { periodInMinutes: 10080 }); // 7天
  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'heartbeat') { /* 心跳逻辑 */ }
  });
  // 状态必须写入 browser.storage，SW 随时被 kill
});
```

## Content Script
```typescript
// content.ts 必须这样写
export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    // 所有代码在这里
    // 发消息前检查连接，catch 所有异常
    // 临时数据用 sessionStorage
  }
});
```

## Shadow DOM 抽屉规则
- 抽屉挂载到 Shadow DOM，防宿主 CSS 污染
- CSS 变量通过 adoptedStyleSheets 注入
- 主题切换通过 postMessage 通知内部组件
- 组件样式用 CSS 变量而非 Tailwind 类名（Shadow DOM 内拿不到宿主 Tailwind 样式表）

## Storage 监听正确写法
```typescript
// ❌ 错误：.local.onChanged 在部分 MV3 环境不触发
browser.storage.local.onChanged.addListener(listener);

// ✅ 正确：全局 onChanged + area 过滤
browser.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  // 处理逻辑
});
```

## 消息通信
```typescript
// 发送（Content Script → Background）
const response = await browser.runtime.sendMessage({ type: 'OPEN_DRAWER', payload: {} });

// 接收（Background）
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_DRAWER') { /* 处理 */ }
  return true; // 保持连接
});
```