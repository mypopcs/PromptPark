<template>
  <div class="flex flex-col bg-base-100 p-4 h-full">
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
          <div class="stat-value text-lg text-primary">正常运行</div>
          <div class="stat-desc">准备好采集和组装提示词</div>
        </div>
      </div>

      <div class="flex flex-col gap-2 mt-2">
        <button class="btn btn-primary w-full" @click="openOptionsPage">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          打开管理中心
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
/**
 * 方法: 唤起 Options 管理后台页面
 * 逻辑: 使用标准的扩展 API。如果扩展在 manifest 中没有强制配置 options_ui.open_in_tab，
 * 这个方法会自动在独立的新标签页中全屏打开我们的 index.html。
 */
const openOptionsPage = () => {
  // 强制在新标签页打开我们刚才写好的超级后台，绕过 Chrome 弹窗机制
  if (typeof chrome !== "undefined" && chrome.tabs && chrome.runtime) {
    chrome.tabs.create({ url: chrome.runtime.getURL("/options.html") });
    window.close();
  }
};
</script>
