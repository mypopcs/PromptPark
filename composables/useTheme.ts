import { ref } from "vue";
import { AppConfig } from "@/config";

/** 支持的主题类型 */
export type ThemeName = "light" | "dark" | "promptpark";

const theme = ref<ThemeName>(AppConfig.theme.defaultTheme);

/**
 * 应用主题到 HTML 根节点。
 */
function applyTheme(nextTheme: ThemeName): void {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", nextTheme);
  }
}

/**
 * 主题管理 Hook。
 */
export function useTheme() {
  const setTheme = (nextTheme: ThemeName): void => {
    theme.value = nextTheme;
    applyTheme(nextTheme);
  };

  return {
    theme,
    themes: AppConfig.theme.availableThemes,
    setTheme,
    initTheme: (): void => applyTheme(theme.value)
  };
}
