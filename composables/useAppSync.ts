/**
 * @file composables/useAppSync.ts
 * @description 全局状态（主题/语言）同步 Hook
 */
import { ref, onMounted } from "vue";
import { syncStore } from "@/utils/storage";
import { STORAGE_KEYS, DEFAULT_SETTINGS } from "@/config";
import type { AppSettings } from "@/types";

export const useAppSync = () => {
  const currentTheme = ref("light");
  const currentLocale = ref("zh");

  const applyTheme = (theme: string) => {
    // 1. 获取最外层容器（Shadow DOM 的根或者 body）
    const root = document.documentElement;
    const shadowRoot = document
      .querySelector("promptpark-shadow-host")
      ?.shadowRoot?.querySelector(".prompt-park-content-root");

    // 2. 同时应用到宿主和 Shadow DOM
    [root, shadowRoot].forEach((el) => {
      if (el) {
        (el as HTMLElement).setAttribute("data-theme", theme);
        if (theme === "dark") {
          (el as HTMLElement).classList.add("dark");
        } else {
          (el as HTMLElement).classList.remove("dark");
        }
      }
    });
    currentTheme.value = theme;
  };

  const sync = async () => {
    const settings =
      (await syncStore.get<AppSettings>(STORAGE_KEYS.SETTINGS)) ||
      DEFAULT_SETTINGS;
    applyTheme(settings.theme);
    // currentLocale.value = settings.language || "zh";
  };

  onMounted(() => {
    sync();
    // 🌟 核心：监听存储变化，实现跨端秒级同步
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes[STORAGE_KEYS.SETTINGS]) {
        sync();
      }
    });
  });

  return { currentTheme, currentLocale, sync };
};
