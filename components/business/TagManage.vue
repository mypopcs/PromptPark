<template>
  <div class="space-y-6 h-full flex flex-col animate-fade-in">
    <div class="flex items-center justify-between shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-base-content">标签管理</h1>
        <p class="text-sm text-base-content/70 mt-1">
          管理系统中的所有标签，标签颜色将由系统自动生成绝美莫兰迪色
        </p>
      </div>
      <button class="btn btn-primary shadow-sm" @click="openModal">
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
        新建标签
      </button>
    </div>

    <div class="flex-1 overflow-hidden">
      <BaseTable
        :columns="columns"
        :data="tableData"
        :loading="isLoading"
        :total="tableData.length"
      >
        <template #cell-color="{ row }">
          <span
            class="badge border-none text-white font-medium shadow-sm"
            :style="{ backgroundColor: row.color }"
          >
            {{ row.name }}
          </span>
        </template>
        <template #cell-actions="{ row }">
          <button
            class="btn btn-xs btn-ghost text-error"
            @click="handleDelete(row)"
          >
            删除
          </button>
        </template>
      </BaseTable>
    </div>

    <BaseModal
      v-model="isModalOpen"
      title="新建标签"
      confirmText="保存标签"
      @confirm="saveData"
    >
      <div class="form-control w-full">
        <label class="label"
          ><span class="label-text font-medium"
            >标签名称 <span class="text-error">*</span></span
          ></label
        >
        <input
          v-model.trim="formData.name"
          type="text"
          placeholder="例如: Midjourney 咒语"
          class="input input-bordered w-full"
          @keydown.enter="saveData"
        />
        <p class="text-xs text-base-content/50 mt-2">
          提示：系统将为您自动分配一个不重复的高级柔和色彩。
        </p>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseTable, { type TableColumn } from "@/components/ui/BaseTable.vue";
import BaseModal from "@/components/ui/BaseModal.vue"; // 引入通用弹窗
import type { TagItem } from "@/types";
import { localStore } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config";
import { useConfirm } from "@/composables/useConfirm";
import { useMessage } from "@/composables/useMessage";
import { createDefaultTag } from "@/utils/factories";

const { confirm } = useConfirm();
const { success, warning } = useMessage();

const tableData = ref<TagItem[]>([]);
const isLoading = ref(false);
const isModalOpen = ref(false);

const formData = ref<TagItem>(createDefaultTag());

const columns: TableColumn<TagItem>[] = [
  { key: "name", label: "标签名称", width: "40%" },
  { key: "color", label: "效果预览", width: "30%" },
  { key: "actions", label: "操作", width: "30%" },
];

const loadData = async () => {
  isLoading.value = true;
  tableData.value =
    (await localStore.get<TagItem[]>(STORAGE_KEYS.TAGS, [])) || [];
  isLoading.value = false;
};

const openModal = () => {
  formData.value = createDefaultTag(); // ID 和 颜色 都在这里全自动生成好了！
  isModalOpen.value = true;
};

const saveData = async () => {
  if (!formData.value.name) {
    warning("请填写标签名称");
    return;
  }
  const newList = [formData.value, ...tableData.value];
  await localStore.set(STORAGE_KEYS.TAGS, newList);
  success("标签保存成功");
  isModalOpen.value = false;
  await loadData();
};

const handleDelete = async (row: TagItem) => {
  if (await confirm(`确定删除标签 "${row.name}" 吗？`, "警告", "danger")) {
    const newList = tableData.value.filter((item) => item.id !== row.id);
    await localStore.set(STORAGE_KEYS.TAGS, newList);
    success("删除成功");
    await loadData();
  }
};

onMounted(() => loadData());
</script>
