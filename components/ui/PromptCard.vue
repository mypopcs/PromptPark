<template>
  <div class="relative h-16 w-full group" @click="emit('click', prompt)">
    <div
      class="absolute inset-0 z-10 border border-gray-300 rounded-lg shadow-sm cursor-pointer bg-gray-400 overflow-hidden transition-all duration-300 ease-in-out hover:z-50 hover:h-auto hover:min-h-[14rem] hover:pb-4 hover:shadow-xl"
    >
      <div class="absolute inset-0">
        <img
          v-if="prompt.thumbnail"
          :src="prompt.thumbnail"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      <div
        class="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors"
      ></div>

      <div
        class="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <span class="badge badge-secondary font-normal text-[10px]">
          {{ categoryName }}
        </span>
      </div>

      <div class="absolute inset-0 flex flex-col justify-end p-2 z-10">
        <p
          class="text-sm font-medium text-white text-center break-all line-clamp-1 group-hover:line-clamp-none transition-all"
        >
          {{ prompt.prompt }}
        </p>
        <p
          class="text-xs text-white/90 text-center break-all line-clamp-1 group-hover:line-clamp-none"
        >
          {{ prompt.translation }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PromptItem } from "@/types";

interface Props {
  prompt: PromptItem;
  categoryName?: string;
}

withDefaults(defineProps<Props>(), {
  categoryName: "",
});

const emit = defineEmits<{
  click: [prompt: PromptItem];
}>();
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.group-hover\:line-clamp-none {
  display: block;
  -webkit-line-clamp: unset;
}
</style>
