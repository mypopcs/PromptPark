<template>
  <div class="space-y-6 h-full flex flex-col animate-fade-in">
    <div class="flex items-center justify-between shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-base-content">标签管理</h1>
        <p class="text-sm text-base-content/70 mt-1">
          管理您的提示词分类标签，支持自定义颜色
        </p>
      </div>
      <button class="btn btn-primary shadow-sm" @click="openModal()">
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
          <span class="badge" :class="row.color || 'badge-neutral'">{{
            row.name
          }}</span>
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

    <dialog class="modal" :class="{ 'modal-open': isModalOpen }">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">新增标签</h3>
        <form @submit.prevent="saveData" class="space-y-4">
          <div class="form-control">
            <label class="label"
              ><span class="label-text">标签名称 *</span></label
            >
            <input
              v-model.trim="formData.name"
              type="text"
              class="input input-bordered"
              required
            />
          </div>
          <div class="form-control">
            <label class="label"
              ><span class="label-text">标签颜色</span></label
            >
            <select v-model="formData.color" class="select select-bordered">
              <option value="badge-primary">主色调 (Primary)</option>
              <option value="badge-secondary">次色调 (Secondary)</option>
              <option value="badge-accent">强调色 (Accent)</option>
              <option value="badge-info">信息蓝 (Info)</option>
              <option value="badge-success">成功绿 (Success)</option>
              <option value="badge-warning">警告黄 (Warning)</option>
              <option value="badge-error">危险红 (Error)</option>
              <option value="badge-neutral">中性灰 (Neutral)</option>
            </select>
          </div>
          <div class="modal-action">
            <button
              type="button"
              class="btn btn-ghost"
              @click="isModalOpen = false"
            >
              取消
            </button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
      <form
        method="dialog"
        class="modal-backdrop"
        @click.prevent="isModalOpen = false"
      >
        <button>关闭</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseTable, { type TableColumn } from "@/components/ui/BaseTable.vue";
import type { TagItem } from "@/types";
import { localStore } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config";
import { useConfirm } from "@/composables/useConfirm";
import { useMessage } from "@/composables/useMessage";
import { createDefaultTag } from "@/utils/factories"; // 👈 引入工厂

const { confirm } = useConfirm();
const { success } = useMessage();

const tableData = ref<TagItem[]>([]);
const isLoading = ref(false);
const isModalOpen = ref(false);

// 👈 1. 极其干净的初始化
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
  formData.value = createDefaultTag(); // 👈 2. 极其干净的重置
  isModalOpen.value = true;
};

const saveData = async () => {
  // 👈 3. 不需要再手动塞 ID 了，工厂已经生成好了
  const newList = [formData.value, ...tableData.value];
  await localStore.set(STORAGE_KEYS.TAGS, newList);
  success("保存成功");
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
