import { createApp } from "vue";
import App from "./App.vue";
import { i18n } from "@/locales";
import "@/assets/tailwind.css";

/**
 * Popup 页面入口。
 */
const app = createApp(App);
app.use(i18n);
app.mount("#app");
