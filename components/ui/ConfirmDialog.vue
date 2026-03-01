<template>
  <dialog class="modal" :class="{ 'modal-open': state.isOpen }">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">{{ state.title }}</h3>
      <p class="py-2 text-base-content/80">{{ state.content }}</p>

      <div class="modal-action mt-6">
        <button class="btn btn-ghost" @click="handleAction(false)">
          {{ state.cancelText }}
        </button>
        <button
          class="btn"
          :class="{
            'btn-error': state.type === 'danger',
            'btn-warning': state.type === 'warning',
            'btn-primary': state.type === 'info',
          }"
          @click="handleAction(true)"
        >
          {{ state.confirmText }}
        </button>
      </div>
    </div>

    <form
      method="dialog"
      class="modal-backdrop"
      @click.prevent="handleAction(false)"
    >
      <button>关闭</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { useConfirm } from "@/composables/useConfirm";

const { state, handleAction } = useConfirm();
</script>
