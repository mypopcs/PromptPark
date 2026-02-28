<template>
  <div class="flex h-screen bg-base-200">
    <aside class="w-64 bg-base-100 shadow-xl flex flex-col">
      <div class="p-4 text-xl font-bold border-b border-base-200 flex items-center gap-2">
        <span class="text-primary">✨</span>
        <span>PromptPark</span>
      </div>
      <ul class="menu p-4 w-full text-base-content flex-1">
        <li v-for="item in menuItems" :key="item.path" class="mb-1">
          <RouterLink :to="item.path" active-class="active">{{ item.name }}</RouterLink>
        </li>
      </ul>
    </aside>

    <main class="flex-1 overflow-y-auto p-8">
      <h1 class="text-3xl font-bold mb-8">{{ currentMenuName }}</h1>
      <div class="bg-base-100 p-6 rounded-box shadow">
        <RouterView />
      </div>
    </main>
    <AppToast />
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, RouterLink, RouterView } from "vue-router";
import AppToast from "@/components/ui/AppToast.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";

/**
 * Options 菜单项类型定义。
 */
interface MenuItem {
  /** 路由路径 */
  path: string;
  /** 菜单展示文本 */
  name: string;
}

/**
 * 侧边栏菜单配置。
 */
const menuItems: MenuItem[] = [
  { path: "/settings", name: "⚙️ 插件设置" },
  { path: "/dictionary", name: "📚 词典管理" },
  { path: "/prompt", name: "💡 提示词管理" },
  { path: "/tags", name: "🏷️ 标签管理" },
  { path: "/platform", name: "🤖 平台与模型" }
];

/**
 * 当前路由对象。
 */
const route = useRoute();

/**
 * 根据当前路由动态显示页面标题。
 */
const currentMenuName = computed((): string => {
  const activeItem = menuItems.find((item) => item.path === route.path);
  if (!activeItem) {
    return "PromptPark";
  }
  return activeItem.name.replace(/[^ \u4e00-\u9fa5a-zA-Z0-9]/g, "").trim();
});
</script>
