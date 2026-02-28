import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import { i18n } from "@/locales";
import "@/assets/tailwind.css";

/**
 * Options 页面入口。
 * 统一挂载 Router 与 i18n，为后续多页面和多语言重构打基础。
 */
const app = createApp(App);
app.use(router);
app.use(i18n);
app.mount("#app");
