<template>
  <BaseModal
    v-model="isVisible"
    :title="modalTitle"
    :confirmText="confirmButtonText"
    widthClass="max-w-4xl"
    @confirm="handleSave"
  >
    <div class="space-y-8">
      <div class="bg-base-100 p-5 rounded-xl border border-base-200 shadow-sm">
        <h4
          class="text-sm font-bold text-base-content/70 mb-4 uppercase tracking-wider"
        >
          分类归属
        </h4>
        <div class="grid grid-cols-2 gap-6">
          <div class="form-control w-full">
            <label class="label"
              ><span class="label-text font-medium"
                >所属词典 <span class="text-error">*</span></span
              ></label
            >
            <select
              v-model="formData.dictionaryId"
              class="select select-bordered w-full bg-base-100"
              @change="handleDictChange"
            >
              <option value="" disabled>请选择词典</option>
              <option
                v-for="dict in dictionaries"
                :key="dict.id"
                :value="dict.id"
              >
                {{ dict.name }}
              </option>
            </select>
          </div>
          <div class="form-control w-full">
            <label class="label"
              ><span class="label-text font-medium"
                >所属分类 <span class="text-error">*</span></span
              ></label
            >
            <select
              v-model="formData.categoryId"
              class="select select-bordered w-full bg-base-100"
              :disabled="!formData.dictionaryId"
            >
              <option value="" disabled>
                {{ formData.dictionaryId ? "请选择分类" : "请先选择词典" }}
              </option>
              <option
                v-for="cat in availableCategories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div class="form-control w-full">
          <label class="label"
            ><span class="label-text font-medium"
              >核心提示词 (Prompt) <span class="text-error">*</span></span
            ></label
          >
          <textarea
            v-model.trim="formData.prompt"
            class="textarea textarea-bordered h-36 font-mono text-sm leading-relaxed"
            placeholder="输入核心提示词..."
            required
          ></textarea>
        </div>
        <div class="form-control w-full flex flex-col">
          <label class="label"
            ><span class="label-text font-medium"
              >中文释义与结构说明 <span class="text-error">*</span></span
            ></label
          >
          <textarea
            v-model.trim="formData.translation"
            class="textarea textarea-bordered flex-1 leading-relaxed"
            placeholder="输入中文释义及用法提示..."
            required
          ></textarea>
        </div>
      </div>

      <div class="bg-base-100 p-5 rounded-xl border border-base-200 shadow-sm">
        <h4
          class="text-sm font-bold text-base-content/70 mb-4 uppercase tracking-wider"
        >
          AI 引擎兼容性
        </h4>
        <div class="grid grid-cols-2 gap-6">
          <div class="form-control w-full">
            <label class="label"
              ><span class="label-text font-medium"
                >适用平台 (可多选)</span
              ></label
            >
            <MultiSelectInput
              v-model="formData.platforms"
              :options="platformsList"
              placeholder="选择兼容的平台..."
              @update:modelValue="handlePlatformChange"
            />
          </div>
          <div class="form-control w-full">
            <label class="label"
              ><span class="label-text font-medium"
                >最佳实践模型 (基于平台过滤)</span
              ></label
            >
            <MultiSelectInput
              v-model="formData.models"
              :options="availableModels"
              :disabled="formData.platforms.length === 0"
              placeholder="请先选择平台..."
            />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-6">
        <div class="col-span-2 space-y-4">
          <div class="form-control w-full">
            <label class="label"
              ><span class="label-text font-medium"
                >关联标签 <span class="text-error">*</span></span
              ></label
            >
            <MultiSelectInput
              v-model="formData.tags"
              :options="tagsList"
              :allowCreate="true"
              placeholder="输入新标签名称回车..."
              @create="handleCreateTag"
            />
          </div>
          <div class="form-control w-full">
            <label class="label"
              ><span class="label-text font-medium">内部备注</span></label
            >
            <input
              v-model.trim="formData.notes"
              type="text"
              class="input input-bordered w-full"
              placeholder="备注信息..."
            />
          </div>
        </div>
        <div class="form-control w-full">
          <label class="label"
            ><span class="label-text font-medium">可视化封面</span></label
          >
          <ImageUpload v-model="formData.thumbnail" />
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import MultiSelectInput from "@/components/ui/MultiSelectInput.vue";
import ImageUpload from "@/components/ui/ImageUpload.vue";
import { localStore } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config";
import { createDefaultPrompt, createDefaultTag } from "@/utils/factories";
import { useMessage } from "@/composables/useMessage";
import type {
  PromptItem,
  DictionaryItem,
  CategoryItem,
  PlatformItem,
  AIModelItem,
  TagItem,
} from "@/types";

const props = defineProps<{
  modelValue: boolean;
  mode: "create" | "edit" | "collect";
  initialData?: PromptItem;
}>();

const emit = defineEmits(["update:modelValue", "save"]);
const { warning, success } = useMessage();

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const modalTitle = computed(() => {
  if (props.mode === "create") return "创作新提示词";
  if (props.mode === "edit") return "编辑提示词";
  return "🌟 采集到 PromptPark";
});

const confirmButtonText = computed(() =>
  props.mode === "collect" ? "一键收藏" : "保存并生效",
);

// 数据列表
const dictionaries = ref<DictionaryItem[]>([]);
const categories = ref<CategoryItem[]>([]);
const platformsList = ref<PlatformItem[]>([]);
const allModelsList = ref<AIModelItem[]>([]);
const tagsList = ref<TagItem[]>([]);
const formData = ref<PromptItem>(createDefaultPrompt());

// 🌟 核心：清洗 ID 数组，防止出现对象
const ensureIdArray = (data: any) => {
  if (!Array.isArray(data)) return [];
  return data
    .map((item) =>
      typeof item === "object" && item !== null ? item.id || item.value : item,
    )
    .filter(Boolean);
};

watch(
  () => props.modelValue,
  async (newVal) => {
    if (newVal) {
      const [d, c, p, m, t] = await Promise.all([
        localStore.get(STORAGE_KEYS.DICTIONARIES, []),
        localStore.get(STORAGE_KEYS.CATEGORIES, []),
        localStore.get(STORAGE_KEYS.PLATFORMS, []),
        localStore.get(STORAGE_KEYS.MODELS, []),
        localStore.get(STORAGE_KEYS.TAGS, []),
      ]);

      dictionaries.value = Array.isArray(d) ? d : Object.values(d || {});
      categories.value = Array.isArray(c) ? c : Object.values(c || {});
      platformsList.value = Array.isArray(p) ? p : Object.values(p || {});
      allModelsList.value = Array.isArray(m) ? m : Object.values(m || {});
      tagsList.value = Array.isArray(t) ? t : Object.values(t || {});

      if (
        props.initialData &&
        (props.mode === "edit" || props.mode === "collect")
      ) {
        const raw = JSON.parse(JSON.stringify(props.initialData));
        formData.value = {
          ...createDefaultPrompt(),
          ...raw,
          // 🌟 强力清洗进入表单的数据
          platforms: ensureIdArray(raw.platforms),
          models: ensureIdArray(raw.models),
          tags: ensureIdArray(raw.tags),
        };
      } else {
        formData.value = createDefaultPrompt();
      }
    }
  },
);

// 🌟 联动过滤逻辑
const availableCategories = computed(() =>
  categories.value.filter(
    (c) => c.dictionaryId === formData.value.dictionaryId,
  ),
);
const availableModels = computed(() => {
  if (formData.value.platforms.length === 0) return [];
  return allModelsList.value.filter((m) =>
    formData.value.platforms.includes(m.platformId),
  );
});

const handleDictChange = () => (formData.value.categoryId = "");
const handlePlatformChange = () => {
  // 切换平台时，自动移除不再匹配的模型 ID
  const validModelIds = availableModels.value.map((m) => m.id);
  formData.value.models = formData.value.models.filter((id) =>
    validModelIds.includes(id),
  );
};

const handleCreateTag = async (tagName: string) => {
  const newTag = createDefaultTag(tagName);
  tagsList.value.unshift(newTag);
  formData.value.tags.push(newTag.id);
  await localStore.set(STORAGE_KEYS.TAGS, tagsList.value);
  success(`标签 "${tagName}" 已创建`);
};

const handleSave = () => {
  if (
    !formData.value.dictionaryId ||
    !formData.value.categoryId ||
    !formData.value.prompt ||
    !formData.value.translation
  ) {
    warning("请填写完整的必填项 (*)");
    return;
  }

  // 🌟 再次确认导出的数据是纯净的 ID 数组
  const finalPayload = {
    ...JSON.parse(JSON.stringify(formData.value)),
    platforms: ensureIdArray(formData.value.platforms),
    models: ensureIdArray(formData.value.models),
    tags: ensureIdArray(formData.value.tags),
  };

  emit("save", finalPayload);
  isVisible.value = false;
};
</script>
