<template>
  <button class="btn" :class="buttonClass" :disabled="disabled || loading" @click="handleClick">
    <span v-if="loading" class="loading loading-spinner loading-xs"></span>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

/**
 * 按钮尺寸类型。
 */
type ButtonSize = "xs" | "sm" | "md" | "lg";

/**
 * 按钮风格类型。
 */
type ButtonVariant = "primary" | "secondary" | "accent" | "neutral" | "ghost" | "error";

const props = withDefaults(
  defineProps<{
    /** 是否禁用 */
    disabled?: boolean;
    /** 是否显示加载状态 */
    loading?: boolean;
    /** 按钮尺寸 */
    size?: ButtonSize;
    /** 按钮风格 */
    variant?: ButtonVariant;
  }>(),
  {
    disabled: false,
    loading: false,
    size: "md",
    variant: "primary"
  }
);

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

/**
 * 计算按钮样式。
 */
const buttonClass = computed(() => [`btn-${props.variant}`, `btn-${props.size}`]);

/**
 * 点击事件透传。
 */
function handleClick(event: MouseEvent): void {
  emit("click", event);
}
</script>
