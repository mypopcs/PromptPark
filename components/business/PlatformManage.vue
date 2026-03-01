<template>
  <div class="space-y-6 h-full flex flex-col animate-fade-in">
    <div class="flex items-center justify-between shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-base-content">平台与模型管理</h1>
        <p class="text-sm text-base-content/70 mt-1">
          管理 AI 平台及下属的具体模型版本，模型将与平台强绑定
        </p>
      </div>
      <button class="btn btn-primary shadow-sm" @click="openAddModal">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-5 h-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        新增平台
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

    <dialog class="modal" :class="{ 'modal-open': isModalOpen }">
      <div class="modal-box w-11/12 max-w-2xl">
        <h3 class="font-bold text-lg mb-6 border-b border-base-200 pb-2">
          {{ isEdit ? "编辑平台" : "新增平台" }}
        </h3>

        <form @submit.prevent="saveData" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-control w-full">
              <label class="label"
                ><span class="label-text font-medium"
                  >平台名称 <span class="text-error">*</span></span
                ></label
              >
              <input
                v-model.trim="formData.name"
                type="text"
                placeholder="例如: ChatGPT"
                class="input input-bordered w-full"
                required
              />
            </div>
          </div>

          <div
            class="form-control w-full bg-base-200/50 p-4 rounded-box border border-base-200 mt-2"
          >
            <label class="label pt-0"
              ><span class="label-text font-medium text-primary"
                >下属模型管理</span
              ></label
            >
            <p class="text-xs text-base-content/60 mb-2">
              输入模型名称后按回车(Enter)即可快速创建，例如输入 "GPT-4o"
              并回车。
            </p>

            <MultiSelectInput
              v-model="selectedModelIds"
              :options="currentPlatformModels"
              placeholder="输入新模型名称并回车..."
              @create="handleCreateModel"
            />
          </div>

          <div class="modal-action mt-8">
            <button type="button" class="btn btn-ghost" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop" @click.prevent="closeModal">
        <button>关闭</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseTable, { type TableColumn } from "@/components/ui/BaseTable.vue";
import MultiSelectInput from "@/components/ui/MultiSelectInput.vue";
import type { PlatformItem, AIModelItem } from "@/types";
import { localStore } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config";
import { useConfirm } from "@/composables/useConfirm";
import { useMessage } from "@/composables/useMessage";
import { createDefaultPlatform, createDefaultModel } from "@/utils/factories"; // 👈 引入工厂

const { confirm } = useConfirm();
const { success } = useMessage();

const platforms = ref<PlatformItem[]>([]);
const allModels = ref<AIModelItem[]>([]);
const isLoading = ref(false);
const isModalOpen = ref(false);
const isEdit = ref(false);

// 👈 1. 彻底消灭原先冗余的 currentPlatformId 变量
const formData = ref<PlatformItem>(createDefaultPlatform());
const currentPlatformModels = ref<AIModelItem[]>([]);
const selectedModelIds = ref<string[]>([]);

const columns: TableColumn<PlatformItem>[] = [
  { key: "name", label: "平台名称", sortable: true, width: "40%" },
  { key: "modelCount", label: "模型数", sortable: true, width: "25%" },
  { key: "promptCount", label: "提示词数", sortable: true, width: "20%" },
  { key: "actions", label: "操作", width: "15%" },
];

const loadData = async () => {
  isLoading.value = true;
  platforms.value =
    (await localStore.get<PlatformItem[]>(STORAGE_KEYS.PLATFORMS, [])) || [];
  allModels.value =
    (await localStore.get<AIModelItem[]>(STORAGE_KEYS.MODELS, [])) || [];
  platforms.value.forEach((platform) => {
    platform.modelCount = allModels.value.filter(
      (m) => m.platformId === platform.id,
    ).length;
  });
  isLoading.value = false;
};

const openAddModal = () => {
  isEdit.value = false;
  formData.value = createDefaultPlatform(); // 👈 2. 一键重置，自带新 ID
  currentPlatformModels.value = [];
  selectedModelIds.value = [];
  isModalOpen.value = true;
};

const openEditModal = (row: PlatformItem) => {
  isEdit.value = true;
  formData.value = JSON.parse(JSON.stringify(row));
  const platformModels = allModels.value.filter((m) => m.platformId === row.id);
  currentPlatformModels.value = [...platformModels];
  selectedModelIds.value = platformModels.map((m) => m.id);
  isModalOpen.value = true;
};

const closeModal = () => (isModalOpen.value = false);

const handleCreateModel = (name: string) => {
  // 👈 3. 利用工厂直接生成模型，传入绑定的平台 ID 和名称
  const newModel = createDefaultModel(formData.value.id, name);
  currentPlatformModels.value.push(newModel);
  selectedModelIds.value.push(newModel.id);
};

const saveData = async () => {
  formData.value.modelCount = selectedModelIds.value.length; // 更新统计

  const newPlatformList = [...platforms.value];
  if (isEdit.value) {
    const index = newPlatformList.findIndex((p) => p.id === formData.value.id);
    if (index > -1) newPlatformList[index] = formData.value;
  } else {
    newPlatformList.unshift(formData.value);
  }

  const otherModels = allModels.value.filter(
    (m) => m.platformId !== formData.value.id,
  );
  const selectedModelsToSave = currentPlatformModels.value.filter((m) =>
    selectedModelIds.value.includes(m.id),
  );
  const newModelList = [...otherModels, ...selectedModelsToSave];

  await localStore.set(STORAGE_KEYS.PLATFORMS, newPlatformList);
  await localStore.set(STORAGE_KEYS.MODELS, newModelList);

  success(isEdit.value ? "平台及模型修改成功" : "平台及模型创建成功");
  closeModal();
  await loadData();
};

const handleDelete = async (row: PlatformItem) => {
  if (
    await confirm(
      `确定要删除平台 "${row.name}" 吗？其下属的模型也将被一并删除！`,
      "危险操作",
      "danger",
    )
  ) {
    const newPlatformList = platforms.value.filter(
      (item) => item.id !== row.id,
    );
    await localStore.set(STORAGE_KEYS.PLATFORMS, newPlatformList);
    const newModelList = allModels.value.filter((m) => m.platformId !== row.id);
    await localStore.set(STORAGE_KEYS.MODELS, newModelList);
    success("删除成功");
    await loadData();
  }
};

onMounted(() => loadData());
</script>
