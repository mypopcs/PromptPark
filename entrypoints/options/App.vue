<template>
  <div class="flex h-screen bg-base-200">
    <aside class="w-64 bg-base-100 shadow-xl flex flex-col">
      <div
        class="p-4 text-xl font-bold border-b border-base-200 flex items-center gap-2"
      >
        <span class="text-primary">✨</span> PromptPark
      </div>
      <ul class="menu p-4 w-full text-base-content flex-1">
        <li v-for="item in menuItems" :key="item.id" class="mb-1">
          <a
            :class="{ active: currentTab === item.id }"
            @click="currentTab = item.id"
          >
            {{ item.name }}
          </a>
        </li>
      </ul>
    </aside>

    <main class="flex-1 overflow-y-auto p-8">
      <h1 class="text-3xl font-bold mb-8">{{ currentMenuName }}</h1>

      <div class="bg-base-100 p-6 rounded-box shadow">
        <component :is="currentComponent" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from "vue";

/**
 * 接口: 菜单项定义
 */
interface MenuItem {
  id: string; // 唯一标识，用于匹配动态组件
  name: string; // 菜单显示的中文名称
  component: any; // 绑定的 Vue 组件 (异步加载以优化性能)
}

/**
 * 菜单配置数据
 * 注意: 这里我们使用 defineAsyncComponent 来按需加载组件
 */
const menuItems: MenuItem[] = [
  {
    id: "settings",
    name: "⚙️ 插件设置",
    component: defineAsyncComponent(
      () => import("@/components/SettingsPanel.vue"),
    ),
  },
  // 把下面这两行的 Placeholder 换成我们刚才写的真实组件
  {
    id: "dictionary",
    name: "📚 词典管理",
    component: defineAsyncComponent(
      () => import("@/components/DictionaryManage.vue"),
    ),
  },
  {
    id: "prompt",
    name: "💡 提示词管理",
    component: defineAsyncComponent(
      () => import("@/components/PromptManage.vue"),
    ),
  },
  {
    id: "tags",
    name: "🏷️ 标签管理",
    component: defineAsyncComponent(() => import("@/components/TagManage.vue")),
  },
  {
    id: "platform",
    name: "🤖 平台与模型",
    component: defineAsyncComponent(
      () => import("@/components/PlatformManage.vue"),
    ),
  },
];

/**
 * 响应式状态: 当前激活的菜单 ID (默认显示插件设置)
 */
const currentTab = ref("settings");

/**
 * 计算属性: 当前应该渲染的组件
 */
const currentComponent = computed(() => {
  const item = menuItems.find((m) => m.id === currentTab.value);
  return item ? item.component : null;
});

/**
 * 计算属性: 当前菜单名称 (用于展示标题)
 */
const currentMenuName = computed(() => {
  const item = menuItems.find((m) => m.id === currentTab.value);
  return item
    ? item.name.replace(/[^ \u4e00-\u9fa5a-zA-Z0-9]/g, "").trim()
    : ""; // 去掉 Emoji
});
</script>
