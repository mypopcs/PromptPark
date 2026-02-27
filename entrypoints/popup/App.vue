<template>
  <div class="flex flex-col bg-base-100 p-4 h-full w-[320px]">
    <header class="flex items-center gap-2 border-b border-base-200 pb-3 mb-4">
      <span class="text-2xl">✨</span>
      <div>
        <h1 class="text-lg font-bold text-base-content leading-tight">
          PromptPark
        </h1>
        <p class="text-xs text-base-content/60">AI 提示词私有化工作站</p>
      </div>
    </header>

    <main class="flex-1 flex flex-col gap-3">
      <div class="stats shadow bg-base-200/50">
        <div class="stat p-3">
          <div class="stat-title text-xs">本地词典状态</div>
          <div
            class="stat-value text-sm overflow-hidden text-ellipsis"
            :class="statusClass"
          >
            {{ statusText }}
          </div>
          <div class="stat-desc text-[10px] mt-1">{{ statDesc }}</div>
        </div>
      </div>

      <div class="flex flex-col gap-2 mt-2">
        <button class="btn btn-primary w-full" @click="openOptionsPage">
          打开管理中心
        </button>

        <button
          class="btn btn-secondary w-full"
          :disabled="isSyncing"
          @click="handleSync('syncToFeishu')"
        >
          <span
            v-if="isSyncingAction === 'syncToFeishu'"
            class="loading loading-spinner loading-xs"
          ></span>
          {{
            isSyncingAction === "syncToFeishu" ? "同步中..." : "手动同步到飞书"
          }}
        </button>

        <button
          class="btn btn-secondary w-full"
          :disabled="isSyncing"
          @click="handleSync('syncFromFeishu')"
        >
          <span
            v-if="isSyncingAction === 'syncFromFeishu'"
            class="loading loading-spinner loading-xs"
          ></span>
          {{
            isSyncingAction === "syncFromFeishu"
              ? "同步中..."
              : "手动从飞书同步到本地"
          }}
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getSettings } from "@/utils/storage";
import type { AppSettings } from "@/types";

// 响应式状态
const isSyncing = ref(false);
const isSyncingAction = ref("");
const statusText = ref("等待检查...");
const statusClass = ref("text-base-content/40");
const statDesc = ref("准备好采集和组装提示词");

/**
 * 逻辑：初始化加载同步状态
 */
onMounted(async () => {
  await refreshStatus();

  // 监听来自 background 的同步任务完成通知
  if (typeof chrome !== "undefined" && chrome.runtime) {
    chrome.runtime.onMessage.addListener((request) => {
      if (request.action === "SYNC_FINISHED") {
        refreshStatus();
      }
    });
  }
});

/**
 * 逻辑：更新 UI 显示的同步状态
 */
const refreshStatus = async () => {
  const settings: AppSettings = await getSettings();

  if (settings.lastSyncStatusCode === "success") {
    statusText.value = `上次同步: ${settings.lastSyncTime || "未知"}`;
    statusClass.value = "text-success text-xs";
    statDesc.value = "数据已同步至最新";
  } else if (settings.lastSyncStatusCode === "failed") {
    statusText.value = "上次同步失败";
    statusClass.value = "text-error text-xs";
    statDesc.value = settings.lastSyncError || "通讯异常，请检查配置";
  } else {
    statusText.value = "尚未执行同步";
    statusClass.value = "text-primary text-xs";
  }
};

/**
 * 方法: 唤起 Options 管理后台页面
 */
const openOptionsPage = () => {
  if (typeof chrome !== "undefined" && chrome.tabs && chrome.runtime) {
    chrome.tabs.create({ url: chrome.runtime.getURL("/options.html") });
    window.close();
  }
};

/**
 * 方法: 触发飞书同步
 */
const handleSync = async (action: "syncToFeishu" | "syncFromFeishu") => {
  if (isSyncing.value) return;

  isSyncing.value = true;
  isSyncingAction.value = action;
  statusText.value = "正在同步中...";
  statusClass.value = "text-info text-xs animate-pulse";

  try {
    // 向 background 发送指令执行实际同步任务
    const response = await browser.runtime.sendMessage({ action });

    if (response && response.success) {
      // 等待 500ms 确保存储已更新后再刷新 UI
      setTimeout(refreshStatus, 500);
    } else {
      throw new Error(response?.error || "同步未成功");
    }
  } catch (err: any) {
    statusText.value = "执行失败";
    statusClass.value = "text-error text-xs";
    statDesc.value = err.message || "通讯错误";
  } finally {
    isSyncing.value = false;
    isSyncingAction.value = "";
  }
};
</script>

<style scoped>
/* 限制 Popup 宽度以适应 Chrome 窗口 */
:deep(body) {
  min-width: 320px;
}
</style>
