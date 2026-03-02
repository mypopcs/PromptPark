<template>
  <div class="space-y-6 h-full flex flex-col animate-fade-in">
    <div class="flex items-center justify-between shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-base-content">AI平台与模型管理</h1>
        <p class="text-sm text-base-content/70 mt-1">
          管理提示词适用的 AI 平台及附属模型版本
        </p>
      </div>
      <button class="btn btn-primary shadow-sm" @click="openAddModal">
        新增AI平台与模型
      </button>
    </div>

    <div class="flex-1 overflow-hidden">
      <BaseTable
        :columns="columns"
        :data="platforms"
        :loading="isLoading"
        :total="platforms.length"
      >
        <template #cell-actions="{ row }">
          <div class="flex gap-2">
            <button
              class="btn btn-xs btn-ghost text-primary"
              @click="openEditModal(row)"
            >
              编辑
            </button>
            <button
              class="btn btn-xs btn-ghost text-error"
              @click="handleDelete(row)"
            >
              删除
            </button>
          </div>
        </template>
      </BaseTable>
    </div>

    <PlatformModal
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
import PlatformModal from "@/components/business/PlatformModal.vue";
import type { PlatformItem, AIModelItem } from "@/types";
import { localStore } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config";
import { useConfirm } from "@/composables/useConfirm";
import { useMessage } from "@/composables/useMessage";

const { confirm } = useConfirm();
const { success } = useMessage();

const platforms = ref<PlatformItem[]>([]);
const isLoading = ref(false);

const isModalOpen = ref(false);
const modalMode = ref<"create" | "edit">("create");
const currentData = ref<PlatformItem | undefined>(undefined);

const columns: TableColumn<PlatformItem>[] = [
  { key: "name", label: "AI平台", sortable: true, width: "40%" },
  { key: "modelCount", label: "模型数", sortable: true, width: "25%" },
  { key: "promptCount", label: "提示词数", sortable: true, width: "20%" },
  { key: "actions", label: "操作", width: "15%" },
];

const loadData = async () => {
  isLoading.value = true;
  const p =
    (await localStore.get<PlatformItem[]>(STORAGE_KEYS.PLATFORMS, [])) || [];
  const m =
    (await localStore.get<AIModelItem[]>(STORAGE_KEYS.MODELS, [])) || [];
  p.forEach(
    (platform) =>
      (platform.modelCount = m.filter(
        (model) => model.platformId === platform.id,
      ).length),
  );
  platforms.value = p;
  isLoading.value = false;
};

const openAddModal = () => {
  modalMode.value = "create";
  currentData.value = undefined;
  isModalOpen.value = true;
};

const openEditModal = (row: PlatformItem) => {
  modalMode.value = "edit";
  currentData.value = row;
  isModalOpen.value = true;
};

const onSaveData = async ({
  platformData,
  modelsData,
}: {
  platformData: PlatformItem;
  modelsData: AIModelItem[];
}) => {
  const newList = [...platforms.value];
  if (modalMode.value === "edit") {
    const idx = newList.findIndex((p) => p.id === platformData.id);
    if (idx > -1) newList[idx] = platformData;
  } else {
    newList.unshift(platformData);
  }

  await localStore.set(STORAGE_KEYS.PLATFORMS, newList);
  await localStore.set(STORAGE_KEYS.MODELS, modelsData);

  success(modalMode.value === "edit" ? "修改成功" : "新增成功");
  await loadData();
};

const handleDelete = async (row: PlatformItem) => {
  if (
    await confirm(
      `确定要删除平台 "${row.name}" 吗？其下属的模型也将被一并删除！`,
      "危险",
      "danger",
    )
  ) {
    const newList = platforms.value.filter((item) => item.id !== row.id);
    await localStore.set(STORAGE_KEYS.PLATFORMS, newList);
    const m =
      (await localStore.get<AIModelItem[]>(STORAGE_KEYS.MODELS, [])) || [];
    await localStore.set(
      STORAGE_KEYS.MODELS,
      m.filter((model) => model.platformId !== row.id),
    );
    success("删除成功");
    await loadData();
  }
};

onMounted(() => loadData());
</script>
