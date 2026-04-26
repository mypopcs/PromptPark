# PromptPark · 开发记录

## sessions 1 起手提示词

我要开始开发 PromptPark，一款基于 Chrome 的本地优先提示词资产管理 Chrome 插件。
技术栈：WXT + Vue 3 + TypeScript strict + shadcn-vue + Tailwind CSS + Pinia + Dexie
请帮我完成 Session 1 任务：建立 config/ 目录下的四个配置文件。
具体要建的文件：

1. config/params.ts — 所有数字参数常量（DRAWER_DEFAULT_WIDTH=380, DRAWER_MIN_WIDTH=300, DRAWER_MAX_WIDTH=600, COLLECT_HOVER_DELAY=100, COLLECT_HIDE_DELAY=2000, SEARCH_DEBOUNCE=200, PAGE_SIZE=20, TOAST_SUCCESS_DURATION=2000, TOAST_ERROR_DURATION=3000, SYNC_QPS_LIMIT=80, SYNC_RETRY_COUNT=3, LICENSE_KEY_LENGTH=29, HEARTBEAT_INTERVAL_DAYS=7, GRACE_PERIOD_DAYS=7, DB_VERSION=1）
2. config/styles.ts — 颜色、圆角、间距等设计 token（主色调紫色系 #6366f1，参考 SPEC 中的 UI 风格）
3. config/keys.ts — browser.storage 的所有 key 枚举（theme, licenseRaw, activationStatus, lastHeartbeat, devTenantToken, userTenantToken, githubToken, userAppId, userAppSecret, userAppToken, tableIds, injectMode, blacklist, drawerWidth, githubRepo, githubBranch, syncLock）
4. config/presets.ts — 平台预设（ChatGPT/Claude/Gemini/Kimi/豆包）、模型预设、快捷键（COLLECT=Ctrl+Alt+A, DRAWER=Ctrl+Alt+S）、拼合分隔符（', '）

注意事项：

- 所有文件使用 as const 导出
- 加上 JSDoc 注释说明每个参数的作用
- keys.ts 需要导出 StorageKey 类型供 storage.ts 使用
- 不要修改任何其他文件

完成后列出你新增了哪些文件。并直接将以下内容追加写入项目根目录的 DONE.md 文件末尾，
不要在对话中输出，直接操作文件：
格式：

## [功能名称] · [今天日期]

### AI 声明修改范围

- 新增: ...
- 修改: ...
- 未动: wxt.config.ts / src/shared/types.ts / config/\*.ts

### browser.\* API 使用

- （列出本次用到的 API）

### 遗留风险

- （如有）

#
