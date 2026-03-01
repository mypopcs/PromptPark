import { createApp } from "vue";
import App from "./App.vue";
import "@/assets/tailwind.css"; // 引入全局样式（包含 DaisyUI）

const app = createApp(App);
app.mount("#app");
