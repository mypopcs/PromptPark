---
name: license-activation
description: 当开发 F06 序列号激活、心跳验证、激活状态时触发。
---

# F06 序列号激活规范

## 序列号格式
- 展示格式：PPK-XXXX-XXXX-XXXX-XXXX-XXXXXX
- 存储格式：29位原始字符（无连字符）
- 字符集：ABCDEFGHJKLMNPQRSTUVWXYZ23456789（去掉易混淆字符 I O 0 1）

## Checksum 算法
- 取前23位字符做滚动哈希
- 取哈希结果的前6位字符作为 Checksum
- 验证时：解析序列号 → 重算 Checksum → 对比

## 心跳机制
- 间隔：每7天（HEARTBEAT_INTERVAL_DAYS from params.ts）
- 实现：browser.alarms，禁止 setInterval
- 失败处理：7天宽限期（grace 状态），超期降级为 expired

## 激活状态
type ActivationStatus = 'active' | 'inactive' | 'grace' | 'expired'

## 格式化工具（utils.ts 中已有）
- formatLicenseKey(raw): 29位 → 展示格式
- parseLicenseKey(formatted): 展示格式 → 29位