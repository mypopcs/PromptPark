import { defineConfig } from "wxt";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  // Vite 构建配置
  vite: () => ({
    plugins: [
      vue(),
      tailwindcss(), // 启用 Tailwind CSS 4.0
    ] as any,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."), // 使得 @ 能够正确解析到根目录
      },
    },
  }),

  // Chrome 扩展 Manifest V3 配置
  manifest: {
    name: "PromptPark",
    description: "A powerful prompt manager",
    version: "1.0.0",
    permissions: [
      "tabs", // 用于操作标签页
      "scripting", // 用于执行脚本
      "alarms", // 用于定时任务
      "storage", // 用于本地和同步存储
      "activeTab", // 获取当前标签页信息
      "contextMenus", // 右键菜单支持
    ],
    host_permissions: ["https://*/*", "http://*/*"],
    action: {
      default_title: "Open PromptPark",
    },
    commands: {
      "toggle-prompt-drawer": {
        suggested_key: {
          default: "Ctrl+Shift+Z",
          mac: "Command+Shift+Z",
        },
        description: "打开/关闭 PromptPark 侧边栏",
      },
    },
  },
});
