---
name: promptpark-f06-activate
description: 当用户要开发 PromptPark 序列号激活功能、激活验证、心跳检测、license 校验算法时触发。
---

# F06 序列号激活与心跳

## 本 Session 范围

`src/features/activation/` 目录 + `background` 定时器。

## 校验逻辑

- **凭据**：必须使用 `STORAGE_KEYS.DEV_TENANT_TOKEN` 请求开发者飞书。
- **Checksum**：29位字符，前 23 位滚动哈希生成后 6 位验证码。
- **状态存储**：结果写入 `STORAGE_KEYS.LICENSE_RAW` 和 `ACTIVATION_STATUS`。

## 心跳机制 (Background)

- **定时器**：使用 `browser.alarms`，周期 `PARAMS.HEARTBEAT_INTERVAL_DAYS`。
- **宽限期**：验证失败不立刻封禁，`PARAMS.GRACE_PERIOD_DAYS` 内允许重试。
- **降级**：超出宽限期，将 `ACTIVATION_STATUS` 设为 `expired`，限制核心功能渲染。