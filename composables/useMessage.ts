/**
 * @file composables/useMessage.ts
 * @description 全局 Toast 消息提示 Hook，替代原生的 alert
 */
import { ref } from "vue";

export type MessageType = "info" | "success" | "warning" | "error";

export interface MessageItem {
  id: string;
  content: string;
  type: MessageType;
  duration: number;
}

// 在模块顶部定义响应式状态，使其成为全局单例
const messages = ref<MessageItem[]>([]);

export function useMessage() {
  /**
   * 显示消息的核心方法
   */
  const showMessage = (
    content: string,
    type: MessageType = "info",
    duration = 3000,
  ) => {
    const id = Math.random().toString(36).substring(2, 9); // 生成简易唯一 ID

    messages.value.push({ id, content, type, duration });

    // 自动定时移除
    if (duration > 0) {
      setTimeout(() => {
        removeMessage(id);
      }, duration);
    }
  };

  /**
   * 手动移除消息
   */
  const removeMessage = (id: string) => {
    const index = messages.value.findIndex((msg) => msg.id === id);
    if (index !== -1) {
      messages.value.splice(index, 1);
    }
  };

  return {
    messages, // 导出状态供 UI 组件渲染使用
    info: (content: string, duration?: number) =>
      showMessage(content, "info", duration),
    success: (content: string, duration?: number) =>
      showMessage(content, "success", duration),
    warning: (content: string, duration?: number) =>
      showMessage(content, "warning", duration),
    error: (content: string, duration?: number) =>
      showMessage(content, "error", duration),
  };
}
