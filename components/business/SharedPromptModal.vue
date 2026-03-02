<template>
  <BaseModal
    v-model="isVisible"
    :title="modalTitle"
    :confirmText="confirmButtonText"
    widthClass="max-w-4xl"
    @confirm="handleSave"
  >
    <div class="grid grid-cols-2 gap-2">
      <div class="space-y-4">
        <BaseInput
          v-model.trim="formData.prompt"
          label="提示词"
          :required="true"
          type="textarea"
          placeholder="输入核心提示词......"
        />
        <BaseInput
          v-model.trim="formData.translation"
          label="中文释义与结构说明"
          :required="true"
          type="textarea"
          placeholder="输入中文释义及用法提示..."
        />
        <MultiSelectInput
          label="关联标签"
          v-model="formData.tags"
          :options="tagsList"
          :allowCreate="true"
          :required="true"
          placeholder="输入新标签名称回车..."
          @create="handleCreateTag"
        />
        <div class="grid grid-cols-2 gap-2">
          <BaseSelect
            v-model="formData.dictionaryId"
            label="所属词典"
            :required="true"
            :options="
              dictionaries.map((dict) => ({
                value: dict.id,
                label: dict.name,
              }))
            "
            placeholder="请选择词典"
            @change="handleDictChange"
          />
          <BaseSelect
            v-model="formData.categoryId"
            label="所属分类"
            :required="true"
            :options="
              availableCategories.map((cat) => ({
                value: cat.id,
                label: cat.name,
              }))
            "
            :placeholder="formData.dictionaryId ? '请选择分类' : '请先选择词典'"
            :disabled="!formData.dictionaryId"
          />
        </div>
      </div>
      <div class="space-y-4">
        <BaseInput
          v-model.trim="formData.notes"
          label="备注"
          :required="false"
          type="textarea"
          placeholder="输入备注信息..."
        />
        <div class="grid grid-cols-2 gap-2">
          <MultiSelectInput
            v-model="formData.platforms"
            label="适用平台"
            :required="false"
            :options="platformsList"
            placeholder="请先选择平台..."
            @update:modelValue="handlePlatformChange"
          />
          <MultiSelectInput
            v-model="formData.models"
            label="适用模型"
            :required="false"
            :options="availableModels"
            :disabled="formData.platforms.length === 0"
            placeholder="请先选择模型..."
          />
        </div>

        <ImageUpload v-model="formData.thumbnail" label="缩略图" />
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import BaseSelect from "@/components/ui/BaseSelect.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
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
  props.mode === "collect" ? "采集" : "提交",
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
