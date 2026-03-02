<template>
  <div class="space-y-6 h-full flex flex-col animate-fade-in">
    <div class="flex items-center justify-between shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-base-content">提示词管理</h1>
        <p class="text-sm text-base-content/70 mt-1">
          在这里统一管理您的核心 Prompt，精准绑定词典与平台
        </p>
      </div>
      <button class="btn btn-primary shadow-sm" @click="openAddModal">
        新建提示词
      </button>
    </div>

    <div class="flex-1 overflow-hidden">
      <BaseTable
        :columns="columns"
        :data="prompts"
        :loading="isLoading"
        :total="prompts.length"
      >
        <template #cell-thumbnail="{ row }">
          <div class="avatar" v-if="row.thumbnail">
            <div class="w-10 h-10 rounded shadow-sm border border-base-200">
              <img :src="row.thumbnail" alt="Thumb" class="object-cover" />
            </div>
          </div>
          <span v-else class="text-xs text-base-content/20">-</span>
        </template>

        <template #cell-prompt="{ row }">
          <div class="max-w-[240px] truncate font-bold text-base-content">
            {{ row.prompt }}
          </div>
          <div
            class="max-w-[240px] truncate text-xs text-base-content/50 mt-1 italic"
          >
            {{ row.translation }}
          </div>
        </template>

        <template #cell-dictionaryId="{ row }">
          <div class="text-xs font-bold text-primary">
            {{ getDictName(row.dictionaryId) }}
          </div>
          <div
            class="text-[10px] text-base-content/40 mt-0.5 uppercase tracking-tighter"
          >
            {{ getCategoryName(row.categoryId) }}
          </div>
        </template>

        <template #cell-tags="{ row }">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="tagId in row.tags"
              :key="tagId"
              class="badge badge-sm border-none text-white font-medium"
              :style="{ backgroundColor: getTagColor(tagId) }"
            >
              {{ getTagName(tagId) }}
            </span>
            <span
              v-if="!row.tags || row.tags.length === 0"
              class="text-[10px] opacity-20"
              >无标签</span
            >
          </div>
        </template>

        <template #cell-platforms="{ row }">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="pid in row.platforms"
              :key="pid"
              class="text-[10px] bg-base-200 px-1.5 py-0.5 rounded text-base-content/70"
            >
              {{ getPlatformName(pid) }}
            </span>
            <span
              v-if="!row.platforms || row.platforms.length === 0"
              class="text-[10px] opacity-20"
              >-</span
            >
          </div>
        </template>

        <template #cell-models="{ row }">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="mid in row.models"
              :key="mid"
              class="text-[10px] bg-base-200 px-1.5 py-0.5 rounded text-base-content/70"
            >
              {{ getModelName(mid) }}
            </span>
            <span
              v-if="!row.models || row.models.length === 0"
              class="text-[10px] opacity-20"
              >-</span
            >
          </div>
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

    <SharedPromptModal
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
import SharedPromptModal from "@/components/business/SharedPromptModal.vue";
import { localStore } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config";
import { useConfirm } from "@/composables/useConfirm";
import { useMessage } from "@/composables/useMessage";
import type {
  PromptItem,
  DictionaryItem,
  CategoryItem,
  PlatformItem,
  TagItem,
  AIModelItem,
} from "@/types";

const { confirm } = useConfirm();
const { success, error, warning } = useMessage();

const prompts = ref<PromptItem[]>([]);
const dictionaries = ref<DictionaryItem[]>([]);
const categories = ref<CategoryItem[]>([]);
const platformsList = ref<PlatformItem[]>([]);
const modelsList = ref<AIModelItem[]>([]);
const tagsList = ref<TagItem[]>([]);
const isLoading = ref(false);

const isModalOpen = ref(false);
const modalMode = ref<"create" | "edit">("create");
const currentData = ref<PromptItem | undefined>(undefined);

const columns: TableColumn<PromptItem>[] = [
  { key: "thumbnail", label: "封面", width: "5%" },
  { key: "prompt", label: "提示词", width: "18%" },
  { key: "translation", label: "中文翻译", width: "15%" },
  { key: "tags", label: "标签", width: "15%" },
  { key: "dictionaryId", label: "所属词典/分类", width: "12%" },
  { key: "platforms", label: "适用平台", width: "10%" },
  { key: "models", label: "适用模型", width: "10%" },
  { key: "actions", label: "操作", width: "8%" },
];

const loadAllData = async () => {
  isLoading.value = true;
  try {
    const [p, d, c, pt, m, t] = await Promise.all([
      localStore.get(STORAGE_KEYS.PROMPTS, []),
      localStore.get(STORAGE_KEYS.DICTIONARIES, []),
      localStore.get(STORAGE_KEYS.CATEGORIES, []),
      localStore.get(STORAGE_KEYS.PLATFORMS, []),
      localStore.get(STORAGE_KEYS.MODELS, []),
      localStore.get(STORAGE_KEYS.TAGS, []),
    ]);
    prompts.value = Array.isArray(p) ? p : Object.values(p || {});
    dictionaries.value = Array.isArray(d) ? d : Object.values(d || {});
    categories.value = Array.isArray(c) ? c : Object.values(c || {});
    platformsList.value = Array.isArray(pt) ? pt : Object.values(pt || {});
    modelsList.value = Array.isArray(m) ? m : Object.values(m || {});
    tagsList.value = Array.isArray(t) ? t : Object.values(t || {});
  } finally {
    isLoading.value = false;
  }
};

// 🌟 映射增强：增加 toString() 确保匹配
const getDictName = (id: string) =>
  dictionaries.value.find((d) => d.id.toString() === id?.toString())?.name ||
  "-";
const getCategoryName = (id: string) =>
  categories.value.find((c) => c.id.toString() === id?.toString())?.name || "-";
const getTagName = (id: string) =>
  tagsList.value.find((t) => t.id.toString() === id?.toString())?.name ||
  "未知";
const getTagColor = (id: string) =>
  tagsList.value.find((t) => t.id.toString() === id?.toString())?.color ||
  "#cbd5e1";
const getPlatformName = (id: string) =>
  platformsList.value.find((p) => p.id.toString() === id?.toString())?.name ||
  "-";
const getModelName = (id: string) =>
  modelsList.value.find((m) => m.id.toString() === id?.toString())?.name || "-";

const openAddModal = () => {
  if (dictionaries.value.length === 0) {
    warning("请先创建词典！");
    return;
  }
  modalMode.value = "create";
  currentData.value = undefined;
  isModalOpen.value = true;
};

const openEditModal = (row: PromptItem) => {
  modalMode.value = "edit";
  currentData.value = JSON.parse(JSON.stringify(row));
  isModalOpen.value = true;
};

const onSaveData = async (promptData: PromptItem) => {
  const newList = [...prompts.value];
  if (modalMode.value === "edit") {
    const idx = newList.findIndex((p) => p.id === promptData.id);
    if (idx > -1) newList[idx] = promptData;
  } else {
    newList.unshift(promptData);
  }
  await localStore.set(STORAGE_KEYS.PROMPTS, newList);
  success("保存成功");
  await loadAllData();
};

const handleDelete = async (row: PromptItem) => {
  if (await confirm(`确定删除提示词吗？`, "警告", "danger")) {
    const newList = prompts.value.filter((item) => item.id !== row.id);
    await localStore.set(STORAGE_KEYS.PROMPTS, newList);
    success("删除成功");
    await loadAllData();
  }
};

onMounted(() => loadAllData());
</script>
