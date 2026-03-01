<template>
  <dialog class="modal" :class="{ 'modal-open': modelValue }">
    <div
      :class="[
        'modal-box p-0 overflow-hidden flex flex-col max-h-[90vh] rounded-2xl shadow-2xl bg-base-100',
        widthClass,
      ]"
    >
      <div
        class="px-6 py-4 border-b border-base-200 bg-base-100/80 backdrop-blur-md flex justify-between items-center sticky top-0 z-20"
      >
        <h3 class="font-bold text-lg text-base-content flex items-center gap-2">
          <span class="w-1.5 h-5 bg-primary rounded-full"></span>
          <slot name="title">{{ title }}</slot>
        </h3>
        <button
          class="btn btn-sm btn-circle btn-ghost text-base-content/50"
          @click="close"
        >
          ✕
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 bg-base-200/20">
        <slot></slot>
      </div>

      <div
        class="px-6 py-4 border-t border-base-200 bg-base-100 flex justify-end gap-3 sticky bottom-0 z-20"
      >
        <slot name="footer">
          <button type="button" class="btn btn-ghost" @click="close">
            {{ cancelText }}
          </button>
          <button
            type="button"
            class="btn btn-primary px-8 shadow-lg shadow-primary/30"
            :disabled="loading"
            @click="confirm"
          >
            <span
              v-if="loading"
              class="loading loading-spinner loading-xs"
            ></span>
            <slot name="confirmIcon"></slot>
            {{ confirmText }}
          </button>
        </slot>
      </div>
    </div>
    <form
      method="dialog"
      class="modal-backdrop bg-neutral/40 backdrop-blur-sm"
      @click.prevent="close"
    >
      <button>关闭</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean; // 控制弹窗显示
    title?: string; // 弹窗标题
    confirmText?: string; // 确认按钮文字
    cancelText?: string; // 取消按钮文字
    loading?: boolean; // 确认按钮的 loading 状态
    widthClass?: string; // 控制弹窗宽度，如 max-w-2xl, max-w-4xl
  }>(),
  {
    title: "提示",
    confirmText: "确定",
    cancelText: "取消",
    loading: false,
    widthClass: "max-w-2xl",
  },
);

const emit = defineEmits(["update:modelValue", "confirm", "close"]);

const close = () => {
  emit("update:modelValue", false);
  emit("close");
};

const confirm = () => {
  emit("confirm");
};
</script>
