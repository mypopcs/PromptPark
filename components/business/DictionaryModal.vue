<template>
  <BaseModal
    v-model="isVisible"
    :title="mode === 'edit' ? '编辑词典与分类' : '新增词典与分类'"
    confirmText="保存词典"
    @confirm="handleSave"
  >
    <div class="space-y-6">
      <div class="grid grid-cols-2 gap-4">
        <div class="form-control w-full">
          <label class="label"
            ><span class="label-text font-medium"
              >词典名称 <span class="text-error">*</span></span
            ></label
          >
          <input
            v-model.trim="formData.name"
            type="text"
            placeholder="例如: 爆款文案词典"
            class="input input-bordered w-full"
            required
          />
        </div>
        <div class="form-control w-full">
          <label class="label"
            ><span class="label-text font-medium">销售价格 (¥)</span></label
          >
          <input
            v-model.number="formData.price"
            type="number"
            step="0.01"
            min="0"
            class="input input-bordered w-full"
          />
        </div>
      </div>

      <div class="form-control w-full">
        <label class="label"
          ><span class="label-text font-medium">词典描述</span></label
        >
        <textarea
          v-model.trim="formData.description"
          class="textarea textarea-bordered h-20"
          placeholder="一句话介绍这个词典..."
        ></textarea>
      </div>

      <div
        class="form-control w-full bg-base-200/50 p-4 rounded-xl border border-base-200"
      >
        <label class="label pt-0"
          ><span class="label-text font-medium text-primary"
            >下属分类管理</span
          ></label
        >
        <MultiSelectInput
          v-model="selectedCategoryIds"
          :options="currentDictCategories"
          placeholder="输入新分类名称并回车..."
          @create="handleCreateCategory"
        />
      </div>

      <div class="grid grid-cols-2 gap-6 mt-2">
        <div class="form-control w-full">
          <label class="label pt-0"
            ><span class="label-text font-medium"
              >词典封面图 (可选)</span
            ></label
          >
          <ImageUpload v-model="formData.coverImage" />
        </div>
        <div class="form-control w-full flex flex-col justify-center">
          <label
            class="cursor-pointer label flex gap-4 justify-start p-4 bg-base-200/30 rounded-xl border border-base-200"
          >
            <input
              v-model="formData.isOfficialRecommended"
              type="checkbox"
              class="toggle toggle-success"
            />
            <div>
              <span class="label-text font-medium block text-base"
                >设为官方推荐</span
              >
              <span class="label-text-alt text-base-content/50"
                >在前端页面展示专属高亮标识</span
              >
            </div>
          </label>
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
