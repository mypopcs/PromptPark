<template>
  <header
    class="h-14 bg-base-100 border-b border-base-200 flex items-center px-4 shrink-0 gap-4 shadow-sm z-10"
  >
    <Button
      variant="text"
      severity="secondary"
      rounded
      @click="$emit('toggle-collapse')"
      class="!p-2"
    >
      <i class="ri-menu-line text-lg"></i>
    </Button>

    <div
      v-show="isCollapsed"
      class="font-bold text-lg text-primary flex items-center gap-2 animate-fade-in-right"
    >
      PromptPark
    </div>
  </header>
</template>

<script setup lang="ts">
import Button from "primevue/button";

const props = defineProps<{
  isCollapsed: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle-collapse"): void;
}>();
</script>
