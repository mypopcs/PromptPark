import type { Config } from "tailwindcss";
import daisyui from "daisyui";

/**
 * Tailwind + DaisyUI 主题配置。
 * - 默认支持 light / dark。
 * - 预留 promptpark 主题扩展入口。
 */
const config: Config = {
  content: [
    "./entrypoints/**/*.{html,ts,vue}",
    "./components/**/*.{ts,vue}",
    "./composables/**/*.ts"
  ],
  plugins: [daisyui],
  daisyui: {
    themes: [
      "light",
      "dark",
      {
        promptpark: {
          primary: "#4f46e5",
          secondary: "#06b6d4",
          accent: "#22c55e",
          neutral: "#1f2937",
          "base-100": "#ffffff",
          info: "#3abff8",
          success: "#36d399",
          warning: "#fbbd23",
          error: "#f87272"
        }
      }
    ]
  }
};

export default config;
