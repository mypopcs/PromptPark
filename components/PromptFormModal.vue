<template>
  <dialog ref="modalRef" class="modal">
    <div class="modal-box max-w-4xl">
      <h3 class="font-bold text-lg border-b pb-2 mb-4 flex items-center gap-2">
        <span v-if="icon" class="text-primary">{{ icon }}</span>
        {{ title }}
      </h3>

      <div class="grid grid-cols-2 gap-8 text-sm">
        <div class="space-y-4">
          <label class="form-control">
            <span class="label-text font-bold">英文提示词 (Prompt)</span>
            <textarea
              v-model="formData.text"
              class="textarea textarea-bordered h-32"
              placeholder="输入核心提示词..."
            ></textarea>
          </label>
          <label class="form-control">
            <span class="label-text font-bold">中文解释</span>
            <input
              v-model="formData.chinese"
              type="text"
              class="input input-bordered"
              placeholder="用于搜索和识别"
            />
          </label>
          <div class="form-control">
            <span class="label-text">备注</span>
            <input
              v-model="formData.remark"
              type="text"
              class="input input-bordered"
            />
          </div>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <label class="form-control">
              <span class="label-text">所属词典</span>
              <select
                v-model="formData.dictionaryId"
                class="select select-bordered select-sm"
              >
                <option v-for="d in dictionaries" :key="d.id" :value="d.id">
                  {{ d.name }}
                </option>
              </select>
            </label>
            <label class="form-control">
              <span class="label-text">所属分类</span>
              <select
                v-model="formData.categoryId"
                class="select select-bordered select-sm"
              >
                <option
                  v-for="c in availableCategories"
                  :key="c.id"
                  :value="c.id"
                >
                  {{ c.name }}
                </option>
              </select>
            </label>
          </div>

          <div class="form-control border p-3 rounded-lg bg-base-200/30">
            <span class="label-text mb-2">提示词封面 (GitHub 上传)</span>
            <div class="flex items-center gap-4">
              <div
                class="w-16 h-16 bg-base-100 rounded border border-dashed flex items-center justify-center overflow-hidden"
              >
                <img
                  v-if="formData.imageUrl"
                  :src="formData.imageUrl"
                  class="object-cover w-full h-full"
                />
                <span v-else class="text-[10px] opacity-30">预览</span>
              </div>
              <input
                type="file"
                @change="handleImageUpload"
                class="file-input file-input-bordered file-input-sm flex-1"
                accept="image/*"
              />
            </div>
          </div>

          <div class="form-control">
            <span class="label-text mb-1">标签</span>
            <div class="flex gap-2 mb-2">
              <input
                v-model="newTagInput"
                type="text"
                class="input input-bordered input-sm flex-1"
                placeholder="输入新标签名称，按回车添加"
                @keyup.enter="handleAddNewTag"
              />
              <button class="btn btn-sm btn-secondary" @click="handleAddNewTag">
                添加标签
              </button>
            </div>
            <div
              class="flex flex-wrap gap-2 border p-2 rounded-lg max-h-24 overflow-y-auto"
            >
              <label
                v-for="tag in tags"
                :key="tag.id"
                class="flex items-center gap-1 cursor-pointer badge badge-outline badge-sm p-2"
                :class="{ 'badge-primary': formData.tagIds?.includes(tag.id) }"
              >
                <input
                  type="checkbox"
                  v-model="formData.tagIds"
                  :value="tag.id"
                  class="checkbox checkbox-xs hidden"
                />
                <span class="text-xs">{{ tag.name }}</span>
              </label>
              <span v-if="tags.length === 0" class="text-xs opacity-50"
                >暂无标签，请在上方输入新建</span
              >
            </div>
          </div>

          <div class="form-control">
            <span class="label-text mb-1">适用平台</span>
            <div
              class="flex flex-wrap gap-2 border p-2 rounded-lg max-h-24 overflow-y-auto"
            >
              <label
                v-for="platform in platforms"
                :key="platform.id"
                class="flex items-center gap-1 cursor-pointer badge badge-outline badge-sm p-2"
                :class="{
                  'badge-secondary': formData.AIPlatformIds?.includes(
                    platform.id,
                  ),
                }"
              >
                <input
                  type="checkbox"
                  v-model="formData.AIPlatformIds"
                  :value="platform.id"
                  class="checkbox checkbox-xs hidden"
                />
                <span class="text-xs">{{ platform.name }}</span>
              </label>
              <span v-if="platforms.length === 0" class="text-xs opacity-50"
                >暂无平台，请在平台管理中添加</span
              >
            </div>
          </div>

          <div class="form-control">
            <span class="label-text mb-1">适用模型</span>
            <div
              class="flex flex-wrap gap-2 border p-2 rounded-lg max-h-24 overflow-y-auto"
            >
              <label
                v-for="model in availableModels"
                :key="model.id"
                class="flex items-center gap-1 cursor-pointer badge badge-outline badge-sm p-2"
                :class="{
                  'badge-accent': formData.AIModelIds?.includes(model.id),
                }"
              >
                <input
                  type="checkbox"
                  v-model="formData.AIModelIds"
                  :value="model.id"
                  class="checkbox checkbox-xs hidden"
                />
                <span class="text-xs">{{ model.name }}</span>
              </label>
              <span
                v-if="availableModels.length === 0"
                class="text-xs opacity-50"
                >请先选择适用平台</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="modal-action">
        <button class="btn btn-ghost" @click="close">{{ cancelText }}</button>
        <button
          class="btn btn-primary"
          @click="handleSave"
          :disabled="!formData.text || !formData.dictionaryId || isUploading"
        >
          <span v-if="isUploading" class="loading loading-spinner"></span>
          {{ confirmText }}
        </button>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { saveTags } from "@/utils/storage";
import type {
  Prompt,
  Dictionary,
  Category,
  PromptTag,
  AIPlatform,
  AIModel,
} from "@/types";

interface Props {
  // 弹窗配置
  title: string;
  icon?: string;
  confirmText: string;
  cancelText: string;
  // 数据选项
  dictionaries: Dictionary[];
  categories: Category[];
  tags: PromptTag[];
  platforms: AIPlatform[];
  models: AIModel[];
  // 状态
  isUploading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  icon: "",
  isUploading: false,
});

const emit = defineEmits<{
  (e: "save", data: Partial<Prompt>): void;
  (e: "imageUpload", file: File): void;
}>();

const modalRef = ref<HTMLDialogElement | null>(null);
const newTagInput = ref("");

const formData = ref<Partial<Prompt>>({
  text: "",
  chinese: "",
  remark: "",
  imageUrl: "",
  dictionaryId: "",
  categoryId: "",
  tagIds: [],
  AIPlatformIds: [],
  AIModelIds: [],
});

const availableCategories = computed(() => {
  const dict = props.dictionaries.find(
    (d) => d.id === formData.value.dictionaryId,
  );
  return dict
    ? props.categories.filter((cat) => dict.categoryIds.includes(cat.id))
    : [];
});

const availableModels = computed(() => {
  if (
    !formData.value.AIPlatformIds ||
    formData.value.AIPlatformIds.length === 0
  ) {
    return [];
  }
  const selectedPlatformModelIds = new Set<string>();
  formData.value.AIPlatformIds.forEach((platformId) => {
    const platform = props.platforms.find((p) => p.id === platformId);
    if (platform) {
      platform.AIModelIds.forEach((modelId) => {
        selectedPlatformModelIds.add(modelId);
      });
    }
  });
  return props.models.filter((m) => selectedPlatformModelIds.has(m.id));
});

const handleAddNewTag = async () => {
  const tagName = newTagInput.value.trim();
  if (!tagName) return;

  const existingTag = props.tags.find((t) => t.name === tagName);
  if (existingTag) {
    if (!formData.value.tagIds) {
      formData.value.tagIds = [];
    }
    if (!formData.value.tagIds.includes(existingTag.id)) {
      formData.value.tagIds.push(existingTag.id);
    }
    newTagInput.value = "";
    return;
  }

  const newTag: PromptTag = {
    id: "tag_" + Date.now(),
    name: tagName,
    num: 0,
  };
  props.tags.push(newTag);

  await saveTags(props.tags);

  if (!formData.value.tagIds) {
    formData.value.tagIds = [];
  }
  formData.value.tagIds.push(newTag.id);

  newTagInput.value = "";
};

const handleImageUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    emit("imageUpload", file);
  }
};

const handleSave = () => {
  emit("save", { ...formData.value });
};

// 公开方法
const show = (initialData?: Partial<Prompt>) => {
  if (initialData) {
    formData.value = {
      text: initialData.text || "",
      chinese: initialData.chinese || "",
      remark: initialData.remark || "",
      imageUrl: initialData.imageUrl || "",
      dictionaryId: initialData.dictionaryId || props.dictionaries[0]?.id || "",
      categoryId: initialData.categoryId || "",
      tagIds: initialData.tagIds || [],
      AIPlatformIds: initialData.AIPlatformIds || [],
      AIModelIds: initialData.AIModelIds || [],
    };
  } else {
    formData.value = {
      text: "",
      chinese: "",
      remark: "",
      imageUrl: "",
      dictionaryId: props.dictionaries[0]?.id || "",
      categoryId: "",
      tagIds: [],
      AIPlatformIds: [],
      AIModelIds: [],
    };
  }
  modalRef.value?.showModal();
};

const close = () => {
  modalRef.value?.close();
};

watch(
  () => formData.value.dictionaryId,
  () => {
    formData.value.categoryId = "";
  },
);

watch(
  () => formData.value.AIPlatformIds,
  () => {
    if (formData.value.AIModelIds) {
      const availableModelIds = new Set(availableModels.value.map((m) => m.id));
      formData.value.AIModelIds = formData.value.AIModelIds.filter((id) =>
        availableModelIds.has(id),
      );
    }
  },
  { deep: true },
);

defineExpose({ show, close });
</script>
