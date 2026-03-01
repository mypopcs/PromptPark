/**
 * @file entrypoints/options/main.ts
 * @description Options 设置页入口
 */
import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import "@/assets/tailwind.css"; // 引入 Tailwind CSS 和 DaisyUI 全局样式

const app = createApp(App);

// 挂载路由
app.use(router);

app.mount("#app");
