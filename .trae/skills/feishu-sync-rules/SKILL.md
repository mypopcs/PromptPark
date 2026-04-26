---
name: feishu-sync-rules
description: 当开发 F04 飞书同步、双向同步、冲突处理、凭据管理时触发。
---

# F04 飞书同步规范（极高风险）

## 凭据分离（严禁混用）
| 凭据 | 用途 | Storage Key |
|------|------|-------------|
| 开发者 AppID/Secret | 序列号激活验证 | devTenantToken |
| 用户 AppID/Secret | 用户数据同步 | userTenantToken |

## 同步前置条件（缺一不可）
1. 检查互斥锁：syncLock from browser.storage，已锁则拒绝
2. 强制备份：调用 F07 backup()，备份失败则中断，不继续同步
3. 获取锁：写入 syncLock = true

## QPS 控制
- 上限：每秒 80 个请求
- 实现：请求队列 + 令牌桶，不允许无限制并发

## 指数退避重试
```typescript
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000)); // 1s, 2s, 4s
    }
  }
  throw new Error('Max retries exceeded');
}
```

## 冲突处理
- 同名词典：必须弹窗让用户选择「重命名」或「合并」
- 禁止静默自动处理冲突

## 同步完成后
- 释放互斥锁：syncLock = false
- 无论成功失败都必须释放锁