// composables/useConfirm.ts
import { reactive } from "vue";

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  type: "info" | "warning" | "danger";
  confirmText: string;
  cancelText: string;
  resolve: ((value: boolean) => void) | null;
}

// 极其优雅的单例模式：全局共享这一个 state
const state = reactive<ConfirmState>({
  isOpen: false,
  title: "",
  message: "",
  type: "info",
  confirmText: "确定",
  cancelText: "取消",
  resolve: null,
});

export const useConfirm = () => {
  /**
   * 唤起全局确认弹窗
   * @param message 提示正文
   * @param title 标题
   * @param type 类型 (决定按钮颜色和图标)
   * @param confirmText 确认按钮文字
   * @param cancelText 取消按钮文字
   */
  const confirm = (
    message: string,
    title: string = "提示",
    type: "info" | "warning" | "danger" = "warning",
    confirmText: string = "确定",
    cancelText: string = "取消",
  ): Promise<boolean> => {
    state.message = message;
    state.title = title;
    state.type = type;
    state.confirmText = confirmText;
    state.cancelText = cancelText;
    state.isOpen = true;

    // 返回一个 Promise，等到用户点击弹窗按钮时才 resolve
    return new Promise((resolve) => {
      state.resolve = resolve;
    });
  };

  return { state, confirm };
};
