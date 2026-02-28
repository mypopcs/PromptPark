<template>
  <PromptFormModal
    ref="modalRef"
    title="采集提示词"
    icon="📥"
    confirm-text="保存采集"
    cancel-text="取消"
    :dictionaries="dictionaries"
    :categories="categories"
    :tags="tags"
    :platforms="platforms"
    :models="models"
    :is-uploading="isUploading"
    @save="handleSave"
    @image-upload="handleImageUpload"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useMessage } from "@/composables/useMessage";
import {
  getDictionaries,
  getCategories,
  savePrompts,
  getPrompts,
  getPlatforms,
  getModels,
  getTags,
} from "@/utils/storage";
import type {
  Prompt,
  Dictionary,
  Category,
  AIPlatform,
  AIModel,
  PromptTag,
} from "@/types";
import PromptFormModal from "./PromptFormModal.vue";

const modalRef = ref<InstanceType<typeof PromptFormModal> | null>(null);
const isUploading = ref(false);

const dictionaries = ref<Dictionary[]>([]);
const categories = ref<Category[]>([]);
const platforms = ref<AIPlatform[]>([]);
const models = ref<AIModel[]>([]);
const tags = ref<PromptTag[]>([]);

const { success, error } = useMessage();

/**
 * 将未知错误转换为用户可读文案。
 */
const getErrorMessage = (value: unknown): string => {
  if (value instanceof Error) return value.message;
  return "操作失败，请稍后重试";
};

const handleImageUpload = async (file: File) => {
  if (!file) return;
  isUploading.value = true;
  setTimeout(() => {
    isUploading.value = false;
  }, 8000);
};

const show = (selectedText: string) => {
  modalRef.value?.show({
    text: selectedText,
    dictionaryId: dictionaries.value[0]?.id || "",
    tagIds: [],
    AIPlatformIds: [],
    AIModelIds: [],
  });
};

/**
 * 保存采集到的提示词。
 * 包含输入校验、异常捕获和用户友好消息提示。
 */
const handleSave = async (formData: Partial<Prompt>) => {
  if (!formData.text || !formData.dictionaryId) {
    error("请填写提示词和所属词典");
    return;
  }

  try {
    const prompts = await getPrompts();
    const newPrompt: Prompt = {
      id: `p_${Date.now()}`,
      dictionaryId: formData.dictionaryId,
      categoryId: formData.categoryId || "",
      text: formData.text,
      chinese: formData.chinese || "",
      remark: formData.remark || "",
      imageUrl: formData.imageUrl,
      viewNum: 0,
      favoriteNum: 0,
      useNum: 0,
      tagIds: formData.tagIds || [],
      AIPlatformIds: formData.AIPlatformIds || [],
      AIModelIds: formData.AIModelIds || [],
      parkUseNum: formData.parkUseNum || false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      feishuRecordId: formData.feishuRecordId,
    };

    prompts.push(newPrompt);
    await savePrompts(prompts);
    success("采集成功！");
    modalRef.value?.close();
  } catch (e: unknown) {
    error(`采集失败：${getErrorMessage(e)}`);
  }
};

onMounted(async () => {
  const [dics, cats, plats, mods, t] = await Promise.all([
    getDictionaries(),
    getCategories(),
    getPlatforms(),
    getModels(),
    getTags(),
  ]);
  dictionaries.value = dics;
  categories.value = cats;
  platforms.value = plats;
  models.value = mods;
  tags.value = t;
});

defineExpose({ show });
</script>
