<template>
  <div>
    <button
      v-show="!isOpen"
      @click="toggleDrawer"
      class="fixed top-1/2 right-0 -translate-y-1/2 z-[2147483647] btn btn-sm btn-primary rounded-l-box rounded-r-none shadow-lg opacity-40 hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 border-r-0"
      title="打开 PromptPark 侧边栏 (Ctrl+Shift+Z)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
      <span class="text-xs">PromptPark</span>
    </button>

    <div
      class="fixed top-0 right-0 h-screen w-80 bg-base-100 shadow-2xl transition-transform duration-300 ease-in-out z-[2147483647] flex flex-col border-l border-base-200"
      :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <div
        class="flex items-center justify-between p-4 border-b border-base-200 bg-base-200/50"
      >
        <div class="font-bold text-primary flex items-center gap-2">
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
        <button class="btn btn-sm btn-ghost btn-square" @click="closeDrawer">
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        <div class="form-control w-full mb-2">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索提示词或翻译..."
            class="input input-sm input-bordered w-full rounded-full"
          />
        </div>

        <div
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
        </div>

        <div
          v-if="filteredPrompts.length === 0"
          class="text-center py-8 text-xs text-base-content/50"
        >
          没有匹配的提示词
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { localStore } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config";
import type { PromptItem } from "@/types";

const isOpen = ref(false);
const prompts = ref<PromptItem[]>([]);
const searchKeyword = ref("");

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
  // 同样按使用次数降序
  return list.sort((a, b) => (b.useCount || 0) - (a.useCount || 0));
});

const loadPrompts = async () => {
  prompts.value =
    (await localStore.get<PromptItem[]>(STORAGE_KEYS.PROMPTS, [])) || [];
};

const closeDrawer = () => {
  isOpen.value = false;
};

const toggleDrawer = async () => {
  if (!isOpen.value) {
    await loadPrompts();
  }
  isOpen.value = !isOpen.value;
};

// 复制并自动关闭侧边栏，同时增加使用次数
const copyPrompt = async (item: PromptItem) => {
  try {
    await navigator.clipboard.writeText(item.prompt);

    // 增加使用次数并保存
    const index = prompts.value.findIndex((p) => p.id === item.id);
    if (index > -1) {
      prompts.value[index].useCount = (prompts.value[index].useCount || 0) + 1;
      await localStore.set(STORAGE_KEYS.PROMPTS, prompts.value);
    }

    alert("✅ 复制成功！"); // 在 Shadow DOM 内最轻量直接的反馈
    closeDrawer();
  } catch (err) {
    console.error("复制失败", err);
  }
};

onMounted(() => {
  window.addEventListener("promptpark:toggle-drawer", toggleDrawer);
  loadPrompts();
});

onUnmounted(() => {
  window.removeEventListener("promptpark:toggle-drawer", toggleDrawer);
});
</script>
