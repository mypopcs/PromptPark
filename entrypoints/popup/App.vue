<template>
  <div class="bg-base-100 flex flex-col text-base-content">
    <header
      class="flex-none p-4 border-b border-base-200 flex items-center justify-between bg-base-200/50"
    >
      <div class="flex items-center gap-2 font-bold text-primary text-lg">
        <i class="ri-flashlight-fill text-xl"></i>
        PromptPark
      </div>
      <BaseButton
        variant="default"
        size="sm"
        type="ghost"
        shape="square"
        @click="openOptions"
      >
        <i class="ri-settings-4-line text-lg"></i>
      </BaseButton>
    </header>

    <main class="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
      <BaseButton variant="primary" size="md" @click="togglePageDrawer">
        在当前网页打开侧边栏
      </BaseButton>
    </main>
  </div>
  <AppToast />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { localStore } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config";
import type { PromptItem } from "@/types";
import { useMessage } from "@/composables/useMessage";
import AppToast from "@/components/ui/AppToast.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
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
  console.log("togglePageDrawer");
  try {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab?.id) {
        await chrome.tabs.sendMessage(tab.id, {
          action: "toggleDrawer",
        });
        window.close(); // 自动关闭弹窗
      }
    }
  } catch (error) {
    console.error("打开 Drawer 失败:", error);
  }
};
</script>
