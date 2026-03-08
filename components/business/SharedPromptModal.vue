<template>
  <Dialog
    v-model:visible="isVisible"
    :header="modalTitle"
    :style="{ width: '900px' }"
    :modal="true"
  >
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">
            提示词 <span class="text-red-500">*</span>
          </label>
          <Textarea
            v-model.trim="formData.prompt"
            placeholder="输入核心提示词......"
            rows="3"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">
            中文释义与结构说明 <span class="text-red-500">*</span>
          </label>
          <Textarea
            v-model.trim="formData.translation"
            placeholder="输入中文释义及用法提示..."
            rows="3"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">
            关联标签 <span class="text-red-500">*</span>
          </label>
          <MultiSelect
            v-model="formData.tags"
            :options="tagsList"
            optionLabel="name"
            optionValue="id"
            placeholder="输入新标签名称回车..."
            editable
            :showToggleAll="false"
          />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">
              所属词典 <span class="text-red-500">*</span>
            </label>
            <Select
              v-model="formData.dictionaryId"
              :options="
                dictionaries.map((dict) => ({
                  value: dict.id,
                  label: dict.name,
                }))
              "
              optionLabel="label"
              optionValue="value"
              placeholder="请选择词典"
              @change="handleDictChange"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">
              所属分类 <span class="text-red-500">*</span>
            </label>
            <Select
              v-model="formData.categoryId"
              :options="
                availableCategories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                }))
              "
              optionLabel="label"
              optionValue="value"
              :placeholder="
                formData.dictionaryId ? '请选择分类' : '请先选择词典'
              "
              :disabled="!formData.dictionaryId"
            />
          </div>
        </div>
      </div>
      <div class="space-y-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">备注</label>
          <Textarea
            v-model.trim="formData.notes"
            placeholder="输入备注信息..."
            rows="3"
          />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">适用平台</label>
            <MultiSelect
              v-model="formData.platforms"
              :options="platformsList"
              optionLabel="name"
              optionValue="id"
              placeholder="请先选择平台..."
              @update:modelValue="handlePlatformChange"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">适用模型</label>
            <MultiSelect
              v-model="formData.models"
              :options="availableModels"
              optionLabel="name"
              optionValue="id"
              :disabled="formData.platforms.length === 0"
              placeholder="请先选择模型..."
            />
          </div>
        </div>

        <ImageUpload v-model="formData.thumbnail" label="缩略图" />
      </div>
    </div>
    <template #footer>
      <Button text severity="secondary" @click="isVisible = false">取消</Button>
      <Button @click="handleSave">{{ confirmButtonText }}</Button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
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

const dictionaries = ref<DictionaryItem[]>([]);
const categories = ref<CategoryItem[]>([]);
const platformsList = ref<PlatformItem[]>([]);
const allModelsList = ref<AIModelItem[]>([]);
const tagsList = ref<TagItem[]>([]);
const formData = ref<PromptItem>(createDefaultPrompt());

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
  const validModelIds = availableModels.value.map((m) => m.id);
  formData.value.models = formData.value.models.filter((id) =>
    validModelIds.includes(id),
  );
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
