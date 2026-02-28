import { ref } from "vue";

/** 二次确认对话框状态 */
export interface ConfirmState {
  /** 对话框标题 */
  title: string;
  /** 对话框正文 */
  message: string;
  /** 是否显示 */
  visible: boolean;
}

const state = ref<ConfirmState>({
  title: "二次确认",
  message: "你确定要执行该操作吗？",
  visible: false
});

let resolver: ((value: boolean) => void) | null = null;

/**
 * 二次确认 Hook。
 */
export function useConfirm() {
  const openConfirm = (title: string, message: string): Promise<boolean> => {
    state.value = { title, message, visible: true };

    return new Promise<boolean>((resolve) => {
      resolver = resolve;
    });
  };

  const confirm = (): void => {
    state.value.visible = false;
    resolver?.(true);
    resolver = null;
  };

  const cancel = (): void => {
    state.value.visible = false;
    resolver?.(false);
    resolver = null;
  };

  return {
    state,
    openConfirm,
    confirm,
    cancel
  };
}
