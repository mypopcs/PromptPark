/**
 * 路径: entrypoints/background.ts
 * 职责:
 * 1. 监听全局快捷键并向 Content Script 发送采集指令。
 * 2. 管理飞书同步任务的定时调度（Alarms）。
 * 3. 处理来自 Popup 或 Options 的手动同步请求。
 */
import {
  getSettings,
  getPrompts,
  savePrompts,
  saveSettings,
} from "@/utils/storage";
import { syncToFeishu } from "@/utils/feishu"; // 确保你已创建此工具函数
import { MessageRequest } from "@/types";
export default defineBackground(() => {
  // --- 1. 快捷键监听逻辑 ---
  browser.commands.onCommand.addListener(async (command) => {
    if (command === "collect-prompt") {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab?.id) {
        // 向当前页面发送采集指令
        browser.tabs.sendMessage(tab.id, { action: "COLLECT_SELECTED" });
      }
    }
  });
  // --- 2. 自动化同步调度逻辑 ---

  /**
   * 更新同步闹钟状态
   * 根据用户在 SettingsPanel 中的配置开启或关闭定时同步
   */
  const updateSyncAlarm = async () => {
    const settings = await getSettings();
    // 先清除旧闹钟
    await browser.alarms.clear("auto-sync-alarm");

    if (settings.enableAutoSync && settings.syncInterval > 0) {
      // 这里的 periodInMinutes 是 WXT/Chrome 闹钟的标准单位 (分钟)
      browser.alarms.create("auto-sync-alarm", {
        periodInMinutes: settings.syncInterval / 60,
      });
      console.log(
        `[PromptPark] 已创建定时同步任务，间隔: ${settings.syncInterval / 60} 分钟`,
      );
    }
  };

  // 监听闹钟触发
  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "auto-sync-alarm") {
      await executeSyncTask();
    }
  });

  /**
   * 执行飞书同步核心任务
   */
  const executeSyncTask = async () => {
    console.log("[PromptPark] 开始执行飞书数据同步...");
    try {
      const prompts = await getPrompts();
      // 调用飞书同步工具函数
      const updatedPrompts = await syncToFeishu(prompts);
      // 将带有 feishuRecordId 的新数据存回本地
      await savePrompts(updatedPrompts);

      // 更新同步记录状态
      const settings = await getSettings();
      settings.lastSyncTime = new Date().toLocaleString();
      settings.lastSyncStatusCode = "success";
      settings.lastSyncStatus = "同步成功";
      await saveSettings(settings);

      // 通知 UI 更新 (如果有页面打开着)
      browser.runtime.sendMessage({
        action: "SYNC_FINISHED",
        status: "success",
      });
    } catch (error: any) {
      console.error("[PromptPark] 同步失败:", error);
      const settings = await getSettings();
      settings.lastSyncStatusCode = "failed";
      settings.lastSyncError = error.message;
      await saveSettings(settings);
    }
  };

  // --- 3. 消息通讯中心 (处理手动同步请求) ---
  browser.runtime.onMessage.addListener(
    (request: MessageRequest, sender, sendResponse) => {
      // 监听来自 App2.vue 的手动同步请求
      if (request.action === "syncToFeishu") {
        executeSyncTask().then(() => sendResponse({ success: true }));
        return true; // 保持异步通道
      }

      // 监听设置变更，实时更新闹钟
      if (request.action === "UPDATE_SETTINGS") {
        updateSyncAlarm();
      }
    },
  );

  // 初始化闹钟
  updateSyncAlarm();
});
