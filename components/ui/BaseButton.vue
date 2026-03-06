<template>
  <button
    :class="[
      'btn',
      {
        'btn-default': variant === 'default',
        'btn-neutral': variant === 'neutral',
        'btn-primary': variant === 'primary',
        'btn-secondary': variant === 'secondary',
        'btn-success': variant === 'success',
        'btn-error': variant === 'error',
        'btn-ghost': type === 'ghost',
        'btn-link': type === 'link',
        'btn-outline': type === 'outline',
        'btn-soft': type === 'soft',
        'btn-circle': shape === 'circle',
        'btn-square': shape === 'square',
        'btn-xs': size === 'xs',
        'btn-sm': size === 'sm',
        'btn-md': size === 'md',
        'btn-lg': size === 'lg',
        loading: loading,
      },
      className,
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
// 定义组件 props
const props = withDefaults(
  defineProps<{
    variant?:
      | "default"
      | "primary"
      | "secondary"
      | "success"
      | "error"
      | "neutral";
    size?: "xs" | "sm" | "md" | "lg";
    type?: "link" | "outline" | "soft" | "ghost"; // 按钮类型
    shape?: "circle" | "square"; // 按钮形状
    loading?: boolean;
    disabled?: boolean;
    className?: string;
  }>(),
  {
    variant: "primary",
    size: "md",
    loading: false,
    disabled: false,
    className: "",
  },
);

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();
</script>
