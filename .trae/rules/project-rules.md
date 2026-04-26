# PromptPark 项目规则

## 🔒 冻结文件（禁止修改，变更需人工审批）

- wxt.config.ts
- src/shared/types.ts
- config/params.ts
- config/styles.ts
- config/keys.ts

## ❌ 禁止行为

- 禁止使用 chrome._ API，必须用 browser._（WXT polyfill 全局可用，无需 import）
- 禁止使用 setInterval，必须用 browser.alarms
- 禁止在 features/ 模块之间互相 import
- 禁止硬编码数字参数（从 config/params.ts 引用）
- 禁止硬编码颜色或尺寸（从 config/styles.ts 引用）
- 禁止在 entrypoints/ 中放工具文件（工具文件放 src/shared/）
- 禁止 entrypoints 两层以上嵌套
- 禁止在业务代码里直接使用 console.log / console.error
- 禁止将开发者飞书凭据（devTenantToken）与用户飞书凭据（userTenantToken）混用
- 不做账号系统、自动同步、变量模板 {{topic}}、批量操作、词典封面图渲染

## ✅ 必须行为

- Background 所有代码在 defineBackground(() => { ... }) 内部
- Content Script 所有代码在 defineContentScript({ main() { ... } }) 内部
- 所有日志通过 import { logger } from '@/shared/logger' 调用
- 抽屉（F03）必须挂载到 Shadow DOM
- 每次涉及 browser.\* API 先说出 API 名称，等人工确认后再写实现
- src/shared/ 新增文件必须说明哪两个 feature 会用到它
- Storage Key 只能从 config/keys.ts 的 STORAGE_KEYS 常量引用

## 📐 代码规范

- 包管理器：pnpm（禁止用 npm 或 yarn）
- 终端：Windows PowerShell 语法
- 分页：每页 20 条（PAGE_SIZE 从 params.ts 引用）
- 搜索防抖：200ms（SEARCH_DEBOUNCE 从 params.ts 引用）
- 高危操作必须二次确认弹窗，确认按钮红色
- 输入校验：去首尾空格后判空
