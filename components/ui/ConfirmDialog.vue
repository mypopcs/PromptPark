<template>
  <dialog class="modal" :class="{ 'modal-open': state.isOpen }">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">{{ state.title }}</h3>
      <p class="py-2 text-base-content/80">{{ state.message }}</p>

      <div class="modal-action mt-6">
        <BaseButton class="btn btn-ghost" @click="handleAction(false)">
          {{ state.cancelText }}
        </BaseButton>
        <BaseButton
          class="btn"
          :class="{
            'btn-error': state.variant === 'danger',
            'btn-warning': state.variant === 'warning',
            'btn-primary': state.variant === 'info',
          }"
          @click="handleAction(true)"
        >
          {{ state.confirmText }}
        </BaseButton>
      </div>
    </div>

    <!-- <form
      method="dialog"
      class="modal-backdrop"
      @click.prevent="handleAction(false)"
    >
      <button>关闭</button>
    </form> -->
  </dialog>
</template>

<script setup lang="ts">
import { useConfirm } from "@/composables/useConfirm";
import BaseButton from "./BaseButton.vue";

const { state, handleAction } = useConfirm();
</script>
