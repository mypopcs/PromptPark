import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import obfuscatorPlugin from "vite-plugin-javascript-obfuscator";

/**
 * Vite 独立配置文件。
 * 说明：WXT 构建会合并该配置，开发环境关闭混淆，生产环境开启混淆。
 */
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [
      vue(),
      tailwindcss(),
      ...(isProduction
        ? [
            obfuscatorPlugin({
              include: ["entrypoints/**/*.js", "chunks/**/*.js"],
              options: {
                compact: true,
                controlFlowFlattening: false,
                deadCodeInjection: false,
                stringArray: true,
                stringArrayEncoding: ["base64"],
                disableConsoleOutput: true
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
  };
});
