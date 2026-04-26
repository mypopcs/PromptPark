# PromptPark · SPEC.md

> AI 开发 Session 上下文锚点 · 每次 Session 开始前必须 attach 本文件

**版本**: 1.2.1 · **最后同步**: 2026-04-19 · **同步自**: PRD v1.2.0  
**v1.2.1 修正**: WXT 真实目录结构（entrypoints 命名约定、browser.\* API、wxt.config.ts）

---

## 一、项目一句话定位

**PromptPark** — 基于 Chrome 的本地优先提示词资产管理器。
核心闭环：**采集 → 管理 → 调用 → 同步 → 备份**

---

## 二、MVP 功能边界

**做（P0）**:

| ID  | 功能                       | 说明                                          |
| --- | -------------------------- | --------------------------------------------- |
| F01 | 词典/提示词/分类/标签 CRUD | 三层管理核心                                  |
| F02 | 框选采集 + 快捷键采集弹窗  | Content Script 注入，sessionStorage 暂存      |
| F03 | 侧边抽屉（筛选+拼合+复制） | Shadow DOM 挂载，防宿主样式污染               |
| F04 | 飞书双向手动同步           | 挂载用户私有飞书多维表格（带 QPS 与重试机制） |
| F05 | GitHub 图床上传            | public_repo 权限，替换时自动删除旧图          |
| F06 | 序列号激活与验证           | 滚动哈希 Checksum 校验，7 天心跳验证          |
| F07 | 数据备份导入导出           | JSON 格式全量备份                             |
| F08 | 首次安装初始化             | onInstalled                                   |
| F10 | 主题切换（浅/深/系统）     |                                               |
| F11 | 平台和模型管理             | 预设+自定义                                   |
| F12 | 注入范围管理（黑白名单）   | 白名单模式 / 全网页黑名单模式                 |

**不做（遇到请求直接拒绝）**:

- 账号系统、自动同步、变量模板 `{{topic}}`
- 批量操作、词典封面图渲染（字段预留不渲染）
- 自定义拼合分隔符、敏感信息加密（P1技术债）

---

## 三、目录结构（WXT 真实结构）

```
promptpark/
├── wxt.config.ts              # 🔒 冻结：WXT 构建与权限声明 (替代 manifest.json)
├── tsconfig.json              extends .wxt/tsconfig.json
├── package.json               # 依赖管理 (pnpm)
├── SPEC.md                    # 🟢 项目蓝图与核心规范 (AI 上下文锚点)
├── DONE.md                    # 开发进度与变更记录
│
├── config/                    # 🔒 冻结：全局配置与常量字典 (单一事实来源)
│   ├── params.ts              # 业务逻辑数字参数 (防抖、宽高、QPS限制)
│   ├── keys.ts                # Storage 键名与消息 Type 字典
│   ├── styles.ts              # Tailwind CSS 变量映射 (严禁 Hex 色值)
│   ├── presets.ts             # 预设数据 (平台、模型、快捷键)
│   └── routes.ts              # 路由常量表
│
├── src/
│   ├── assets/                # 静态资源与全局样式
│   │   ├── css/
│   │   │   └── tailwind.css   # 🟢 Tailwind 核心指令与 shadcn CSS 变量定义处
│   │   └── icons/             # 扩展图标等非编译图片
│   │
│   ├── shared/                # 基础设施与跨模块共享逻辑 (严格纯粹，不含 UI)
│   │   ├── types.ts           # 🔒 冻结：全局 TS 类型定义 (DB Schema、Payload)
│   │   ├── db.ts              # Dexie 数据库实例与基础 CRUD 封装
│   │   ├── api.ts             # Fetch 网络层封装 (带重试、限流、飞书 Token 注入)
│   │   ├── storage.ts         # browser.storage 强类型读写封装
│   │   ├── messaging.ts       # 跨环境 (Content/Background/Popup) 通信协议封装
│   │   ├── logger.ts          # 统一控制台日志打印
│   │   └── utils.ts           # 纯工具函数 (UUID 生成、时间格式化等)
│   │
│   ├── features/              # 核心业务模块 (🔥 铁律：各模块之间【严禁】互相 import)
│   │   ├── activation/        # F06: 序列号激活与心跳验证
│   │   ├── collection/        # F02: 采集模块 (选词、快捷键抓取)
│   │   ├── drawer/            # F03: 侧边抽屉面板业务
│   │   ├── sync/              # F04: 飞书双向同步逻辑
│   │   ├── github/            # F05: GitHub 图床上传与管理
│   │   ├── backup/            # F07: 本地数据导入导出
│   │   └── inject-control/    # F12: 黑白名单与注入范围管理
│   │
│   ├── components/            # 全局跨业务复用组件
│   │   └── ui/                # shadcn-vue 自动生成的原子 UI (Button, Input 等)
│   │
│   └── entrypoints/           # WXT 入口点 (🔥 铁律：【严禁】在此写复杂业务逻辑)
│       ├── background.ts      # defineBackground 包裹 (负责生命周期、监听扩展事件)
│       ├── content.ts         # defineContentScript (负责 DOM 注入、ShadowRoot 挂载)
│       ├── popup/             # 点击扩展图标的弹窗
│       │   ├── index.html
│       │   ├── main.ts
│       │   └── App.vue        # 仅做组件挂载，逻辑引用 features/
│       └── options/           # 全屏管理面板主界面
│           ├── index.html
│           ├── main.ts
│           └── App.vue        # 配合 vue-router 渲染路由页面
│
├── public/                    # 仅存放不参与 Vite 编译的公共文件 (如 manifest 要求的图标)
└── .wxt/                      WXT 自动生成
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

⚠️ **禁止修改 version(1)**，新增字段需追加 db.version(N)升级版本。

```typescript
db.version(1).stores({
  dictionaries: "id, name, isDeleted, createdAt, updatedAt",
  prompts:
    "id, dictionaryId, categoryId, *tagIds, isDeleted, createdAt, updatedAt",
  categories: "id, name, isDeleted, createdAt",
  tags: "id, name, isDeleted, createdAt",
  platforms: "id, name, isPreset, isDeleted",
  models: "id, platformId, name, isPreset, isDeleted",
});
```

**重要**: `promptCount` 不存字段，显示时实时 `db.prompts.where({ categoryId }).count()`

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

## 十、 跨环境通信矩阵 (Messaging Protocol)

所有跨环境通信必须在 `src/shared/messaging.ts` 中定义类型，并遵循以下标准流转：

| 动作类型 (Action) | 发送方          | 接收方     | Payload 载荷                                   | 预期响应                     |
| :---------------- | :-------------- | :--------- | :--------------------------------------------- | :--------------------------- |
| `COLLECT_TEXT`    | Content         | Background | `{ text: string, sourceUrl: string }`          | 写入 DB，返回 `ActionResult` |
| `TOGGLE_DRAWER`   | Popup / BG      | Content    | `{ action: 'open'\|'close', dictId?: string }` | 抽屉挂载/卸载状态            |
| `THEME_CHANGE`    | Options / Popup | Content    | `{ theme: 'light'\|'dark'\|'system' }`         | 触发 Content 样式重绘        |
| `SYNC_START`      | Options         | Background | `{ force: boolean }`                           | 返回同步进度 Stream          |

---

## 十一、 核心环境执行标准

### 1. Content Script 与 Shadow DOM (F03)

- **样式隔离**：必须使用 WXT 的 `createContentScriptUi` API。
- **样式注入**：由于 Tailwind 不会自动穿透，必须在 mount 时通过 `browser.runtime.getURL('/assets/tailwind.css')` 获取打包后的 CSS，转换为 `CSSStyleSheet` 后注入到 ShadowRoot 的 `adoptedStyleSheets` 中。
- **事件清理**：页面跳转或扩展更新导致 Content Script 卸载时，必须主动清除 DOM 节点和 EventListener。

### 2. API 网络层 (F04/F05)

- 所有请求必须通过 `src/shared/api/` 的统一入口发起。
- 必须实现 **429 Too Many Requests 限流拦截**。
- 必须实现 **指数退避重试（最大 3 次）**。

### 3. URL 注入过滤 (F12)

- 尽管配置了 `<all_urls>`，`content.ts` 在顶层执行时，**第一步必须进行 URL 过滤**。
- 读取 `browser.storage` 中的黑白名单配置，如果当前 `window.location.hostname` 被排除，立即 `return` 终止后续组件和样式的加载，保障宿主网页性能。

---

## 十二、 飞书凭据分离（极高风险）

| 凭据类型       | 存储 Key (`config/keys.ts`) | 用途                 | 约束                                 |
| :------------- | :-------------------------- | :------------------- | :----------------------------------- |
| **开发者凭据** | `devTenantToken`            | F06 序列号心跳验证   | 仅 Background 可读，禁止传输至前端   |
| **用户凭据**   | `userTenantToken`           | F04 用户自有数据同步 | 存储至本地，仅在 Sync 模块调用时使用 |

**⚠️ 严禁混用，否则会导致严重的数据越权与安全漏洞。**
