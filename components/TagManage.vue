<template>
  <div class="space-y-4">
    <div
      class="flex justify-between items-center bg-base-100 p-4 rounded-box shadow-sm border border-base-200"
    >
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索标签名称..."
        class="input input-bordered w-64"
      />
      <button class="btn btn-primary" @click="openModal()">新建标签</button>
    </div>
    <BaseTable
      :columns="tagColumns"
      :data="paginatedData"
      :total="filteredData.length"
      v-model:currentPage="currentPage"
      :pageSize="pageSize"
    >
      <template #actions="{ row }">
        <div class="flex gap-2">
          <button
            class="btn btn-sm btn-ghost text-info"
            @click="openModal(row)"
          >
            编辑
          </button>
          <button
            class="btn btn-sm btn-ghost text-error"
            @click="handleDelete(row.id)"
          >
            删除
          </button>
        </div>
      </template>
    </BaseTable>

    <dialog ref="modalRef" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">
          {{ isEdit ? "编辑标签" : "新建标签" }}
        </h3>
        <input
          v-model="formData.name"
          type="text"
          class="input input-bordered w-full"
          placeholder="标签名称"
        />
        <div class="modal-action">
          <button class="btn" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="handleSave">保存</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useDangerousConfirm } from "@/composables/useDangerousConfirm";
import { getTags, saveTags } from "@/utils/storage";
import BaseTable from "./BaseTable.vue";
import type { PromptTag } from "@/types";

const { confirmDangerousDelete } = useDangerousConfirm();

const tagColumns = [
  { key: "name", title: "标签名称" },
  { key: "num", title: "关联提示词数量", sortable: true },
];
const tags = ref<PromptTag[]>([]);
const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = 10;
const modalRef = ref<HTMLDialogElement | null>(null);
const isEdit = ref(false);
const formData = ref<Partial<PromptTag>>({});

onMounted(async () => {
  const data = await getTags();
  tags.value = Array.isArray(data) ? data : [];
});

const filteredData = computed(() =>
  tags.value.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  ),
);
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredData.value.slice(start, start + pageSize);
});

const openModal = (row?: PromptTag) => {
  isEdit.value = !!row;
  formData.value = row ? { ...row } : { name: "", num: 0 };
  modalRef.value?.showModal();
};

const closeModal = () => modalRef.value?.close();

const handleSave = async () => {
  if (!formData.value.name) return;
  if (isEdit.value) {
    const idx = tags.value.findIndex((t) => t.id === formData.value.id);
    if (idx !== -1)
      tags.value[idx] = { ...tags.value[idx], ...formData.value } as PromptTag;
  } else {
    tags.value.push({
      id: "tag_" + Date.now(),
      name: formData.value.name!,
      num: 0,
    });
  }
  await saveTags(tags.value);
  closeModal();
};

const handleDelete = async (id: string) => {
  if (!(await confirmDangerousDelete("该标签"))) return;
  tags.value = tags.value.filter((t) => t.id !== id);
  await saveTags(tags.value);
};
</script>
