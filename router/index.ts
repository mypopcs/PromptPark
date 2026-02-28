import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";

/**
 * Options 页面路由表。
 * 说明：采用 Hash 路由以适配 Chrome 扩展页面刷新与直接访问场景。
 */
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/settings"
  },
  {
    path: "/settings",
    name: "settings",
    component: () => import("@/components/SettingsPanel.vue")
  },
  {
    path: "/dictionary",
    name: "dictionary",
    component: () => import("@/components/DictionaryManage.vue")
  },
  {
    path: "/prompt",
    name: "prompt",
    component: () => import("@/components/PromptManage.vue")
  },
  {
    path: "/tags",
    name: "tags",
    component: () => import("@/components/TagManage.vue")
  },
  {
    path: "/platform",
    name: "platform",
    component: () => import("@/components/PlatformManage.vue")
  }
];

/**
 * 创建 Options 专用路由实例。
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
