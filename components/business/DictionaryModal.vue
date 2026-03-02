<template>
  <BaseModal
    v-model="isVisible"
    :title="mode === 'edit' ? '编辑词典与分类' : '新增词典与分类'"
    confirmText="提交"
    @confirm="handleSave"
  >
    <div class="space-y-6">
      <BaseInput
        v-model.trim="formData.name"
        label="词典名称"
        type="text"
        placeholder="例如: 爆款文案词典"
        :required="true"
        :trim="true"
      />
      <MultiSelectInput
        label="关联分类"
        v-model="selectedCategoryIds"
        :options="currentDictCategories"
        placeholder="输入新分类名称..."
        @create="handleCreateCategory"
      />
      <BaseInput
        v-model.trim="formData.description"
        label="词典描述"
        type="textarea"
        placeholder="一句话介绍这个词典..."
        :required="false"
        :trim="true"
      />
      <!-- <BaseInput
        v-model.trim="formData.price"
        label="销售价格 (¥)"
        type="number"
        placeholder="例如: 99.99"
        :required="false"
        :trim="true"
        :min="0"
        :step="0.01"
      /> -->
      <ImageUpload v-model="formData.coverImage" label="词典封面图" />
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
import {
  createDefaultDictionary,
  createDefaultCategory,
} from "@/utils/factories";
import { useMessage } from "@/composables/useMessage";
import type { DictionaryItem, CategoryItem } from "@/types";
import BaseInput from "../ui/BaseInput.vue";

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
const allCategoriesCache = ref<CategoryItem[]>([]); // 暂存全局分类以便保存时合并

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

const handleCreateCategory = (name: string) => {
  const newCat = createDefaultCategory(formData.value.id, name);
  currentDictCategories.value.push(newCat);
  selectedCategoryIds.value.push(newCat.id);
};

const handleSave = async () => {
  if (!formData.value.name) {
    warning("请填写词典名称");
    return;
  }

  formData.value.categoryCount = selectedCategoryIds.value.length;
  formData.value.updatedAt = Date.now();
  if (props.mode === "create") formData.value.createdAt = Date.now();

  // 把选中的分类挑出来
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
