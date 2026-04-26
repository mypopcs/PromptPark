---
name: promptpark-f04-sync
description: 当用户要开发 PromptPark 飞书同步功能、飞书多维表格读写、手动双向同步、同步冲突处理时触发。
---

# F04 飞书双向同步

## 本 Session 范围

`src/features/sync/` 目录。

## 凭据与网络铁律

- **凭据隔离**：必须读取 `STORAGE_KEYS.USER_TENANT_TOKEN`。严禁碰 `DEV_TENANT_TOKEN`。
- **请求中枢**：所有网络请求必须调用 `src/shared/api.ts` 中的封装方法，严禁手写原生 fetch。
- **限流重试**：依赖 `api.ts` 中根据 `PARAMS.SYNC_QPS_LIMIT` 和 `SYNC_RETRY_COUNT` 实现的退避逻辑。

## 业务流程

- 启动前：发送消息触发 F07 模块执行全量本地备份。
- 同步锁：执行期间向 Storage 写入 `STORAGE_KEYS.SYNC_LOCK` 防并发。
- 冲突处理：同名词典必须弹出红色确认框，由用户决定 [重命名] 或 [合并]。