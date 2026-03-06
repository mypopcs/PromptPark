<template>
  <span
    :class="[
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors',
      sizeClasses,
      { 'rounded-full': circle, 'rounded-lg': !circle },
    ]"
    :style="tagStyle"
  >
    <span>{{ label }}</span>
    <button
      v-if="closable"
      type="button"
      class="text-current hover:opacity-70 transition-opacity"
      @click.stop="$emit('close', value)"
    >
      <i class="ri-close-line" :class="sizeIconClasses"></i>
    </button>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  label: string;
  value?: string | number;
  color?: string;
  variant?: "primary" | "success" | "neutral" | "warning" | "danger";
  closable?: boolean;
  size?: "large" | "default" | "small";
  type?: "dark" | "light" | "plain";
  circle?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  value: "",
  variant: "neutral",
  closable: false,
  size: "default",
  type: "light",
  circle: true,
});

const emit = defineEmits(["close"]);

// 基于字符串生成哈希值
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// 生成随机颜色（基于 label，确保相同的 label 总是生成相同的颜色）
const generateRandomColor = (label: string): string => {
  const colors = [
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#f43f5e", // rose
    "#ef4444", // red
    "#f97316", // orange
    "#f59e0b", // amber
    "#84cc16", // lime
    "#22c55e", // green
    "#10b981", // emerald
    "#14b8a6", // teal
    "#06b6d4", // cyan
    "#0ea5e9", // sky
    "#6366f1", // indigo
    "#a855f7", // purple
  ];
  const hash = hashString(label);
  return colors[hash % colors.length];
};

// 根据颜色计算文字颜色（深色或白色）
const getTextColor = (bgColor: string): string => {
  // 将十六进制颜色转换为 RGB
  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // 计算亮度
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#1f2937" : "#ffffff";
};

// 计算标签样式
const tagStyle = computed(() => {
  // 如果提供了自定义颜色，使用自定义颜色
  if (props.color) {
    return {
      backgroundColor: props.color,
      color: getTextColor(props.color),
    };
  }
  // 否则基于 label 生成随机颜色
  const randomColor = generateRandomColor(props.label);
  return {
    backgroundColor: randomColor,
    color: getTextColor(randomColor),
  };
});

const sizeClasses = {
  large: "text-sm py-1 px-3",
  default: "text-xs py-0.5 px-2",
  small: "text-[12px] py-0.25 px-1.5",
}[props.size];

const sizeIconClasses = {
  large: "text-sm",
  default: "text-xs",
  small: "text-[12px]",
}[props.size];
</script>
