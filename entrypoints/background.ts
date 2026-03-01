/**
 * @file entrypoints/background.ts
 * @description Background 后台脚本：处理全局热键、后台任务、跨脚本消息路由
 */
// import { defineBackground } from "wxt/sandbox";
import { MessageAction, type MessagePayload } from "@/types";
import { logger } from "@/utils/logger";

export default defineBackground(() => {
  logger.info("PromptPark Background Service Worker 启动成功.");

  // ==========================================
  // 1. 监听全局快捷键 (在 wxt.config.ts 的 manifest.commands 中注册)
  // ==========================================
  chrome.commands.onCommand.addListener(async (command) => {
    logger.info(`收到快捷键指令: ${command}`);

    if (command === "toggle-prompt-drawer") {
      // 获取当前活跃的标签页
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab?.id) {
        // 向当前标签页的 Content Script 发送强类型消息，要求展开/收起 Drawer
        const payload: MessagePayload = {
          action: MessageAction.NOTIFY_CONTENT,
        };

        try {
          await chrome.tabs.sendMessage(tab.id, payload);
        } catch (error) {
          logger.error(
            "发送消息到 Content Script 失败 (可能目标网页不支持或插件尚未加载完毕):",
            error,
          );
        }
      }
    }
  });

  // ==========================================
  // 2. 监听来自 Popup 或 Content Script 的消息
  // ==========================================
  chrome.runtime.onMessage.addListener(
    (message: MessagePayload, sender, sendResponse) => {
      logger.debug("Background 收到消息:", message);

      if (message.action === MessageAction.SYNC_DATA) {
        // 预留给未来同步 Gist 数据的接口
        logger.info("准备执行数据同步...");
        sendResponse({ success: true, data: "同步任务已接收" });
      } else {
        sendResponse({ success: false, error: "未知的 Action" });
      }

      // 返回 true 表示我们会异步调用 sendResponse
      return true;
    },
  );
});
