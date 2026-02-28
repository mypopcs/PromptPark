import { computed } from "vue";
import { useI18n } from "vue-i18n";

/** 支持的语言类型 */
export type LocaleName = "zh-CN" | "en-US";

/**
 * 语言切换 Hook。
 */
export function useLocale() {
  const { locale } = useI18n();

  const currentLocale = computed<LocaleName>({
    get: () => locale.value as LocaleName,
    set: (value: LocaleName) => {
      locale.value = value;
    }
  });

  const setLocale = (value: LocaleName): void => {
    locale.value = value;
  };

  return {
    currentLocale,
    setLocale
  };
}
