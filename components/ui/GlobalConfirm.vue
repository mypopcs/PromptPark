<template>
  <BaseModal
    v-model="state.isOpen"
    :title="state.title"
    widthClass="max-w-md"
    @close="handleCancel"
  >
    <template #title>
      <span
        :class="{
          'text-error': state.type === 'danger',
          'text-warning': state.type === 'warning',
          'text-info': state.type === 'info',
        }"
      >
        {{ state.title }}
      </span>
    </template>

    <div class="py-4 text-base text-base-content/80 font-medium">
      {{ state.message }}
    </div>

    <template #footer>
      <button class="btn btn-ghost" @click="handleCancel">
        {{ state.cancelText }}
      </button>
      <button
        class="btn px-6 shadow-sm text-white"
        :class="
          state.type === 'danger'
            ? 'btn-error shadow-error/30'
            : 'btn-primary shadow-primary/30'
        "
        @click="handleConfirm"
      >
        {{ state.confirmText }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from "./BaseModal.vue";
import { useConfirm } from "@/composables/useConfirm";

const { state } = useConfirm();

const handleConfirm = () => {
  state.isOpen = false;
  if (state.resolve) {
    state.resolve(true); // 告诉 await confirm() 用户点了确定
    state.resolve = null;
  }
};

const handleCancel = () => {
  state.isOpen = false;
  if (state.resolve) {
    state.resolve(false); // 告诉 await confirm() 用户点了取消或关了弹窗
    state.resolve = null;
  }
};
</script>
