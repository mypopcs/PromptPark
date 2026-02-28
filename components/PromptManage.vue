<template>
  <div class="space-y-4">
    <div
      class="flex flex-wrap gap-4 items-end bg-base-100 p-4 rounded-box shadow-sm border border-base-200"
    >
      <div class="form-control">
        <label class="label"><span class="label-text">筛选词典</span></label>
        <select
          v-model="filterDictId"
          class="select select-bordered select-sm w-40"
        >
          <option value="">全部</option>
          <option v-for="d in dictionaries" :key="d.id" :value="d.id">
            {{ d.name }}
          </option>
        </select>
      </div>
      <div class="form-control">
        <label class="label"><span class="label-text">搜索内容</span></label>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="中文解释或英文内容..."
          class="input input-bordered input-sm w-64"
        />
      </div>
      <div class="flex-1"></div>
      <button class="btn btn-primary btn-sm" @click="openModal()">
        新建提示词
      </button>
    </div>

    <BaseTable
      :columns="promptColumns"
      :data="paginatedData"
      :total="filteredPrompts.length"
      v-model:currentPage="currentPage"
      :pageSize="pageSize"
    >
      <template #cell-imageUrl="{ row }">
        <div class="avatar">
          <div class="w-10 h-10 rounded">
            <img v-if="row.imageUrl" :src="row.imageUrl" />
            <div
              v-else
              class="bg-base-200 w-full h-full flex items-center justify-center text-[10px] opacity-30"
            >
              无图
            </div>
          </div>
        </div>
      </template>

      <template #cell-chinese="{ row }">
        <div class="font-bold text-sm">{{ row.chinese }}</div>
        <div class="text-xs opacity-60 truncate max-w-xs">{{ row.text }}</div>
      </template>

      <template #cell-dictionaryName="{ row }">
        <span class="badge badge-outline badge-sm">{{ row.dictionaryName }}</span>
      </template>

      <template #cell-categoryName="{ row }">
        <span class="badge badge-ghost badge-sm">{{ row.categoryName }}</span>
      </template>

      <template #cell-tagNames="{ row }">
        <div class="flex flex-wrap gap-1">
          <span
            v-for="tag in row.tagNames.split(', ').filter(Boolean)"
            :key="tag"
            class="badge badge-primary badge-xs"
          >
            {{ tag }}
          </span>
        </div>
      </template>

      <template #cell-platformNames="{ row }">
        <div class="flex flex-wrap gap-1">
          <span
            v-for="platform in row.platformNames.split(', ').filter(Boolean)"
            :key="platform"
            class="badge badge-secondary badge-xs"
          >
            {{ platform }}
          </span>
        </div>
      </template>

      <template #cell-modelNames="{ row }">
        <div class="flex flex-wrap gap-1">
          <span
            v-for="model in row.modelNames.split(', ').filter(Boolean)"
            :key="model"
            class="badge badge-accent badge-xs"
          >
            {{ model }}
          </span>
        </div>
      </template>

      <template #cell-viewNum="{ row }">
        <span
          class="badge badge-sm"
          :class="row.viewNum > 0 ? 'badge-info' : 'badge-ghost'"
        >
          {{ row.viewNum }}
        </span>
      </template>

      <template #cell-favoriteNum="{ row }">
        <span
          class="badge badge-sm"
          :class="row.favoriteNum > 0 ? 'badge-success' : 'badge-ghost'"
        >
          {{ row.favoriteNum }}
        </span>
      </template>

      <template #cell-useNum="{ row }">
        <span
          class="badge badge-sm"
          :class="row.useNum > 0 ? 'badge-warning' : 'badge-ghost'"
        >
          {{ row.useNum }}
        </span>
      </template>

      <template #cell-parkUseNum="{ row }">
        <span
          class="badge badge-sm"
          :class="row.parkUseNum === '是' ? 'badge-primary' : 'badge-ghost'"
        >
          {{ row.parkUseNum }}
        </span>
      </template>

      <template #cell-remark="{ row }">
        <div class="max-w-xs truncate text-xs opacity-60">
          {{ row.remark || "-" }}
        </div>
      </template>

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

    <PromptFormModal
      ref="promptModalRef"
      :title="isEdit ? '编辑提示词' : '新建提示词'"
      :confirm-text="isEdit ? '保存修改' : '保存数据'"
      cancel-text="取消"
      :dictionaries="dictionaries"
      :categories="categories"
      :tags="tags"
      :platforms="platforms"
      :models="models"
      :is-uploading="isUploading"
      @save="handleSave"
      @image-upload="handleImageUpload"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useConfirm } from "@/composables/useConfirm";
import {
  getDictionaries,
  getCategories,
  getPrompts,
  savePrompts,
  getTags,
  getPlatforms,
  getModels,
} from "@/utils/storage";
import type { Prompt, Dictionary, Category, PromptTag, AIPlatform, AIModel } from "@/types";
import BaseTable from "./BaseTable.vue";
import PromptFormModal from "./PromptFormModal.vue";

/** 数据状态 **/
const dictionaries = ref<Dictionary[]>([]);
const categories = ref<Category[]>([]);
const prompts = ref<Prompt[]>([]);
const tags = ref<PromptTag[]>([]);
const platforms = ref<AIPlatform[]>([]);
const models = ref<AIModel[]>([]);

const { openConfirm } = useConfirm();

const searchQuery = ref("");
const filterDictId = ref("");
const currentPage = ref(1);
const pageSize = 10;
const isUploading = ref(false);
const isEdit = ref(false);
const editingId = ref<string>("");

const promptModalRef = ref<InstanceType<typeof PromptFormModal> | null>(null);

/** 表头定义 **/
const promptColumns = [
  { key: "imageUrl", title: "封面" },
  { key: "chinese", title: "名称/含义" },
  { key: "text", title: "Prompt内容" },
  { key: "dictionaryName", title: "所属词典" },
  { key: "categoryName", title: "所属分类" },
  { key: "tagNames", title: "标签" },
  { key: "platformNames", title: "适用平台" },
  { key: "modelNames", title: "适用模型" },
  { key: "viewNum", title: "查看数", sortable: true },
  { key: "favoriteNum", title: "收藏数", sortable: true },
  { key: "useNum", title: "使用数", sortable: true },
  { key: "parkUseNum", title: "官方采用" },
  { key: "remark", title: "备注" },
];

onMounted(async () => {
  console.log("📦 PromptManage 组件挂载，开始获取数据");
  const [d, c, p, t, pl, m] = await Promise.all([
    getDictionaries(),
    getCategories(),
    getPrompts(),
    getTags(),
    getPlatforms(),
    getModels(),
  ]);
  dictionaries.value = d;
  categories.value = c;
  prompts.value = p;
  tags.value = t;
  platforms.value = pl;
  models.value = m;
});

/** 列表过滤逻辑 **/
const filteredPrompts = computed(() => {
  return prompts.value.filter((p) => {
    const matchDict = !filterDictId.value || p.dictionaryId === filterDictId.value;
    const matchSearch =
      !searchQuery.value ||
      (p.chinese && p.chinese.includes(searchQuery.value)) ||
      (p.text && p.text.includes(searchQuery.value));
    return matchDict && matchSearch;
  });
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const result = filteredPrompts.value.slice(start, start + pageSize);

  return result.map((prompt) => {
    const dict = dictionaries.value.find((d) => d.id === prompt.dictionaryId);
    const category = categories.value.find((c) => c.id === prompt.categoryId);
    const tagNames =
      prompt.tagIds
        ?.map((id) => tags.value.find((t) => t.id === id)?.name)
        .filter(Boolean)
        .join(", ") || "";
    const platformNames =
      prompt.AIPlatformIds?.map((id) => platforms.value.find((p) => p.id === id)?.name)
        .filter(Boolean)
        .join(", ") || "";
    const modelNames =
      prompt.AIModelIds?.map((id) => models.value.find((m) => m.id === id)?.name)
        .filter(Boolean)
        .join(", ") || "";

    return {
      ...prompt,
      dictionaryName: dict?.name || "未知词典",
      categoryName: category?.name || "未知分类",
      tagNames,
      platformNames,
      modelNames,
      parkUseNum: prompt.parkUseNum ? "是" : "否",
    };
  });
});

/** 模拟上传逻辑 **/
const handleImageUpload = async (file: File) => {
  if (!file) return;
  isUploading.value = true;
  setTimeout(() => {
    isUploading.value = false;
  }, 8000);
};

const openModal = (row?: Prompt) => {
  isEdit.value = !!row;
  editingId.value = row?.id || "";
  const initialData = row
    ? { ...row }
    : {
        tagIds: [],
        AIPlatformIds: [],
        AIModelIds: [],
        dictionaryId: dictionaries.value[0]?.id || "",
      };
  promptModalRef.value?.show(initialData);
};

/**
 * 危险删除二次确认。
 */
const confirmDangerousDelete = async (targetName: string): Promise<boolean> => {
  const firstConfirm = await openConfirm("危险操作确认", `确定要删除${targetName}吗？`);
  if (!firstConfirm) return false;
  return openConfirm("再次确认", `删除后将无法恢复，请再次确认删除${targetName}`);
};

const handleSave = async (formData: Partial<Prompt>) => {
  if (!formData.text || !formData.dictionaryId) return;

  if (isEdit.value && editingId.value) {
    const idx = prompts.value.findIndex((p) => p.id === editingId.value);
    if (idx !== -1) {
      prompts.value[idx] = {
        ...prompts.value[idx],
        ...formData,
        updatedAt: Date.now(),
      } as Prompt;
    }
  } else {
    prompts.value.push({
      ...formData,
      id: "p_" + Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      viewNum: 0,
      favoriteNum: 0,
      useNum: 0,
    } as Prompt);
  }

  await savePrompts(prompts.value);
  promptModalRef.value?.close();
};

const handleDelete = async (id: string) => {
  if (!(await confirmDangerousDelete("该提示词"))) return;
  prompts.value = prompts.value.filter((p) => p.id !== id);
  await savePrompts(prompts.value);
};
</script>
