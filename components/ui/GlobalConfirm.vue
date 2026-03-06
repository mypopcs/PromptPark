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
          'text-error': state.variant === 'danger',
          'text-warning': state.variant === 'warning',
          'text-info': state.variant === 'info',
        }"
      >
        {{ state.title }}
      </span>
    </template>

    <div class="py-4 text-base text-base-content/80 font-medium">
      {{ state.message }}
    </div>

    <template #footer>
      <BaseButton
        variant="default"
        size="md"
        type="ghost"
        @click="handleCancel"
      >
        {{ state.cancelText }}
      </BaseButton>
      <BaseButton variant="error" size="md" @click="handleConfirm">
        {{ state.confirmText }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from "./BaseModal.vue";
import { useConfirm } from "@/composables/useConfirm";
import BaseButton from "./BaseButton.vue";

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
