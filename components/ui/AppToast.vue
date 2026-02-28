<template>
  <div class="toast toast-top toast-end z-[9999]">
    <div
      v-for="item in messages"
      :key="item.id"
      class="alert"
      :class="alertClassMap[item.type]"
      role="alert"
    >
      <span>{{ item.text }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMessage, type MessageType } from "@/composables/useMessage";

/**
 * 消息类型与 DaisyUI 样式映射。
 */
const alertClassMap: Record<MessageType, string> = {
  success: "alert-success",
  error: "alert-error",
  warning: "alert-warning",
  info: "alert-info"
};

const { messages } = useMessage();
</script>
