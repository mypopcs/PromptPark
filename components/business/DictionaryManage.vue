<template>
  <div class="space-y-6 h-full flex flex-col animate-fade-in">
    <div class="flex items-center justify-between shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-base-content">词典与分类管理</h1>
        <p class="text-sm text-base-content/70 mt-1">
          管理您的词典及下属分类，分类将与词典强绑定
        </p>
      </div>
      <Button @click="openAddModal">
        <i class="ri-add-line text-lg"></i>
        新增词典和分类
      </Button>
    </div>

    <div class="flex-1 overflow-hidden">
      <DataTable
        :value="dictionaries"
        :loading="isLoading"
        tableStyle="min-width: 60rem"
        class="w-full"
      >
        <Column header="词典封面" style="width: 8%">
          <template #body="{ data }">
            <div class="avatar">
              <div class="w-10 rounded">
                <img
                  :src="
                    data.coverImage || 'https://placehold.co/100x100?text=Dict'
                  "
                  alt="Cover"
                />
              </div>
            </div>
          </template>
        </Column>
        <Column
          field="name"
          header="词典名"
          sortable
          style="width: 20%"
        ></Column>
        <Column
          field="description"
          header="词典描述"
          style="width: 20%"
        ></Column>
        <Column
          field="categoryCount"
          header="关联分类数"
          sortable
          style="width: 10%"
        ></Column>
        <Column
          field="promptCount"
          header="关联提示词数"
          sortable
          style="width: 10%"
        ></Column>
        <Column header="操作" style="width: 12%">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button
                text
                severity="secondary"
                size="small"
                @click="openEditModal(data)"
              >
                编辑
              </Button>
              <Button
                text
                severity="danger"
                size="small"
                @click="handleDelete(data)"
              >
                删除
              </Button>
            </div>
          </template>
        </Column>
      </DataTable>
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
import { useConfirm } from "primevue/useconfirm";
import { useMessage } from "@/composables/useMessage";
import DictionaryModal from "@/components/business/DictionaryModal.vue";
import type { DictionaryItem, CategoryItem } from "@/types";
import { localStore } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config";

const confirm = useConfirm();
const { success } = useMessage();

const dictionaries = ref<DictionaryItem[]>([]);
const isLoading = ref(false);

const isModalOpen = ref(false);
const modalMode = ref<"create" | "edit">("create");
const currentData = ref<DictionaryItem | undefined>(undefined);

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

const handleDelete = (row: DictionaryItem) => {
  confirm.require({
    message: `确定要删除词典 "${row.name}" 吗？其下属分类将被一并删除！`,
    header: "危险",
    icon: "ri-error-warning-line",
    acceptLabel: "确定",
    rejectLabel: "取消",
    acceptClass: "p-button-danger",
    accept: async () => {
      const newDictList = dictionaries.value.filter(
        (item) => item.id !== row.id,
      );
      await localStore.set(STORAGE_KEYS.DICTIONARIES, newDictList);
      const c =
        (await localStore.get<CategoryItem[]>(STORAGE_KEYS.CATEGORIES, [])) ||
        [];
      await localStore.set(
        STORAGE_KEYS.CATEGORIES,
        c.filter((cat) => cat.dictionaryId !== row.id),
      );
      success("删除成功");
      await loadData();
    },
  });
};

onMounted(() => loadData());
</script>
