// entrypoints/content/index.ts
import { createApp, type App as VueApp } from "vue";
import App from "./App.vue";
// 👇 这里的路径必须指向你项目里配置了 @tailwind 的那个真实 CSS 文件！
import "@/assets/tailwind.css";
import { logger } from "@/utils/logger";

export default defineContentScript({
  matches: ["<all_urls>"], // 👈 极其重要，匹配所有网页
  cssInjectionMode: "ui",

  async main(ctx) {
    logger.info("PromptPark Content Script 注入成功!");

    let appInstance: VueApp | null = null;

    const ui = await createShadowRootUi(ctx, {
      name: "promptpark-shadow-host",
      position: "inline",
      anchor: "body",
      append: "last",
      onMount: (container: HTMLElement) => {
        logger.debug("Content UI mounting...");
        const app = createApp(App);
        app.mount(container);
        appInstance = app;
        logger.debug("Content UI mounted successfully");
        return app;
      },
      onRemove: (app) => {
        logger.debug("Content UI unmounting...");
        app?.unmount();
        appInstance = null;
      },
    });

    ui.mount();
    logger.info("PromptPark Drawer UI 已挂载到页面");

    // 监听来自 popup 或 background 的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      logger.debug("Content Script 收到消息:", message);

      if (message.action === "toggleDrawer") {
        // 触发自定义事件通知 Drawer 组件
        window.dispatchEvent(new CustomEvent("promptpark:toggle-drawer"));
        sendResponse({ success: true });
      }

      return true; // 保持消息通道开放
    });
  },
});
