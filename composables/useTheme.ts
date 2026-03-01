/**
 * @file composables/useTheme.ts
 * @description 全局主题切换 Hook，支持 light, dark, system，并自动持久化存储
 */
import { ref, onMounted } from "vue";
import { syncStore } from "@/utils/storage";
import { STORAGE_KEYS, DEFAULT_SETTINGS, THEME_OPTIONS } from "@/config";
import type { ThemeType } from "@/types";

// 全局共享的主题状态
const currentTheme = ref<ThemeType>(DEFAULT_SETTINGS.theme);

export function useTheme() {
  /**
   * 将主题应用到 DOM 节点
   */
  const applyThemeToDOM = (theme: ThemeType) => {
    let targetDaisyTheme = "light";

    if (theme === "system") {
      // 检测系统是否为暗色模式
      const isDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      targetDaisyTheme = isDarkMode ? "dark" : "light";
    } else {
      const option = THEME_OPTIONS.find((opt) => opt.value === theme);
      targetDaisyTheme = option ? option.daisyTheme : "light";
    }

    // 给 HTML 根节点设置 DaisyUI 主题
    document.documentElement.setAttribute("data-theme", targetDaisyTheme);
  };

  /**
   * 切换并保存主题
   */
  const setTheme = async (theme: ThemeType) => {
    currentTheme.value = theme;
    applyThemeToDOM(theme);

    // 取出已有设置，只更新 theme 字段，保存到 syncStore (支持跨设备同步)
    const settings = await syncStore.get(
      STORAGE_KEYS.SETTINGS,
      DEFAULT_SETTINGS,
    );
    if (settings) {
      await syncStore.set(STORAGE_KEYS.SETTINGS, { ...settings, theme });
    }
  };

  /**
   * 初始化主题 (页面加载时调用)
   */
  const initTheme = async () => {
    const settings = await syncStore.get(
      STORAGE_KEYS.SETTINGS,
      DEFAULT_SETTINGS,
    );
    currentTheme.value = settings?.theme || DEFAULT_SETTINGS.theme;
    applyThemeToDOM(currentTheme.value);
  };

  // 监听系统主题变化 (当用户选择“跟随系统”时，系统变暗插件也跟着变暗)
  onMounted(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", () => {
      if (currentTheme.value === "system") {
        applyThemeToDOM("system");
      }
    });
  });

  return {
    currentTheme,
    setTheme,
    initTheme,
    THEME_OPTIONS, // 导出供 UI 渲染下拉菜单使用
  };
}
