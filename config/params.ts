/**
 * 🟢 核心数值与逻辑参数
 * 冻结文件：业务代码禁止硬编码任何魔法数字，必须从此对象引入
 */
export const PARAMS = {
  /** 抽屉默认宽度（px） */
  DRAWER_DEFAULT_WIDTH: 380,
  /** 抽屉最小宽度（px） */
  DRAWER_MIN_WIDTH: 300,
  /** 抽屉最大宽度（px） */
  DRAWER_MAX_WIDTH: 600,

  /** 框选采集 - 悬浮按钮出现延迟（ms） */
  COLLECT_HOVER_DELAY: 100,
  /** 框选采集 - 鼠标移出后悬浮按钮隐藏延迟（ms） */
  COLLECT_HIDE_DELAY: 2000,

  /** 搜索输入防抖延迟（ms） */
  SEARCH_DEBOUNCE: 200,
  /** 分页每页条目数 */
  PAGE_SIZE: 20,

  /** Toast 成功提示持续时间（ms） */
  TOAST_SUCCESS_DURATION: 2000,
  /** Toast 错误提示持续时间（ms） */
  TOAST_ERROR_DURATION: 3000,

  /** 飞书同步 QPS 限制（防止触发接口限流） */
  SYNC_QPS_LIMIT: 80,
  /** 飞书同步失败重试次数 */
  SYNC_RETRY_COUNT: 3,

  /** 序列号激活 Key 长度（无连字符，29位滚动哈希） */
  LICENSE_KEY_LENGTH: 29,
  /** 心跳检测间隔（天数） */
  HEARTBEAT_INTERVAL_DAYS: 7,
  /** 心跳失败宽限期（天数） */
  GRACE_PERIOD_DAYS: 7,

  /** Dexie 本地数据库版本号（非必要严禁修改） */
  DB_VERSION: 1,
} as const;
