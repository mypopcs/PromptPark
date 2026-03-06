<template>
  <div class="space-y-6 h-full flex flex-col animate-fade-in">
    <div class="flex items-center justify-between shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-base-content">词典与分类管理</h1>
        <p class="text-sm text-base-content/70 mt-1">
          管理您的词典及下属分类，分类将与词典强绑定
        </p>
      </div>
      <BaseButton variant="primary" size="md" @click="openAddModal">
        <i class="ri-add-line text-lg"></i>
        新增词典和分类
      </BaseButton>
    </div>

    <div class="flex-1 overflow-hidden">
      <BaseTable
        :columns="columns"
        :data="dictionaries"
        :loading="isLoading"
        :total="dictionaries.length"
        showActions
        @edit="openEditModal"
        @delete="handleDelete"
      >
        <template #cell-coverImage="{ row }">
          <div class="avatar">
            <div class="w-10 rounded">
              <img
                :src="
                  row.coverImage || 'https://placehold.co/100x100?text=Dict'
                "
                alt="Cover"
              />
            </div>
          </div>
        </template>
        <template #cell-isOfficialRecommended="{ row }">
          <span
            v-if="row.isOfficialRecommended"
            class="badge badge-success badge-sm text-white"
            >官方推荐</span
          >
          <span v-else class="text-base-content/40 text-sm">-</span>
        </template>
        <template #cell-price="{ row }">
          <span class="font-mono text-warning font-medium"
            >¥ {{ row.price?.toFixed(2) || "0.00" }}</span
          >
        </template>
      </BaseTable>
    </div>

    <DictionaryModal
      v-model="isModalOpen"
      :mode="modalMode"
      :initialData="currentData"
      @save="onSaveData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseTable, { type TableColumn } from "@/components/ui/BaseTable.vue";
import DictionaryModal from "@/components/business/DictionaryModal.vue";
import type { DictionaryItem, CategoryItem } from "@/types";
import { localStore } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config";
import { useConfirm } from "@/composables/useConfirm";
import { useMessage } from "@/composables/useMessage";
import BaseButton from "@/components/ui/BaseButton.vue";

const { confirm } = useConfirm();
const { success } = useMessage();

const dictionaries = ref<DictionaryItem[]>([]);
const isLoading = ref(false);

const isModalOpen = ref(false);
const modalMode = ref<"create" | "edit">("create");
const currentData = ref<DictionaryItem | undefined>(undefined);

const columns: TableColumn<DictionaryItem>[] = [
  { key: "coverImage", label: "词典封面", width: "8%" },
  { key: "name", label: "词典名", sortable: true, width: "20%" },
  { key: "description", label: "词典描述", width: "20%" },
  { key: "categoryCount", label: "关联分类数", sortable: true, width: "10%" },
  { key: "promptCount", label: "关联提示词数", sortable: true, width: "10%" },
  // { key: "price", label: "价格", sortable: true, width: "10%" },
  // { key: "isOfficialRecommended", label: "推荐", width: "10%" },
  { key: "actions", label: "操作", width: "12%" },
];

const loadData = async () => {
  isLoading.value = true;
  const d =
    (await localStore.get<DictionaryItem[]>(STORAGE_KEYS.DICTIONARIES, [])) ||
    [];
  const c =
    (await localStore.get<CategoryItem[]>(STORAGE_KEYS.CATEGORIES, [])) || [];
  d.forEach(
    (dict) =>
      (dict.categoryCount = c.filter(
        (cat) => cat.dictionaryId === dict.id,
      ).length),
  );
  dictionaries.value = d;
  isLoading.value = false;
};

const openAddModal = () => {
  modalMode.value = "create";
  currentData.value = undefined;
  isModalOpen.value = true;
};

const openEditModal = (row: DictionaryItem) => {
  modalMode.value = "edit";
  currentData.value = row;
  isModalOpen.value = true;
};

const onSaveData = async ({
  dictData,
  categoriesData,
}: {
  dictData: DictionaryItem;
  categoriesData: CategoryItem[];
}) => {
  const newDictList = [...dictionaries.value];
  if (modalMode.value === "edit") {
    const idx = newDictList.findIndex((d) => d.id === dictData.id);
    if (idx > -1) newDictList[idx] = dictData;
  } else {
    newDictList.unshift(dictData);
  }

  await localStore.set(STORAGE_KEYS.DICTIONARIES, newDictList);
  await localStore.set(STORAGE_KEYS.CATEGORIES, categoriesData);

  success(modalMode.value === "edit" ? "修改成功" : "新增成功");
  await loadData();
};

const handleDelete = async (row: DictionaryItem) => {
  if (
    await confirm(
      `确定要删除词典 "${row.name}" 吗？其下属分类将被一并删除！`,
      "危险",
      "danger",
    )
  ) {
    const newDictList = dictionaries.value.filter((item) => item.id !== row.id);
    await localStore.set(STORAGE_KEYS.DICTIONARIES, newDictList);
    const c =
      (await localStore.get<CategoryItem[]>(STORAGE_KEYS.CATEGORIES, [])) || [];
    await localStore.set(
      STORAGE_KEYS.CATEGORIES,
      c.filter((cat) => cat.dictionaryId !== row.id),
    );
    success("删除成功");
    await loadData();
  }
};

onMounted(() => loadData());
</script>
