<template>
  <div
    class="flex h-screen bg-base-100 text-base-content overflow-hidden font-sans"
  >
    <aside
      class="flex flex-col border-r border-base-200 bg-base-100/50 backdrop-blur-xl transition-all duration-300 ease-in-out z-20 shadow-sm relative"
      :class="isCollapsed ? 'w-16' : 'w-56'"
    >
      <div
        class="h-14 flex items-center justify-center border-b border-base-200 shrink-0 overflow-hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-primary shrink-0"
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
          @click="currentView = item.id"
          class="btn btn-ghost justify-start min-h-10 h-10 px-3 flex items-center border-none"
          :class="
            currentView === item.id
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-base-content/70 hover:bg-base-200'
          "
          :title="isCollapsed ? item.name : ''"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          <span
            class="ml-3 text-sm whitespace-nowrap transition-opacity duration-300"
            :class="isCollapsed ? 'opacity-0 hidden' : 'opacity-100'"
            >{{ item.name }}</span
          >
        </a>
      </nav>

      <div class="p-2 border-t border-base-200 shrink-0 flex flex-col gap-1">
        <a
          @click="currentView = 'SettingsPanel'"
          class="btn btn-ghost justify-start min-h-10 h-10 px-3 flex items-center border-none"
          :class="
            currentView === 'SettingsPanel'
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-base-content/70 hover:bg-base-200'
          "
          :title="isCollapsed ? '系统设置' : ''"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span
            class="ml-3 text-sm whitespace-nowrap transition-opacity duration-300"
            :class="isCollapsed ? 'opacity-0 hidden' : 'opacity-100'"
            >系统设置</span
          >
        </a>

        <button
          @click="toggleTheme"
          class="btn btn-ghost justify-start min-h-10 h-10 px-3 flex items-center border-none text-base-content/70 hover:bg-base-200"
          :title="isCollapsed ? '切换主题' : ''"
        >
          <svg
            v-if="currentTheme === 'dark'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
            />
          </svg>
          <span
            class="ml-3 text-sm whitespace-nowrap transition-opacity duration-300"
            :class="isCollapsed ? 'opacity-0 hidden' : 'opacity-100'"
          >
            {{ currentTheme === "dark" ? "亮色模式" : "深色模式" }}
          </span>
        </button>
      </div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0 bg-base-200/30">
      <header
        class="h-14 bg-base-100 border-b border-base-200 flex items-center px-4 shrink-0 gap-4 shadow-sm z-10"
      >
        <button
          @click="isCollapsed = !isCollapsed"
          class="btn btn-sm btn-ghost btn-square text-base-content/70"
        >
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div
          v-show="isCollapsed"
          class="font-bold text-lg text-primary flex items-center gap-2 animate-fade-in-right"
        >
          PromptPark
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-6">
        <component :is="currentComponent" />
      </main>
    </div>
    <AppToast />
    <GlobalConfirm />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, shallowRef, h, onMounted } from "vue";
import { useTheme } from "@/composables/useTheme";
// ... 原有的组件引入保持不变 ...
import PromptManage from "@/components/business/PromptManage.vue";
import DictionaryManage from "@/components/business/DictionaryManage.vue";
import TagManage from "@/components/business/TagManage.vue";
import PlatformManage from "@/components/business/PlatformManage.vue";
import SettingsPanel from "@/components/business/SettingsPanel.vue";
import AppToast from "@/components/ui/AppToast.vue";
import GlobalConfirm from "@/components/ui/GlobalConfirm.vue";
import FeedbackPanel from "@/components/business/FeedbackPanel.vue";

const { currentTheme, setTheme, initTheme } = useTheme();

// 🌟 新增：侧边栏折叠状态
const isCollapsed = ref(false);

const toggleTheme = () => {
  setTheme(currentTheme.value === "dark" ? "light" : "dark");
};

// ... 菜单定义等保持不变 ...
// 为了节约篇幅，请保留你原有的 menuItems 定义，只是去掉了 settings 菜单项，因为移到底部了。
const menuItems = [
  {
    id: "PromptManage",
    name: "提示词管理",
    icon: h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        class: "h-5 w-5",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
      },
      [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
        }),
      ],
    ),
  },
  {
    id: "DictionaryManage",
    name: "词典与分类",
    icon: h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        class: "h-5 w-5",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
      },
      [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
        }),
      ],
    ),
  },
  {
    id: "TagManage",
    name: "标签管理",
    icon: h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        class: "h-5 w-5",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
      },
      [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
        }),
      ],
    ),
  },
  {
    id: "PlatformManage",
    name: "平台与模型",
    icon: h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        class: "h-5 w-5",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
      },
      [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
        }),
      ],
    ),
  },
  {
    id: "FeedbackPanel",
    name: "关于和反馈",
    icon: h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        class: "h-5 w-5",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
      },
      [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        }),
      ],
    ),
  },
];

const currentView = ref("PromptManage");
const views = {
  PromptManage,
  DictionaryManage,
  TagManage,
  PlatformManage,
  SettingsPanel,
  FeedbackPanel,
};
const currentComponent = computed(
  () => views[currentView.value as keyof typeof views] || null,
);

onMounted(() => {
  initTheme();
});
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
