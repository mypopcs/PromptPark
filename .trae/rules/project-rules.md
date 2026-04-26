# PromptPark 开发铁律

## 1. 流程守则

- 动手前复述任务范围，涉及 `browser.*` API 需先列出API，等待人工核实。
- 完成后更新 `DONE.md`，严禁改动冻结文件。

## 2. 🔒冻结文件（禁止修改，变更需人工审批）

严禁未经审批修改以下文件，所有参数必须从中引用：

- `wxt.config.ts`
- `src/shared/types.ts`
- `config/params.ts`
- `config/keys.ts`
- `config/styles.ts`
- `config/presets.ts`
- `config/routes.ts`

## 3. 技术限制

- **API**: 必须用 `browser.*`。禁止 `setInterval`，改用 `browser.alarms`。
- **UI**: 必须用 Tailwind。禁止内联 `:style` 颜色或尺寸。
- **Shadow DOM**: 抽屉必须挂载 ShadowRoot。样式需通过 `adoptedStyleSheets` 注入打包后的 CSS。
- **数据库**: 主键 `id` 必须在入库前通过 `crypto.randomUUID()` 生成。
- **日志**: 统一使用 `import { logger } from '@/shared/logger'`。
- **通信**: 严禁 `features/` 间互相 import，必须通过 `shared/messaging` 或 `storage` 中转。

## 4. 业务禁令

- ❌ 不做：账号系统、自动同步、变量模板、批量操作。
- ⚠️ 开发者 `devTenantToken` 与用户 `userTenantToken` 严禁混用！
- ⚠️ 高危操作（删除/覆盖）必须触发红色二次确认。

## 5. 目录约定

- 工具函数放 `src/shared/`。
- `entrypoints/` 严禁嵌套超过一层。
