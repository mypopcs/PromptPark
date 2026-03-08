<template>
  <div class="space-y-6 h-full flex flex-col animate-fade-in">
    <div class="flex items-center justify-between shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-base-content">AI平台与模型管理</h1>
        <p class="text-sm text-base-content/70 mt-1">
          管理提示词适用的 AI 平台及附属模型版本
        </p>
      </div>
      <Button @click="openAddModal">
        <i class="ri-add-line text-lg"></i>
        新增AI平台与模型
      </Button>
    </div>

    <div class="flex-1 overflow-hidden">
      <DataTable
        :value="platforms"
        :loading="isLoading"
        tableStyle="min-width: 50rem"
        class="w-full"
      >
        <Column
          field="name"
          header="AI平台"
          sortable
          style="width: 40%"
        ></Column>
        <Column
          field="modelCount"
          header="模型数"
          sortable
          style="width: 25%"
        ></Column>
        <Column
          field="promptCount"
          header="提示词数"
          sortable
          style="width: 20%"
        ></Column>
        <Column header="操作" style="width: 15%">
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
import { useConfirm } from "primevue/useconfirm";
import { useMessage } from "@/composables/useMessage";
import PlatformModal from "@/components/business/PlatformModal.vue";
import type { PlatformItem, AIModelItem } from "@/types";
import { localStore } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config";

const confirm = useConfirm();
const { success } = useMessage();

const platforms = ref<PlatformItem[]>([]);
const isLoading = ref(false);

const isModalOpen = ref(false);
const modalMode = ref<"create" | "edit">("create");
const currentData = ref<PlatformItem | undefined>(undefined);

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

const handleDelete = (row: PlatformItem) => {
  confirm.require({
    message: `确定要删除平台 "${row.name}" 吗？其下属的模型也将被一并删除！`,
    header: "危险",
    icon: "ri-error-warning-line",
    acceptLabel: "确定",
    rejectLabel: "取消",
    acceptClass: "p-button-danger",
    accept: async () => {
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
    },
  });
};

onMounted(() => loadData());
</script>
