<template>
  <dialog class="modal" :class="{ 'modal-open': state.visible }">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ state.title }}</h3>
      <p class="py-4">{{ state.message }}</p>
      <div class="modal-action">
        <button class="btn" @click="cancel">取消</button>
        <button class="btn btn-error" @click="confirm">确认</button>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { useConfirm } from "@/composables/useConfirm";

/**
 * 全局二次确认弹窗。
 */
const { state, confirm, cancel } = useConfirm();
</script>
