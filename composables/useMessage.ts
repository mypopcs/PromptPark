import { ref } from "vue";
import { AppConfig } from "@/config";

/** Toast 消息类型 */
export type MessageType = "success" | "error" | "warning" | "info";

/** 单条消息结构 */
export interface ToastMessage {
  /** 消息唯一ID */
  id: string;
  /** 消息类型 */
  type: MessageType;
  /** 用户可读文案 */
  text: string;
}

const messages = ref<ToastMessage[]>([]);

/**
 * 生成消息唯一 ID。
 */
function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * 新增一条 Toast 消息。
 */
function pushMessage(type: MessageType, text: string): void {
  const id = createMessageId();
  messages.value.push({ id, type, text });

  setTimeout(() => {
    messages.value = messages.value.filter((item) => item.id !== id);
  }, AppConfig.ui.toastDuration);
}

/**
 * 全局消息 Hook。
 */
export function useMessage() {
  return {
    messages,
    success: (text: string) => pushMessage("success", text),
    error: (text: string) => pushMessage("error", text),
    warning: (text: string) => pushMessage("warning", text),
    info: (text: string) => pushMessage("info", text),
    clear: () => {
      messages.value = [];
    }
  };
}
