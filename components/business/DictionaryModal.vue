<template>
  <Dialog
    v-model:visible="isVisible"
    :header="mode === 'edit' ? '编辑词典与分类' : '新增词典与分类'"
    :style="{ width: '500px' }"
    :modal="true"
  >
    <div class="space-y-6">
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">
          词典名称 <span class="text-red-500">*</span>
        </label>
        <InputText
          v-model.trim="formData.name"
          placeholder="例如: 爆款文案词典"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">关联分类</label>
        <MultiSelect
          v-model="selectedCategoryIds"
          :options="currentDictCategories"
          optionLabel="name"
          optionValue="id"
          placeholder="输入新分类名称..."
          editable
          :showToggleAll="false"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">词典描述</label>
        <Textarea
          v-model.trim="formData.description"
          placeholder="一句话介绍这个词典..."
          rows="2"
        />
      </div>
      <ImageUpload v-model="formData.coverImage" label="词典封面图" />
    </div>
    <template #footer>
      <Button text severity="secondary" @click="isVisible = false">取消</Button>
      <Button @click="handleSave">提交</Button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import ImageUpload from "@/components/ui/ImageUpload.vue";
import { localStore } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config";
import {
  createDefaultDictionary,
  createDefaultCategory,
} from "@/utils/factories";
import { useMessage } from "@/composables/useMessage";
import type { DictionaryItem, CategoryItem } from "@/types";

const props = defineProps<{
  modelValue: boolean;
  mode: "create" | "edit";
  initialData?: DictionaryItem;
}>();

const emit = defineEmits(["update:modelValue", "save"]);
const { warning } = useMessage();

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const formData = ref<DictionaryItem>(createDefaultDictionary());
const currentDictCategories = ref<CategoryItem[]>([]);
const selectedCategoryIds = ref<string[]>([]);
const allCategoriesCache = ref<CategoryItem[]>([]);

watch(
  () => props.modelValue,
  async (newVal) => {
    if (newVal) {
      const allCats =
        (await localStore.get<CategoryItem[]>(STORAGE_KEYS.CATEGORIES, [])) ||
        [];
      allCategoriesCache.value = allCats;

      if (props.mode === "edit" && props.initialData) {
        formData.value = JSON.parse(JSON.stringify(props.initialData));
        const dictCats = allCats.filter(
          (c) => c.dictionaryId === formData.value.id,
        );
        currentDictCategories.value = [...dictCats];
        selectedCategoryIds.value = dictCats.map((c) => c.id);
      } else {
        formData.value = createDefaultDictionary();
        currentDictCategories.value = [];
        selectedCategoryIds.value = [];
      }
    }
  },
);

const handleSave = async () => {
  if (!formData.value.name) {
    warning("请填写词典名称");
    return;
  }

  formData.value.categoryCount = selectedCategoryIds.value.length;
  formData.value.updatedAt = Date.now();
  if (props.mode === "create") formData.value.createdAt = Date.now();

  const otherCats = allCategoriesCache.value.filter(
    (c) => c.dictionaryId !== formData.value.id,
  );
  const selectedCatsToSave = currentDictCategories.value.filter((c) =>
    selectedCategoryIds.value.includes(c.id),
  );
  const finalCategories = [...otherCats, ...selectedCatsToSave];

  emit("save", {
    dictData: formData.value,
    categoriesData: finalCategories,
  });
  isVisible.value = false;
};
</script>
