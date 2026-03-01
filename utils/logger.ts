/**
 * @file utils/logger.ts
 * @description 全局日志记录工具，自动区分开发和生产环境
 */

import { isDev } from "@/config";

const PREFIX = "[PromptPark]";

export const logger = {
  /**
   * 打印调试信息（仅在开发环境显示）
   */
  debug(...args: unknown[]): void {
    if (isDev) {
      console.debug(`${PREFIX} [DEBUG]`, ...args);
    }
  },

  /**
   * 打印常规信息（仅在开发环境显示）
   */
  info(...args: unknown[]): void {
    if (isDev) {
      console.info(`${PREFIX} [INFO]`, ...args);
    }
  },

  /**
   * 打印警告信息（所有环境都会显示）
   */
  warn(...args: unknown[]): void {
    console.warn(`${PREFIX} [WARN]`, ...args);
  },

  /**
   * 打印错误信息（所有环境显示，方便定位生产环境 Bug）
   */
  error(...args: unknown[]): void {
    console.error(`${PREFIX} [ERROR]`, ...args);
  },
};
