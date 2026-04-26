/**
 * 🟢 全局预设常量
 * 冻结文件：包含默认支持的 AI 平台、模型以及全局快捷键
 */
export const PRESETS = {
  /** 预设 AI 平台列表 */
  PLATFORMS: ["ChatGPT", "Claude", "Gemini", "Kimi", "豆包"],

  /** 预设模型列表（按平台分组映射） */
  MODELS: {
    ChatGPT: ["GPT-4", "GPT-4o", "GPT-4o-mini", "GPT-3.5-turbo"],
    Claude: [
      "Claude 3 Opus",
      "Claude 3 Sonnet",
      "Claude 3 Haiku",
      "Claude 3.5 Sonnet",
    ],
    Gemini: [
      "Gemini Pro",
      "Gemini Ultra",
      "Gemini 1.5 Pro",
      "Gemini 1.5 Flash",
    ],
    Kimi: ["Kimi Chat", "Kimi Pro"],
    豆包: ["豆包 Pro", "豆包 Lite"],
  },

  /** 全局快捷键映射 */
  SHORTCUTS: {
    /** 框选 + 快捷键触发采集弹窗 */
    COLLECT: "Ctrl+Alt+A",
    /** 打开/关闭侧边抽屉 */
    DRAWER: "Ctrl+Alt+S",
  },

  /** 提示词拼合分隔符（多选提示词发送时使用） */
  PROMPT_JOIN_SEPARATOR: ", ",
} as const;
