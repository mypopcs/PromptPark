<template>
  <div
    class="navbar bg-base-100 border-b border-base-200 sticky top-0 z-30 px-4"
  >
    <div class="flex-none lg:hidden">
      <label for="options-drawer" class="btn btn-square btn-ghost">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="inline-block w-5 h-5 stroke-current"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </label>
    </div>
    <div class="flex-1 px-2">
      <span class="text-lg font-semibold">{{ currentRouteName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

// 根据当前路由动态显示标题
const currentRouteName = computed(() => {
  const nameMap: Record<string, string> = {
    Prompts: "提示词管理",
    Dictionaries: "词典管理",
    Settings: "插件与同步设置",
  };
  return nameMap[route.name as string] || "PromptPark";
});
</script>
