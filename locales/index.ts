import { createI18n } from "vue-i18n";
import zhCN from "@/locales/zh-CN";
import enUS from "@/locales/en-US";
import { AppConfig } from "@/config/index";

/**
 * i18n 初始化实例。
 * 默认语言来源于集中配置，后续可由设置页动态切换。
 */
export const i18n = createI18n({
  legacy: false,
  locale: AppConfig.defaultSettings.language,
  fallbackLocale: "zh-CN",
  messages: {
    "zh-CN": zhCN,
    "en-US": enUS
  }
});
