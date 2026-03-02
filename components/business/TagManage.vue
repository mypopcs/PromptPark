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
        <template #cell-name="{ row }">
          <span
            class="badge border-none text-white font-medium shadow-sm"
            :style="{ backgroundColor: row.color }"
          >
            {{ row.name }}
          </span>
        </template>
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
    <BaseModal
      v-model="isModalOpen"
      :title="modalMode === 'create' ? '新建标签' : '编辑标签'"
      confirmText="提交"
      @confirm="saveData"
    >
      <BaseInput
        v-model.trim="formData.name"
        label="标签名称"
        type="text"
        placeholder="请输入标签名称"
        :required="true"
        :trim="true"
        @keydown.enter="saveData"
        helpText="标签可用于为提示词的自定义分组，例如：AI漫剧常用，公司项目等"
      />
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseTable, { type TableColumn } from "@/components/ui/BaseTable.vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import type { TagItem, PromptItem } from "@/types";
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
const modalMode = ref<"create" | "edit">("create");
const editingId = ref<string>("");

const formData = ref<TagItem>(createDefaultTag());

const columns: TableColumn<TagItem>[] = [
  { key: "name", label: "标签名称", width: "40%" },
  { key: "promptCount", label: "关联提示词数量", width: "30%" },
  { key: "actions", label: "操作", width: "30%" },
];

const ensureArray = <T,>(
  data: T[] | Record<string, T> | null | undefined,
): T[] => {
  if (!data) return [];
  return Array.isArray(data) ? data : Object.values(data);
};

const loadData = async () => {
  isLoading.value = true;

  const rawTags = await localStore.get<TagItem[]>(STORAGE_KEYS.TAGS, []);
  const rawPrompts = await localStore.get<PromptItem[]>(
    STORAGE_KEYS.PROMPTS,
    [],
  );

  const allTags = ensureArray(rawTags);
  const allPrompts = ensureArray(rawPrompts);

  tableData.value = allTags.map((tag) => {
    const count = allPrompts.filter((p) => {
      const promptTags = ensureArray(p.tags);
      return promptTags.includes(tag.id);
    }).length;
    return {
      ...tag,
      promptCount: count,
    };
  });

  isLoading.value = false;
};

const openModal = () => {
  modalMode.value = "create";
  editingId.value = "";
  formData.value = createDefaultTag();
  isModalOpen.value = true;
};

const openEditModal = (row: TagItem) => {
  modalMode.value = "edit";
  editingId.value = row.id;
  formData.value = { ...row };
  isModalOpen.value = true;
};

const saveData = async () => {
  if (!formData.value.name) {
    warning("请填写标签名称");
    return;
  }

  let newList: TagItem[];
  if (modalMode.value === "edit" && editingId.value) {
    newList = tableData.value.map((item) =>
      item.id === editingId.value ? { ...formData.value } : item,
    );
  } else {
    newList = [formData.value, ...tableData.value];
  }

  await localStore.set(STORAGE_KEYS.TAGS, newList);
  success(modalMode.value === "edit" ? "标签更新成功" : "标签保存成功");
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
