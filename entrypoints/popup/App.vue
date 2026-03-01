<template>
  <div class="h-full bg-base-100 flex flex-col text-base-content">
    <header
      class="flex-none p-4 border-b border-base-200 flex items-center justify-between bg-base-200/50"
    >
      <div class="flex items-center gap-2 font-bold text-primary text-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        PromptPark
      </div>
      <button
        class="btn btn-sm btn-ghost btn-square"
        title="打开管理后台"
        @click="openOptions"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-5 h-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
    </header>

    <main class="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
      <div class="form-control w-full shrink-0">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索提示词或中文解释..."
          class="input input-sm input-bordered w-full rounded-full"
        />
      </div>

      <button
        class="btn btn-primary btn-sm w-full shadow-sm"
        @click="togglePageDrawer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-4 h-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
        在当前网页打开侧边栏
      </button>

      <div class="divider my-0 text-xs text-base-content/50">常用提示词</div>

      <ul class="space-y-2 flex-1">
        <li
          v-for="item in filteredPrompts"
          :key="item.id"
          class="card bg-base-200/50 hover:bg-base-200 cursor-pointer transition-colors border border-base-300"
          @click="copyPrompt(item)"
        >
          <div class="card-body p-3">
            <h3 class="font-medium text-sm truncate" :title="item.translation">
              {{ item.translation }}
            </h3>
            <p
              class="text-xs text-base-content/60 truncate"
              :title="item.prompt"
            >
              {{ item.prompt }}
            </p>
          </div>
        </li>
        <div
          v-if="filteredPrompts.length === 0"
          class="text-center py-8 text-xs text-base-content/50"
        >
          <span v-if="prompts.length === 0">暂无数据，请前往管理后台添加</span>
          <span v-else>未找到匹配的提示词</span>
        </div>
      </ul>
    </main>
  </div>
  <AppToast />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { localStore } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config";
import type { PromptItem } from "@/types";
import { MessageAction, type MessagePayload } from "@/types";
import { useMessage } from "@/composables/useMessage";
import AppToast from "@/components/ui/AppToast.vue";
import { useTheme } from "@/composables/useTheme";

const { success, error } = useMessage();
const { initTheme } = useTheme();

const prompts = ref<PromptItem[]>([]);
const searchKeyword = ref("");

// 使用最新的 translation 和 prompt 字段进行过滤
const filteredPrompts = computed(() => {
  let list = prompts.value;
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase();
    list = list.filter(
      (p) =>
        p.translation.toLowerCase().includes(kw) ||
        p.prompt.toLowerCase().includes(kw),
    );
  }
  // 按照使用次数(useCount)降序排列，常用的排前面
  return list
    .sort((a, b) => (b.useCount || 0) - (a.useCount || 0))
    .slice(0, 10);
});

onMounted(async () => {
  await initTheme();
  prompts.value =
    (await localStore.get<PromptItem[]>(STORAGE_KEYS.PROMPTS, [])) || [];
});

const openOptions = () => {
  // 强制在新标签页打开我们刚才写好的超级后台，绕过 Chrome 弹窗机制
  if (typeof chrome !== "undefined" && chrome.tabs && chrome.runtime) {
    chrome.tabs.create({ url: chrome.runtime.getURL("/options.html") });
    window.close();
  }
};

const copyPrompt = async (item: PromptItem) => {
  try {
    await navigator.clipboard.writeText(item.prompt); // 复制核心提示词
    success("已复制到剪贴板！");

    // 同步增加使用次数并落盘
    const index = prompts.value.findIndex((p) => p.id === item.id);
    if (index > -1) {
      prompts.value[index].useCount = (prompts.value[index].useCount || 0) + 1;
      await localStore.set(STORAGE_KEYS.PROMPTS, prompts.value);
    }
  } catch (err) {
    error("复制失败，请检查浏览器权限");
  }
};

const togglePageDrawer = async () => {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id) {
      const payload: MessagePayload = { action: MessageAction.NOTIFY_CONTENT };
      await chrome.tabs.sendMessage(tab.id, payload);
      window.close();
    }
  } catch (err) {
    error("无法在此页面打开侧边栏");
  }
};
</script>
