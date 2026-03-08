<template>
  <div class="bg-base-100 flex flex-col text-base-content">
    <header
      class="flex-none p-4 border-b border-base-200 flex items-center justify-between bg-base-200/50"
    >
      <div class="flex items-center gap-2 font-bold text-primary text-lg">
        <i class="ri-flashlight-fill text-xl"></i>
        PromptPark
      </div>
      <Button
        text
        severity="secondary"
        rounded
        @click="openOptions"
        class="!p-2"
      >
        <i class="ri-settings-4-line text-lg"></i>
      </Button>
    </header>

    <main class="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
      <Button @click="togglePageDrawer">
        在当前网页打开侧边栏
      </Button>
    </main>
  </div>
  <Toast position="top-center" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { localStore } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config";
import type { PromptItem } from "@/types";
import { useMessage } from "@/composables/useMessage";
import { useTheme } from "@/composables/useTheme";

const { success, error } = useMessage();
const { initTheme } = useTheme();

const prompts = ref<PromptItem[]>([]);

onMounted(async () => {
  await initTheme();
  prompts.value =
    (await localStore.get<PromptItem[]>(STORAGE_KEYS.PROMPTS, [])) || [];
});

const openOptions = () => {
  if (typeof chrome !== "undefined" && chrome.tabs && chrome.runtime) {
    chrome.tabs.create({ url: chrome.runtime.getURL("/options.html") });
    window.close();
  }
};

const togglePageDrawer = async () => {
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
        window.close();
      }
    }
  } catch (error) {
    console.error("打开 Drawer 失败:", error);
  }
};
</script>
