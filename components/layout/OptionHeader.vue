<template>
  <header
    class="h-14 bg-base-100 border-b border-base-200 flex items-center px-4 shrink-0 gap-4 shadow-sm z-10"
  >
    <BaseButton
      variant="default"
      size="md"
      type="ghost"
      shape="square"
      @click="$emit('toggle-collapse')"
    >
      <i class="ri-menu-line text-lg"></i>
    </BaseButton>

    <div
      v-show="isCollapsed"
      class="font-bold text-lg text-primary flex items-center gap-2 animate-fade-in-right"
    >
      PromptPark
    </div>
  </header>
</template>

<script setup lang="ts">
import BaseButton from "@/components/ui/BaseButton.vue";
const props = defineProps<{
  isCollapsed: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle-collapse"): void;
}>();
</script>
