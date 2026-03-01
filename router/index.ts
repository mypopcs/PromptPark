/**
 * @file router/index.ts
 * @description Vue Router 配置，专供 Options 设置页使用 (必须使用 Hash 模式)
 */
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

// 定义路由记录
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/prompts", // 默认进入提示词管理页
  },
  {
    path: "/prompts",
    name: "Prompts",
    // 使用路由懒加载，提升页面首屏加载速度
    component: () => import("@/components/business/PromptManage.vue"),
  },
  {
    path: "/dictionaries",
    name: "Dictionaries",
    component: () => import("@/components/business/DictionaryManage.vue"),
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("@/components/business/SettingsPanel.vue"),
  },
  // 如果后续需要标签/平台管理，可在此处继续添加
  {
    path: "/tags",
    name: "Tags",
    component: () => import("@/components/business/TagManage.vue"),
  },
  {
    path: "/platforms",
    name: "Platforms",
    component: () => import("@/components/business/PlatformManage.vue"),
  },
  {
    path: "/feedback",
    name: "Feedback",
    component: () => import("@/components/business/FeedbackPanel.vue"),
  },
];

// 创建路由实例
const router = createRouter({
  // 核心坑点防范：Chrome 插件环境必须使用 Hash 历史记录！
  history: createWebHashHistory(),
  routes,
});

export default router;
