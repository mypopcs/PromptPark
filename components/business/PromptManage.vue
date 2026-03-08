<template>
  <div class="space-y-6 h-full flex flex-col animate-fade-in">
    <div class="flex items-center justify-between shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-base-content">提示词管理</h1>
        <p class="text-sm text-base-content/70 mt-1">
          在这里统一管理您的核心 Prompt，精准绑定词典与平台
        </p>
      </div>
      <Button @click="openAddModal">
        <i class="ri-add-line text-lg"></i>
        新建提示词
      </Button>
    </div>

    <div class="flex-1 overflow-hidden">
      <DataTable
        :value="prompts"
        :loading="isLoading"
        tableStyle="min-width: 80rem"
        class="w-full"
      >
        <Column header="封面" style="width: 5%">
          <template #body="{ data }">
            <div class="avatar" v-if="data.thumbnail">
              <div class="w-10 h-10 rounded shadow-sm border border-base-200">
                <img :src="data.thumbnail" alt="Thumb" class="object-cover" />
              </div>
            </div>
            <span v-else class="text-xs text-base-content/20">-</span>
          </template>
        </Column>

        <Column header="提示词" style="width: 18%">
          <template #body="{ data }">
            <div class="max-w-[240px] truncate font-bold text-base-content">
              {{ data.prompt }}
            </div>
            <div
              class="max-w-[240px] truncate text-xs text-base-content/50 mt-1 italic"
            >
              {{ data.translation }}
            </div>
          </template>
        </Column>

        <Column header="标签" style="width: 15%">
          <template #body="{ data }">
            <div class="flex flex-wrap gap-1">
              <Tag
                v-for="tagId in data.tags"
                :key="tagId"
                :value="getTagName(tagId)"
                :style="{
                  backgroundColor: getTagColor(tagId),
                  color: getTextColor(getTagColor(tagId)),
                }"
              />
              <span
                v-if="!data.tags || data.tags.length === 0"
                class="text-[10px] opacity-20"
                >无标签</span
              >
            </div>
          </template>
        </Column>

        <Column header="所属词典/分类" style="width: 12%">
          <template #body="{ data }">
            <div class="text-xs font-bold text-primary">
              {{ getDictName(data.dictionaryId) }}
            </div>
            <div
              class="text-[10px] text-base-content/40 mt-0.5 uppercase tracking-tighter"
            >
              {{ getCategoryName(data.categoryId) }}
            </div>
          </template>
        </Column>

        <Column header="适用平台" style="width: 10%">
          <template #body="{ data }">
            <div class="flex flex-wrap gap-1">
              <span
                v-for="pid in data.platforms"
                :key="pid"
                class="text-[10px] bg-base-200 px-1.5 py-0.5 rounded text-base-content/70"
              >
                {{ getPlatformName(pid) }}
              </span>
              <span
                v-if="!data.platforms || data.platforms.length === 0"
                class="text-[10px] opacity-20"
                >-</span
              >
            </div>
          </template>
        </Column>

        <Column header="适用模型" style="width: 10%">
          <template #body="{ data }">
            <div class="flex flex-wrap gap-1">
              <span
                v-for="mid in data.models"
                :key="mid"
                class="text-[10px] bg-base-200 px-1.5 py-0.5 rounded text-base-content/70"
              >
                {{ getModelName(mid) }}
              </span>
              <span
                v-if="!data.models || data.models.length === 0"
                class="text-[10px] opacity-20"
                >-</span
              >
            </div>
          </template>
        </Column>

        <Column header="操作" style="width: 8%">
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
import { useConfirm } from "primevue/useconfirm";
import { useMessage } from "@/composables/useMessage";
import SharedPromptModal from "@/components/business/SharedPromptModal.vue";
import { localStore } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config";
import type {
  PromptItem,
  DictionaryItem,
  CategoryItem,
  PlatformItem,
  TagItem,
  AIModelItem,
} from "@/types";

const confirm = useConfirm();
const { success, warning } = useMessage();

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

const getTextColor = (bgColor: string): string => {
  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#1f2937" : "#ffffff";
};

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

const handleDelete = (row: PromptItem) => {
  confirm.require({
    message: "确定删除提示词吗？",
    header: "警告",
    icon: "ri-error-warning-line",
    rejectLabel: "取消",
    acceptLabel: "确定",
    acceptClass: "p-button-danger",
    accept: async () => {
      const newList = prompts.value.filter((item) => item.id !== row.id);
      await localStore.set(STORAGE_KEYS.PROMPTS, newList);
      success("删除成功");
      await loadAllData();
    },
  });
};

onMounted(() => loadAllData());
</script>
