# Chrome 插件重构方案（第 1 步：架构设计）

> 本文为重构流程第 1 步交付物，仅覆盖「架构设计」。
> 后续步骤需在你确认本方案后再继续推进。

## 1. 重构执行顺序（从小到大 / 从基础到全面）

1. **架构设计**（当前步骤）
2. **目录规划**（细化到文件职责与命名）
3. **基础配置落地**（WXT / TS / Vite / Tailwind / DaisyUI / Router / Alias）
4. **公共配置管理**（集中式 config、环境变量、统一常量）
5. **公共能力封装**（storage、message、toast、错误处理、日志）
6. **公共组件封装**（UI 原子组件 + 表格 + 表单弹窗 + 异常提示）
7. **核心逻辑实现**（同步、上传、快捷键、断点续传、重试机制）
8. **页面开发与路由接入**（options 多页面、popup、联调）
9. **测试与优化**（类型检查、构建验证、交互体验、异常链路）

---

## 2. Chrome 插件分层架构（Manifest V3 + WXT）

### 2.1 分层原则

- **UI 层**：`popup/options` 页面，负责交互展示，不直接耦合 Chrome API。
- **应用层**：状态管理、业务编排（同步/上传/CRUD），调用基础设施层。
- **基础设施层**：Chrome API 封装（存储、消息、commands）、网络请求、日志、错误转换。
- **共享层**：类型定义、常量、配置、国际化文案、通用工具函数。

### 2.2 各入口职责

- **background（Service Worker）**
  - 全局任务调度中心：同步、上传、快捷键监听、重试、告警。
  - 统一消息路由中心：接收 popup/options/content 请求并返回标准响应。
  - 统一写入存储：关键状态（任务状态、断点、失败队列）优先由 background 持久化。

- **content scripts**
  - 与网页 DOM 交互、提取数据、采集提示词。
  - 仅做页面侧能力，不承担全局状态管理。

- **popup**
  - 快速操作台：触发同步、上传、快捷操作，展示摘要状态。

- **options（vue-router 多页面）**
  - 管理台：配置、规则、主题、语言、快捷键说明、数据管理。

---

## 3. 统一消息通信机制设计

### 3.1 消息协议（统一格式）

```ts
interface RuntimeMessage<TPayload = unknown> {
  /** 请求唯一 ID，用于超时、重试、日志追踪 */
  requestId: string;
  /** 消息类型，采用命名空间约定，如 sync:start */
  type: string;
  /** 消息来源：popup/options/content/background */
  source: 'popup' | 'options' | 'content' | 'background';
  /** 时间戳（毫秒） */
  timestamp: number;
  /** 请求参数 */
  payload: TPayload;
}

interface RuntimeResponse<TData = unknown> {
  /** 与请求对应的 requestId */
  requestId: string;
  /** 是否成功 */
  success: boolean;
  /** 数据载荷 */
  data?: TData;
  /** 用户友好错误信息（中文） */
  errorMessage?: string;
  /** 开发环境调试详情 */
  debugMessage?: string;
}
```

### 3.2 通信模式

- **请求-响应（短连接）**：`sendMessage`，用于 CRUD、读写配置。
- **事件广播（状态推送）**：`tabs.sendMessage` / `runtime.sendMessage`，用于同步进度、上传进度。
- **长任务状态轮询**：UI 每隔固定间隔请求 background 任务状态。

### 3.3 超时与重试

- 默认超时：`5s`（可配置）。
- 重试次数：`2~3` 次（指数退避：500ms、1000ms、2000ms）。
- 仅对**幂等请求**重试（查询、状态获取、可重复同步步骤）。
- 非幂等请求（创建/删除）默认不自动重试，避免重复提交。

### 3.4 异常处理策略

- 未响应：提示“服务暂不可用，请稍后重试”。
- 超时：提示“请求超时，请检查网络或重试”。
- 类型不匹配：提示“数据格式异常，请升级插件后重试”。
- 开发环境附加 `debugMessage`，生产环境仅给用户友好中文提示。

---

## 4. 存储方案设计（local/session/sync）

### 4.1 使用场景划分

- `chrome.storage.local`
  - 存放体量较大、持久化强的数据：提示词库、任务断点、上传失败队列、缓存数据。

- `chrome.storage.session`
  - 存放会话态临时数据：当前页面 UI 状态、瞬时进度、短期草稿。

- `chrome.storage.sync`
  - 存放轻量且需跨设备同步配置：语言、主题、偏好设置、开关配置。
  - 注意配额限制，严禁存大数据。

### 4.2 统一存储封装

统一提供：`get/set/remove/clear`，并附加：

- Key 前缀隔离：`<extensionName>:<module>:<key>`
- 运行时类型守卫（schema 校验）
- 容量超限捕获与提示（中文）
- 错误转换（开发/生产分级）

### 4.3 容量与失败处理

- 写入失败（如 QUOTA）：
  - 立即提示“存储空间不足，请清理历史记录后重试”。
  - 自动清理过期缓存（按 LRU / TTL）。
- 回滚策略：关键写入失败不覆盖旧值。

---

## 5. 推荐目录结构（无 src，根目录直出，兼容 @ 别名）

```txt
.
├─ entrypoints/
│  ├─ background.ts                # 后台服务入口（消息路由、任务调度、commands）
│  ├─ content.ts                   # 内容脚本入口（页面采集/注入）
│  ├─ popup/
│  │  ├─ index.html
│  │  ├─ main.ts
│  │  └─ App.vue
│  └─ options/
│     ├─ index.html
│     ├─ main.ts
│     └─ App.vue
├─ pages/                           # options 子页面（vue-router 页面）
├─ router/                          # options 路由定义
├─ components/
│  ├─ ui/                           # DaisyUI 二次封装组件
│  └─ business/                     # 业务组件
├─ composables/                     # hooks（useMessage/useTheme/useSync 等）
├─ services/
│  ├─ message/                      # send/onMessage、重试、超时、日志
│  ├─ storage/                      # local/session/sync 封装
│  ├─ sync/                         # 同步引擎与断点续传
│  └─ upload/                       # 上传引擎与失败重传
├─ config/
│  ├─ index.ts                      # 总配置出口
│  ├─ app.ts                        # 插件信息
│  ├─ api.ts                        # 环境 API 配置
│  ├─ theme.ts                      # DaisyUI 主题参数
│  └─ storage.ts                    # key 前缀与分区配置
├─ constants/                       # 常量枚举（消息类型、错误码、命令名）
├─ types/                           # 全局 TS 类型
├─ locales/                         # i18n 文案（zh-CN/en-US）
├─ utils/                           # 纯函数工具
├─ assets/                          # 全局样式/静态资源引用
├─ public/                          # 图标等静态资源
├─ wxt.config.ts
├─ vite.config.ts
├─ tailwind.config.ts
└─ tsconfig.json
```

> `@` 别名统一指向**项目根目录**，如 `@/config/index`、`@/services/storage`。

---

## 6. Manifest V3 关键规避点（架构层）

- Background 为 Service Worker：
  - 避免依赖长期驻留内存；关键状态必须持久化到 storage。
- 异步消息 `sendResponse`：
  - 必须 `return true` 保持消息通道，避免响应丢失。
- 不使用 `window/localStorage` 作为核心数据存储。
- 网络请求、定时任务在 background 集中管理，UI 仅发命令与订阅状态。

---

## 7. 本步交付清单

- [x] 重构顺序（九步）
- [x] MV3 + WXT 分层架构
- [x] background/content/popup/options 职责定义
- [x] 消息协议（统一格式 + 超时 + 重试 + 异常）
- [x] Chrome 存储分层策略与封装约束
- [x] 推荐目录结构（无 src，支持 @ 根别名）
- [x] MV3 兼容坑规避清单

---

## 8. 待你确认后进入第 2 步

下一步将输出：**目录规划（精确到文件级职责与命名规则）**，并开始准备基础配置文件改造清单。
