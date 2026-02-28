# Chrome 插件重构方案（第 2 步：目录规划）

> 本文为重构流程第 2 步交付物，仅覆盖「目录规划（文件级职责 + 命名规范 + 分层边界）」。
> 已按你的反馈改为**更扁平、不过度拆分**的目录结构。

## 1. 目标与边界

- 目标：在不引入过度复杂度的前提下，建立可维护、可扩展、严格类型安全的目录结构。
- 边界：本步只定义结构与约束，不改动具体业务实现。
- 核心原则：
  1. 根目录直出（无 `src`）。
  2. `@` 别名统一指向项目根目录。
  3. 目录以**够用**为标准，优先降低认知负担。

---

## 2. 目录结构（采用你指定的简化版）

```txt
/（项目根目录，无 src）
│
├── assets/
│   └── tailwind.css              # 全局样式入口（引入 Tailwind + DaisyUI）
│
├── components/
│   ├── ui/                       # 原子级公共组件（基于 DaisyUI 封装）
│   │   ├── AppToast.vue          # 全局 Toast 消息组件
│   │   ├── ConfirmDialog.vue     # 二次确认弹窗组件
│   │   ├── BaseTable.vue         # 强类型表格（分页/排序/统计）
│   │   └── BaseButton.vue        # 统一按钮（尺寸/状态/加载）
│   │
│   └── business/                 # 业务级组件（由原子组件组合）
│       ├── PromptFormModal.vue   # 提示词表单弹窗（新增/编辑/采集复用）
│       ├── DictionaryManage.vue  # 词典管理
│       ├── PromptManage.vue      # 提示词管理
│       ├── TagManage.vue         # 标签管理
│       ├── PlatformManage.vue    # 平台与模型管理
│       ├── SettingsPanel.vue     # 插件设置面板
│       ├── Drawer.vue            # 内容脚本抽屉
│       └── CollectModal.vue      # 采集弹窗（content script 使用）
│
├── composables/                  # Vue3 组合式函数（全局可复用逻辑）
│   ├── useMessage.ts             # Toast 消息反馈 Hook
│   ├── useConfirm.ts             # 二次确认 Hook
│   ├── useTheme.ts               # 主题切换 Hook（亮/暗/扩展）
│   └── useLocale.ts              # i18n 语言切换 Hook
│
├── config/
│   └── index.ts                  # 全局集中配置（插件信息/API/存储Key/UI常量）
│
├── entrypoints/                  # WXT 入口文件（框架约定目录）
│   ├── background.ts             # Service Worker 后台脚本
│   ├── content.ts                # 内容脚本（注入页面）
│   ├── options/
│   │   ├── index.html            # Options 页面 HTML
│   │   ├── main.ts               # Options 挂载入口
│   │   └── App.vue               # Options 根组件（含路由出口）
│   └── popup/
│       ├── index.html            # Popup 页面 HTML
│       ├── main.ts               # Popup 挂载入口
│       └── App.vue               # Popup 根组件
│
├── locales/                      # i18n 语言包
│   ├── zh-CN.ts                  # 中文
│   └── en-US.ts                  # 英文
│
├── router/
│   └── index.ts                  # vue-router 配置（Options 页面路由）
│
├── types/
│   └── index.ts                  # 全局 TS 类型定义（接口/枚举/消息类型）
│
├── utils/                        # 纯工具函数（无 Vue 依赖）
│   ├── storage.ts                # Chrome 存储封装（get/set/remove）
│   ├── logger.ts                 # 日志工具（开发/生产环境区分）
│   ├── feishu.ts                 # 飞书 API 工具
│   ├── github.ts                 # GitHub 图床上传工具
│   └── sync-engine.ts            # 同步引擎（调度 feishu/github）
│
├── package.json
├── tsconfig.json                 # TS 配置（严格模式 + @ 别名）
└── wxt.config.ts                 # WXT 构建配置（manifest + vite）
```

---

## 3. 目录职责约束（简化但严格）

### 3.1 `components/ui` 与 `components/business`

- `ui`：仅放通用原子组件，不写业务数据耦合。
- `business`：组合业务逻辑，可依赖 `ui`，不可反向依赖。

### 3.2 `composables`

- 仅放组合式逻辑（消息、主题、语言、确认）。
- 与 UI 组件解耦，避免循环依赖。

### 3.3 `utils`

- 仅放无 Vue 依赖的纯工具与核心引擎。
- Chrome API 封装统一集中，避免散落在页面中。

### 3.4 `entrypoints`

- `background.ts`：全局调度、消息中枢、快捷键监听。
- `content.ts`：页面注入与采集相关能力。
- `options/popup`：UI 入口，不承载底层 API 细节。

---

## 4. 命名规范（保持一致）

- Vue 组件：`PascalCase.vue`
- Composable：`useXxx.ts`
- 工具文件：`kebab-case.ts` 或沿用既有命名（保持统一）
- 消息类型：`domain:action`（如 `sync:start`）
- 存储键：`<app>:<module>:<key>`（如 `promptpark:sync:checkpoint`）

---

## 5. 与现有代码的迁移关系

- 现有 `components/*.vue`：按职责迁移至 `components/ui` 或 `components/business`。
- 现有 `utils/storage.ts` / `utils/sync-engine.ts`：保留文件名，补强类型与注释。
- `config/index.ts`：继续作为统一配置入口，不再拆散多个 config 文件。
- `router/index.ts`：保持单文件路由配置，先满足 options 多页面管理。

---

## 6. 第 3 步准备项（确认后执行）

1. 基础配置落地：`tsconfig.json` / `wxt.config.ts` / `vite.config.ts` / `tailwind.config.ts`
2. 严格模式与别名：TS strict + `@` 指向根目录
3. Tailwind + DaisyUI：主题切换基础配置
4. options 路由初始化：`router/index.ts`
5. i18n 基础接入：`locales/zh-CN.ts` + `locales/en-US.ts`

---

## 7. 本步交付清单

- [x] 按你反馈改为简化目录结构
- [x] 保留核心分层约束
- [x] 保留命名规范与迁移策略
- [x] 明确第 3 步配置落地准备
