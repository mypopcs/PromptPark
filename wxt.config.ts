import { defineConfig } from "wxt";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { AppConfig } from "./config/index";

// WXT 配置文件，负责构建和 manifest 生成
export default defineConfig({
  // 移除了引起报错的 imports.addons.vueTemplateImports

  vite: () => ({
    // 使用 as any 绕过 pnpm 环境下 Vite/Rollup 类型定义多版本冲突引起的报错
    plugins: [vue() as any, tailwindcss()],
  }),

  manifest: {
    name: AppConfig.info.name,
    description: AppConfig.info.description,
    version: AppConfig.info.version,
    permissions: ["storage", "activeTab", "clipboardWrite", "commands"],
    host_permissions: ["https://open.feishu.cn/*", "https://api.github.com/*"],
    commands: {
      "toggle-drawer": {
        suggested_key: {
          default: "Ctrl+Shift+E",
          mac: "Command+Shift+E",
        },
        description: "唤起/关闭 PromptPark 提示词抽屉",
      },
      "collect-prompt": {
        suggested_key: {
          default: "Ctrl+Shift+S",
          mac: "Command+Shift+S",
        },
        description: "采集当前网页选中的提示词",
      },
    },
  },
});
