/**
 * @file entrypoints/content.ts
 * @description 内容脚本：在目标网页中挂载 Shadow DOM UI，并接收后台消息
 */
import { createApp } from "vue";
import DrawerApp from "@/components/business/Drawer.vue";
import { MessageAction, type MessagePayload } from "@/types";
import { logger } from "@/utils/logger";
import "@/assets/tailwind.css"; // 将全局样式注入 Shadow DOM

export default defineContentScript({
  // 可以修改为 ['*://chatgpt.com/*', '*://claude.ai/*'] 等特定域名
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",

  async main(ctx) {
    logger.info("PromptPark Content Script 成功注入当前网页!");

    // 1. 使用 WXT 提供的 UI API 创建隔离的 Shadow DOM
    const ui = await createShadowRootUi(ctx, {
      name: "promptpark-shadow-ui", // 注入到页面 DOM 的标签名
      position: "inline",
      anchor: "body",
      append: "last",
      onMount(container) {
        // 创建 Vue 实例并挂载到 Shadow DOM 的容器内
        const app = createApp(DrawerApp);
        app.mount(container);
        return app;
      },
      onRemove(app) {
        if (app) app.unmount();
      },
    });

    ui.mount();

    // 2. 监听来自 Background 脚本或 Popup 的消息
    chrome.runtime.onMessage.addListener(
      (message: MessagePayload, sender, sendResponse) => {
        logger.debug("Content Script 收到消息:", message);

        if (message.action === MessageAction.NOTIFY_CONTENT) {
          // 通过原生的 CustomEvent 派发给 Vue 组件里的 onMounted 监听器
          const event = new CustomEvent("promptpark:toggle-drawer");
          window.dispatchEvent(event);

          sendResponse({ success: true });
        }

        return true;
      },
    );
  },
});
