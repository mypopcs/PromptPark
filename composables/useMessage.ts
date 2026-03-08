/**
 * @file composables/useMessage.ts
 * @description 全局 Toast 消息提示 Hook，使用 PrimeVue Toast
 */
import { useToast } from "primevue/usetoast";

export type MessageType = "info" | "success" | "warning" | "error";

export function useMessage() {
  const toast = useToast();

  const showMessage = (
    content: string,
    severity: MessageType = "info",
    life: number = 3000,
  ) => {
    toast.add({
      severity,
      summary:
        severity === "success"
          ? "成功"
          : severity === "error"
            ? "错误"
            : severity === "warning"
              ? "警告"
              : "提示",
      detail: content,
      life,
    });
  };

  return {
    info: (content: string, life?: number) =>
      showMessage(content, "info", life),
    success: (content: string, life?: number) =>
      showMessage(content, "success", life),
    warning: (content: string, life?: number) =>
      showMessage(content, "warning", life),
    error: (content: string, life?: number) =>
      showMessage(content, "error", life),
  };
}
