<template>
  <div class="toast toast-top toast-center z-[9999] pointer-events-none">
    <TransitionGroup name="toast-list">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="alert shadow-lg pointer-events-auto"
        :class="{
          'alert-info': msg.type === 'info',
          'alert-success': msg.type === 'success',
          'alert-warning': msg.type === 'warning',
          'alert-error': msg.type === 'error',
        }"
      >
        <span class="text-sm font-medium">{{ msg.content }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useMessage } from "@/composables/useMessage";

// 拿到刚才 hook 里的全局状态
const { messages } = useMessage();
</script>

<style scoped>
/* 丝滑的进出场动画 */
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s ease;
}
.toast-list-enter-from,
.toast-list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
