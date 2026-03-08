// composables/useConfirm.ts
import { useConfirm as usePrimeVueConfirm } from "primevue/useconfirm";

export const useConfirm = () => {
  const confirm = usePrimeVueConfirm();

  const showConfirm = (
    message: string,
    header: string = "提示",
    severity: "info" | "warning" | "danger" = "warning",
    acceptLabel: string = "确定",
    rejectLabel: string = "取消",
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      confirm.require({
        message,
        header,
        icon: severity === "danger" ? "ri-error-warning-line" : severity === "warning" ? "ri-alert-line" : "ri-information-line",
        acceptLabel,
        rejectLabel,
        acceptClass: severity === "danger" ? "p-button-danger" : undefined,
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  };

  return {
    confirm: showConfirm,
  };
};
