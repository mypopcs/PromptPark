import { createApp } from "vue";
import App from "./App.vue";
import "@/assets/tailwind.css";
import "remixicon/fonts/remixicon.css";
import "primeicons/primeicons.css";
import { setupPrimeVue } from "@/plugins/primevue";

const app = createApp(App);
setupPrimeVue(app);
app.mount("#app");
