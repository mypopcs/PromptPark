---
name: promptpark-f05-github
description: 当用户要开发 PromptPark 图床功能、GitHub 图片上传、提示词图片管理时触发。
---

# F05 GitHub 图床

## 本 Session 范围

`src/features/github/` 目录。由 F01b 表单静默调用。

## 逻辑约束

- **凭据**：读取 `STORAGE_KEYS.GITHUB_TOKEN` 和 `GITHUB_REPO`。
- **网络**：必须走 `src/shared/api.ts` 封装调用 GitHub API。
- **工作流**：
  1. `browser-image-compression` 压缩。
  2. 上传新图。
  3. 成功后发异步请求删除旧图（失败仅用 `logger.error` 记录，不报错中断）。
- **容错**：图床操作失败只能 Toast 提示，绝对不能阻断提示词本身的保存动作。