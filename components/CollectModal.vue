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

const handleSave = async (formData: Partial<Prompt>) => {
  if (!formData.text || !formData.dictionaryId) {
    alert("请填写提示词和所属词典");
    return;
  }

  const prompts = await getPrompts();
  const newPrompt: Prompt = {
    ...(formData as Prompt),
    id: "p_" + Date.now(),
    tagIds: formData.tagIds || [],
    AIPlatformIds: formData.AIPlatformIds || [],
    AIModelIds: formData.AIModelIds || [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    viewNum: 0,
    favoriteNum: 0,
    useNum: 0,
  };

  prompts.push(newPrompt);
  await savePrompts(prompts);
  alert("采集成功！");
  modalRef.value?.close();
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
