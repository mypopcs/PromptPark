/**
 * 🟢 UI 设计 Token
 * 冻结文件：只映射 CSS 变量。严禁在 Vue 模板中写死 Hex 值或使用 :style 绑定。
 * 具体颜色值请在 assets/main.css 中定义。
 */
export const STYLES = {
  COLORS: {
    /** 主色调（对应 tailwind: bg-primary / text-primary） */
    PRIMARY: "var(--primary)",
    /** 成功色（对应 tailwind: bg-success） */
    SUCCESS: "var(--success)",
    /** 警告色（对应 tailwind: bg-warning） */
    WARNING: "var(--warning)",
    /** 错误/破坏性颜色（对应 tailwind: bg-destructive） */
    ERROR: "var(--destructive)",
    /** 辅助信息色（对应 tailwind: bg-info） */
    INFO: "var(--info)",
  },
  RADIUS: {
    /** 默认圆角大小 */
    DEFAULT: "var(--radius)",
  },
} as const;
