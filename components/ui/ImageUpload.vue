<template>
  <div class="w-full" @click="triggerUpload">
    <label class="label" v-if="label">
      <span class="label-text font-medium text-sm mb-1">
        {{ label }}
        <span v-if="required" class="text-error">*</span>
      </span>
    </label>
    <div
      class="relative h-32 border-2 border-dashed border-base-300 rounded-box items-center justify-center overflow-hidden hover:border-primary transition-colors bg-base-200/50 group cursor-pointer flex"
    >
      <input
        type="file"
        ref="fileInput"
        class="hidden"
        accept="image/png, image/jpeg, image/gif, image/webp"
        @change="handleFileChange"
      />

      <div
        v-if="isUploading"
        class="absolute inset-0 bg-base-100/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm"
      >
        <span class="loading loading-spinner loading-md text-primary"></span>
        <span class="text-xs mt-2 font-medium text-primary">图片上传中...</span>
      </div>

      <template v-else-if="modelValue">
        <img
          :src="modelValue"
          class="w-full h-full object-cover"
          alt="Preview"
        />
        <div
          class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300"
        >
          <span class="text-white text-sm font-medium">点击更换图片</span>
        </div>
        <button
          @click.stop="clearImage"
          class="btn btn-xs btn-circle btn-error absolute top-2 right-2 opacity-0 group-hover:opacity-100 z-20 shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-3 h-3"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </template>

      <div
        v-else
        class="flex flex-col items-center text-base-content/50 group-hover:text-primary transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-8 h-8 mb-1"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
        <span class="text-xs font-medium">点击上传图片 (最大 5MB)</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ImageHostService } from "@/utils/imageHost";
import { useMessage } from "@/composables/useMessage";

const props = defineProps<{
  modelValue?: string;
  label?: string;
  required?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const { error, success } = useMessage();
const fileInput = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);

const triggerUpload = () => {
  if (!isUploading.value) fileInput.value?.click();
};

const clearImage = () => {
  emit("update:modelValue", "");
  if (fileInput.value) fileInput.value.value = ""; // 清空 input 缓存
};

const handleFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // 限制 5MB 大小
  if (file.size > 5 * 1024 * 1024) {
    error("图片体积不能超过 5MB");
    target.value = "";
    return;
  }

  try {
    isUploading.value = true;
    const url = await ImageHostService.upload(file);
    emit("update:modelValue", url);
    success("图片上传成功！");
  } catch (err: any) {
    error(err.message || "图片上传失败");
  } finally {
    isUploading.value = false;
    target.value = ""; // 允许重复上传同名文件
  }
};
</script>
