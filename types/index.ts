/**
 * 提示词典
 * 用于将分类和提示词进行最外层打包和隔离
 */
export interface Dictionary {
  id: string;
  name: string;
  description: string; // 提示词典描述
  coverUrl?: string; // 封面图 (可选)
  categoryIds: string[]; // 包含的分类ID列表
  promptIds: string[]; // 包含的提示词ID列表
  parkRecommend: boolean; // 是否为官方推荐词典
  price: number; // 销售价格 (若有)
  categoryNum: number; // 冗余字段：分类数量
  promptNum: number; // 冗余字段：提示词数量
  createdAt: number; // 创建时间戳
  updatedAt: number; // 更新时间戳
}

/**
 * 提示词分类
 * 位于词典之下，用于对提示词进行分组
 */
export interface Category {
  id: string;
  name: string;
  promptNum: number; // 分类下提示词数量
  createdAt: number; // 创建时间戳
}

/**
 * 核心：提示词数据结构
 */
export interface Prompt {
  id: string;
  dictionaryId: string; // 所属词典ID
  categoryId: string; // 所属分类ID
  text: string; // 英文提示词 (实际生效的Prompt)
  chinese: string; // 中文解释
  remark: string; // 备注说明
  imageUrl?: string; // 缩略图链接 (可选，存放在 GitHub 或本地)
  viewNum: number; // 查看次数统计
  favoriteNum: number; // 收藏次数统计
  useNum: number; // 使用次数统计
  tagIds: string[]; // 关联的标签ID列表
  AIPlatformIds: string[]; // 适用的AI平台ID列表
  AIModelIds: string[]; // 适用的AI模型ID列表
  parkUseNum: boolean; // 官方词典是否采用
  createdAt: number; // 创建时间戳
  updatedAt: number; // 更新时间戳
  feishuRecordId?: string; // 飞书同步后的记录ID (用于增量更新)
}

/**
 * 提示词标签
 */
export interface PromptTag {
  id: string;
  name: string;
  num: number; // 关联此标签的提示词数量
}

/**
 * AI 平台 (如 Midjourney, ChatGPT 等)
 */
export interface AIPlatform {
  id: string;
  name: string;
  AIModelIds: string[]; // 该平台包含的模型ID列表
  promptNum: number; // 关联提示词数量
}

/**
 * AI 模型 (如 GPT-4, Claude-3 等)
 */
export interface AIModel {
  id: string;
  name: string;
  promptNum: number; // 关联提示词数量
}

/**
 * 飞书多维表格同步配置
 */
export interface FeishuConfig {
  appId: string; // 飞书应用ID
  appSecret: string; // 飞书应用密钥
  bitableId: string; // 飞书多维表格ID (app_token)
  tableId: string; // 飞书具体的表格ID (table_id)
  wikiNodeId: string; // 飞书知识库节点ID (可选)
}

/**
 * GitHub 图床配置
 */
export interface GithubConfig {
  token: string; // GitHub个人访问令牌 (PAT)
  owner: string; // 仓库所有者用户名
  repo: string; // 仓库名称
  path: string; // 文件存储在仓库中的目录路径
}

/**
 * 插件全局设置
 */
export interface AppSettings {
  feishu: FeishuConfig;
  github: GithubConfig;
  syncInterval: number; // 同步间隔（秒）
  enableAutoSync: boolean; // 是否开启自动同步
  syncOnStartup: boolean; // 是否启动时立即同步
  lastSyncTime?: string; // 上次同步时间的格式化字符串
  lastSyncStatus?: string; // 上次同步状态的文字描述
  lastSyncStatusCode?: "success" | "failed" | "syncing"; // 上次同步状态码
  lastSyncError?: string; // 上次同步报错的具体信息
  language: "zh-CN" | "en-US"; // 界面语言
  theme: "light" | "dark"; // UI主题
}

/**
 * 扩展程序内部消息通信请求结构
 */
export interface MessageRequest {
  action: string; // 操作类型 (如 'SYNC_DATA', 'SAVE_PROMPT')
  language?: string; // 语言环境
  data?: any; // 传输的数据载荷 (因动作不同数据结构不同，保留 any)
  dictionaryId?: string; // 涉及的词典ID
  categoryId?: string; // 涉及的分类ID
  id?: string; // 通用目标ID
}
