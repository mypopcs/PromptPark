<template>
  <aside
    class="flex flex-col border-r border-base-200 bg-base-100/50 backdrop-blur-xl transition-all duration-300 ease-in-out z-20 shadow-sm relative"
    :class="isCollapsed ? 'w-16' : 'w-56'"
  >
    <div
      class="h-14 flex items-center justify-center border-b border-base-200 shrink-0 overflow-hidden"
    >
      <i class="ri-flashlight-fill text-primary text-2xl shrink-0"></i>
      <span
        class="ml-2 font-bold text-lg text-primary tracking-wide whitespace-nowrap transition-opacity duration-300"
        :class="isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'"
      >
        PromptPark
      </span>
    </div>

    <nav class="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-1">
      <a
        v-for="item in menuItems"
        :key="item.id"
        @click="$emit('select-view', item.id)"
        class="btn btn-ghost justify-start min-h-10 h-10 px-3 flex items-center border-none"
        :class="
          currentView === item.id
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-base-content/70 hover:bg-base-200'
        "
        :title="isCollapsed ? item.name : ''"
      >
        <i :class="[item.iconClass, 'text-lg shrink-0']"></i>
        <span
          class="ml-3 text-sm whitespace-nowrap transition-opacity duration-300"
          :class="isCollapsed ? 'opacity-0 hidden' : 'opacity-100'"
          >{{ item.name }}</span
        >
      </a>
    </nav>

    <div class="p-2 border-t border-base-200 shrink-0 flex flex-col gap-1">
      <a
        @click="$emit('select-view', 'FeedbackPanel')"
        class="btn btn-ghost justify-start min-h-10 h-10 px-3 flex items-center border-none"
        :class="
          currentView === 'FeedbackPanel'
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-base-content/70 hover:bg-base-200'
        "
        :title="isCollapsed ? '关于和反馈' : ''"
      >
        <i class="ri-information-line text-lg shrink-0"></i>
        <span
          class="ml-3 text-sm whitespace-nowrap transition-opacity duration-300"
          :class="isCollapsed ? 'opacity-0 hidden' : 'opacity-100'"
          >关于和反馈</span
        >
      </a>

      <!-- <a
        @click="$emit('select-view', 'SettingsPanel')"
        class="btn btn-ghost justify-start min-h-10 h-10 px-3 flex items-center border-none"
        :class="
          currentView === 'SettingsPanel'
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-base-content/70 hover:bg-base-200'
        "
        :title="isCollapsed ? '插件与同步设置' : ''"
      >
        <i class="ri-settings-4-line text-lg shrink-0"></i>
        <span
          class="ml-3 text-sm whitespace-nowrap transition-opacity duration-300"
          :class="isCollapsed ? 'opacity-0 hidden' : 'opacity-100'"
          >插件与同步设置</span
        >
      </a> -->
      <a
        @click="$emit('toggle-theme')"
        class="btn btn-ghost justify-start min-h-10 h-10 px-3 flex items-center border-none text-base-content/70 hover:bg-base-200"
      >
        <i
          :class="[
            currentTheme === 'dark' ? 'ri-sun-line' : 'ri-moon-line',
            'text-lg shrink-0',
          ]"
        ></i>
        <span
          class="ml-3 text-sm whitespace-nowrap transition-opacity duration-300"
          :class="isCollapsed ? 'opacity-0 hidden' : 'opacity-100'"
        >
          {{ currentTheme === "dark" ? "亮色模式" : "深色模式" }}
        </span>
      </a>
    </div>
  </aside>
</template>

<script setup lang="ts">
const props = defineProps<{
  isCollapsed: boolean;
  currentView: string;
  currentTheme: string;
}>();

const emit = defineEmits<{
  (e: "select-view", view: string): void;
  (e: "toggle-theme"): void;
}>();

const menuItems = [
  {
    id: "PromptManage",
    name: "提示词管理",
    iconClass: "ri-archive-line",
  },
  {
    id: "DictionaryManage",
    name: "词典与分类",
    iconClass: "ri-book-open-line",
  },
  {
    id: "TagManage",
    name: "标签管理",
    iconClass: "ri-price-tag-3-line",
  },
  {
    id: "PlatformManage",
    name: "AI平台与模型",
    iconClass: "ri-global-line",
  },
  {
    id: "SettingsPanel",
    name: "插件与同步设置",
    iconClass: "ri-settings-4-line",
  },
];
</script>

<style>
.animate-fade-in-right {
  animation: fadeInRight 0.3s ease-out forwards;
}
@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
