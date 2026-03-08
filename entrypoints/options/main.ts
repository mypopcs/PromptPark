/**
 * @file entrypoints/options/main.ts
 * @description Options 设置页入口
 */
import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import "@/assets/tailwind.css";
import "remixicon/fonts/remixicon.css";
import "primeicons/primeicons.css";
import { setupPrimeVue } from "@/plugins/primevue";

const app = createApp(App);

app.use(router);
setupPrimeVue(app);

app.mount("#app");
