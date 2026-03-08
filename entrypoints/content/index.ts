// entrypoints/content/index.ts
import { createApp, type App as VueApp } from "vue";
import App from "./App.vue";
import "@/assets/tailwind.css";
import "remixicon/fonts/remixicon.css";
import "primeicons/primeicons.css";
import { setupPrimeVue } from "@/plugins/primevue";
import { logger } from "@/utils/logger";

export default defineContentScript({
  matches: ["<all_urls>"],
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
        setupPrimeVue(app);
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

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      logger.debug("Content Script 收到消息:", message);

      if (message.action === "toggleDrawer") {
        window.dispatchEvent(new CustomEvent("promptpark:toggle-drawer"));
        sendResponse({ success: true });
      }

      return true;
    });
  },
});
