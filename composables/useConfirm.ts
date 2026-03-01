/**
 * @file composables/useConfirm.ts
 * @description 全局二次确认弹窗 Hook，支持 Promise 异步等待用户点击
 */
import { reactive } from "vue";

export interface ConfirmState {
  isOpen: boolean;
  title: string;
  content: string;
  confirmText: string;
  cancelText: string;
  type: "danger" | "warning" | "info";
  resolve: (value: boolean) => void;
}

// 初始化全局响应式状态
const state = reactive<ConfirmState>({
  isOpen: false,
  title: "提示",
  content: "",
  confirmText: "确定",
  cancelText: "取消",
  type: "warning",
  resolve: () => {},
});

export function useConfirm() {
  /**
   * 唤起确认弹窗
   * @example const isOk = await confirm('确定要删除吗？');
   */
  const confirm = (
    content: string,
    title = "提示",
    type: ConfirmState["type"] = "warning",
    confirmText = "确定",
    cancelText = "取消",
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      state.title = title;
      state.content = content;
      state.type = type;
      state.confirmText = confirmText;
      state.cancelText = cancelText;
      state.isOpen = true;
      state.resolve = resolve;
    });
  };

  /**
   * 处理用户的点击操作 (UI 组件调用)
   */
  const handleAction = (result: boolean) => {
    state.isOpen = false;
    state.resolve(result);
  };

  return {
    state,
    confirm,
    handleAction,
  };
}
