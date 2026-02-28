import path from "node:path";
import { defineConfig } from "wxt";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import obfuscatorPlugin from "vite-plugin-javascript-obfuscator";
import { AppConfig } from "./config/index";

/**
 * WXT 构建配置。
 * 说明：
 * 1. 插件基础信息统一读取全局配置。
 * 2. 开发环境关闭混淆，生产环境启用代码混淆。
 */
export default defineConfig({
  vite: ({ mode }) => ({
    plugins: [
      vue(),
      tailwindcss(),
      ...(mode === "production"
        ? [
            obfuscatorPlugin({
              include: ["entrypoints/**/*.js", "chunks/**/*.js"],
              options: {
                compact: true,
                disableConsoleOutput: true,
                stringArray: true,
                stringArrayEncoding: ["base64"]
              }
            })
          ]
        : [])
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, ".")
      }
    }
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
          mac: "Command+Shift+E"
        },
        description: "唤起/关闭 PromptPark 提示词抽屉"
      },
      "collect-prompt": {
        suggested_key: {
          default: "Ctrl+Shift+S",
          mac: "Command+Shift+S"
        },
        description: "采集当前网页选中的提示词"
      }
    }
  }
});
