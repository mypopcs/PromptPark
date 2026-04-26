# PromptPark · SPEC.md

> AI 开发 Session 上下文锚点 · 每次 Session 开始前必须 attach 本文件

**版本**: 1.2.1 · **最后同步**: 2026-04-19 · **同步自**: PRD v1.2.0  
**v1.2.1 修正**: WXT 真实目录结构（entrypoints 命名约定、browser.\* API、wxt.config.ts）

---

## ⚠️ Session 开始规则（每次必读）

```
1. 每次 Session 只做一个功能模块，不得"顺便做"
2. 写代码前先用一段话复述任务范围，确认后再动手
3. 完成后列出"修改了哪些文件"，有没有动冻结文件
4. 涉及 browser.* API 先说出 API 名称，等人工核实后再写实现
5. 所有数字参数从 config/params.ts 引用，不得硬编码
6. 所有颜色尺寸从 config/styles.ts 引用，不得写死
7. src/shared/ 新增文件需说明"哪两个 feature 会用到它"
```

**🔒 冻结文件（只读不写，变更需人工审批）**:

- `wxt.config.ts` — 替代 manifest.json，权限在此声明
- `src/shared/types.ts`
- `config/params.ts`
- `config/styles.ts`

**⚠️ WXT 框架铁律（AI 必须遵守）**:

- 使用 `browser.*` 而不是 `chrome.*`（WXT polyfill，全局可用，无需 import）
- Background 所有代码必须在 `defineBackground(() => { ... })` 内部
- Content Script 所有代码必须在 `defineContentScript({ main() { ... } })` 内部
- `src/entrypoints/` 里不能放工具文件，工具文件放 `src/shared/`
- entrypoints 最多一层嵌套：`entrypoints/popup/index.html` ✅，`entrypoints/features/popup/` ❌

---

## 一、项目一句话定位

**PromptPark** — Chrome 插件，本地优先提示词资产管理器  
核心闭环：**采集 → 管理 → 调用 → 同步 → 备份**

---

## 二、MVP 功能边界

**做（P0）**:

| ID  | 功能                       | 说明             |
| --- | -------------------------- | ---------------- |
| F01 | 词典/提示词/分类/标签 CRUD | 三层管理核心     |
| F02 | 框选采集 + 快捷键采集弹窗  | Content Script   |
| F03 | 侧边抽屉（筛选+拼合+复制） | Shadow DOM       |
| F04 | 飞书双向手动同步           | 用户自己的表格   |
| F05 | GitHub 图床上传            | public_repo 权限 |
| F06 | 序列号激活 + 心跳验证      | 开发者飞书表格   |
| F07 | 数据备份导入导出           | JSON 格式        |
| F08 | 首次安装初始化             | onInstalled      |
| F10 | 主题切换（浅/深/系统）     |                  |
| F11 | 平台和模型管理             | 预设+自定义      |
| F12 | 注入范围管理（黑白名单）   |                  |

**不做（遇到请求直接拒绝）**:

- 账号系统、自动同步、变量模板 `{{topic}}`
- 批量操作、词典封面图渲染（字段预留不渲染）
- 自定义拼合分隔符、敏感信息加密（P1技术债）

---

## 三、目录结构（WXT 真实结构）

```
promptpark/
├── wxt.config.ts              🔒 冻结（替代 manifest.json）
├── tsconfig.json              extends .wxt/tsconfig.json
├── package.json
├── SPEC.md                    本文件
├── DONE.md                    完成记录
│
├── config/                    🔒 参数和样式 token（冻结）
│   ├── params.ts
│   └── styles.ts
│
├── src/
│   ├── shared/                跨入口共享代码
│   │   ├── types.ts           🔒 全局类型（准入：2+feature引用）
│   │   ├── db.ts              Dexie 实例
│   │   ├── storage.ts         browser.storage 封装
│   │   ├── messaging.ts       消息封装
│   │   ├── logger.ts          统一日志
│   │   └── utils.ts           纯函数工具
│   │
│   ├── features/              功能模块（feature 之间禁止互相 import）
│   │   ├── activation/        F06
│   │   ├── collection/        F02
│   │   ├── drawer/            F03
│   │   ├── sync/              F04
│   │   ├── github/            F05
│   │   ├── backup/            F07
│   │   └── inject-control/    F12
│   │
│   ├── components/
│   │   └── ui/                shadcn-vue 组件（自动管理）
│   │
│   └── entrypoints/           ⚠️ WXT 入口（命名约定严格，最多一层嵌套）
│       ├── background.ts      defineBackground 包裹
│       ├── content.ts         defineContentScript 包裹
│       ├── popup/
│       │   ├── index.html     ← WXT 识别的入口文件
│       │   ├── main.ts
│       │   └── App.vue
│       └── options/
│           ├── index.html     ← WXT 识别的入口文件
│           ├── main.ts
│           └── App.vue
│
├── public/                    静态资源（图标）
├── prompts/                   Prompt 模板（不参与构建）
└── .wxt/                      WXT 自动生成（加入 .gitignore，不要修改）
```

---

## 四、技术栈（不得自行更换）

| 层次     | 选型                               | 备注                            |
| -------- | ---------------------------------- | ------------------------------- |
| 构建     | WXT                                | 用 `browser.*`，不用 `chrome.*` |
| 框架     | Vue 3 + TypeScript strict          |                                 |
| UI       | shadcn-vue                         |                                 |
| 样式     | Tailwind CSS                       |                                 |
| 图标     | remixicon                          |                                 |
| 数据库   | Dexie (IndexedDB)                  |                                 |
| 状态     | Pinia                              |                                 |
| 包管理   | pnpm                               |                                 |
| 图片压缩 | browser-image-compression          |                                 |
| 定时任务 | browser.alarms（禁止 setInterval） |                                 |

---

## 五、执行环境铁律

| 环境           | 约束                                                                                                                        |
| -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Background SW  | MV3 随时被 kill；**禁用 setInterval**，用 browser.alarms；所有状态写 browser.storage；**所有代码在 defineBackground 内部**  |
| Content Script | 页面跳转后失效；发消息前检查连接；catch 所有异常；临时数据用 sessionStorage；**所有代码在 defineContentScript main() 内部** |
| Popup          | 关闭即销毁；**不持有业务状态**；从 browser.storage 读数据                                                                   |
| Options        | 可持有 UI 状态；业务数据通过 Pinia + Dexie 读取                                                                             |

**Shadow DOM 规则**（Content Script 抽屉必须遵守）:

- 抽屉挂载到 Shadow DOM，防宿主 CSS 污染
- CSS 变量通过 `adoptedStyleSheets` 注入
- 主题切换通过 `postMessage` 通知内部组件

---

## 六、数据库 Schema

```typescript
db.version(1).stores({
  dictionaries: "id, name, isDeleted, createdAt, updatedAt",
  prompts: "id, dictionaryId, categoryId, isDeleted, createdAt, updatedAt",
  categories: "id, name, isDeleted, createdAt",
  tags: "id, name, isDeleted, createdAt",
  platforms: "id, name, isPreset, isDeleted",
  models: "id, platformId, name, isPreset, isDeleted",
});
// ⚠️ 后续版本追加 db.version(N)，不得修改 version(1)
```

**重要**: `promptCount` 不存字段，显示时实时 `db.prompts.where({ categoryId }).count()`

---

## 七、飞书凭据分离（极高风险）

| 凭据                | 用途           | Storage Key       |
| ------------------- | -------------- | ----------------- |
| 开发者 AppID/Secret | 序列号激活验证 | `devTenantToken`  |
| 用户 AppID/Secret   | 用户数据同步   | `userTenantToken` |

**严禁混用，混用会导致安全漏洞**

---

## 八、功能规格速查

### F06 序列号激活

- 格式：`PPK-XXXX-XXXX-XXXX-XXXX-XXXXXX`，存储 29 位（无连字符）
- 字符集：`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`
- Checksum：滚动哈希前 23 位 → 取结果前 6 位字符
- 心跳：`browser.alarms` 每 7 天触发，失败 7 天后降级

### F01 数据关系

```
词典(1) ──< 提示词(N)
               ├── 分类(全局共享，1:1，必填)
               └── 标签(全局共享，多:多，选填)
```

### F02 采集

- 框选触发：100ms 内出现悬浮按钮，移出 2s 后隐藏
- 快捷键：`Ctrl+Alt+A`
- 草稿：sessionStorage，浏览器关闭清除

### F03 抽屉

- 触发：右侧手柄 | `Ctrl+Alt+S` | Popup 按钮
- 拼合分隔符：`, `（逗号+空格）
- 宽度：默认 380px，300~600px 可拖，持久化 browser.storage

### F04 同步

- 同步前强制备份；互斥锁；QPS ≤ 80；指数退避重试 3 次
- 同名词典冲突：弹窗让用户选择重命名或合并

### F05 图床

- 权限：`public_repo`，仅公开仓库
- 更换图片：自动删旧图，失败内联提示文件名，不阻断保存

### F12 注入范围

- 白名单模式（默认）：仅预设 AI 平台激活功能
- 全网页模式：所有页面激活，排除黑名单
- Content Script 始终注入，功能激活由 JS 层判断模式

---

## 九、全局交互规范

| 规范       | 要求                                          |
| ---------- | --------------------------------------------- |
| 点击反馈   | ≤ 100ms                                       |
| 搜索防抖   | 200ms                                         |
| Toast 成功 | 2s，页面顶部居中                              |
| Toast 错误 | 3s                                            |
| 高危操作   | 必须二次确认弹窗，确认按钮红色                |
| 输入校验   | 去首尾空格后判空                              |
| 搜索范围   | 原文 + 中文解释（不含备注，管理页和抽屉一致） |
| 分页       | 每页 20 条                                    |

---

## 十、DONE.md 格式（每次必填）

```markdown
## {feature} · {日期}

### AI 声明修改范围

- 新增: ...
- 修改: ...（说明改了什么）
- 未动: 其他所有文件

### 人工确认

- [ ] diff 与声明一致
- [ ] 未动冻结文件（wxt.config.ts / src/shared/types.ts / config/\*.ts）
- [ ] Chrome 手动测试通过
- [ ] src/shared/ 新增文件满足"2+ feature 引用"准入

### 遗留风险

- （如有）
```
