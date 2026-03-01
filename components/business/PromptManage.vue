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
        <template #cell-prompt="{ row }">
          <div class="max-w-[200px] truncate font-medium" :title="row.prompt">
            {{ row.prompt }}
          </div>
          <div
            class="max-w-[200px] truncate text-xs text-base-content/60 mt-1"
            :title="row.translation"
          >
            {{ row.translation }}
          </div>
        </template>

        <template #cell-dictionaryId="{ row }">
          <div class="text-sm font-medium text-primary">
            {{ getDictName(row.dictionaryId) }}
          </div>
          <div class="text-xs text-base-content/60 mt-0.5">
            {{ getCategoryName(row.categoryId) }}
          </div>
        </template>

        <template #cell-tags="{ row }">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="tagId in row.tags"
              :key="tagId"
              class="badge badge-sm badge-outline badge-primary"
            >
              {{ getTagName(tagId) }}
            </span>
          </div>
        </template>

        <template #cell-platforms="{ row }">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="pid in row.platforms"
              :key="pid"
              class="text-xs bg-base-200 px-1.5 py-0.5 rounded"
            >
              {{ getPlatformName(pid) }}
            </span>
          </div>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex gap-2">
            <button
              class="btn btn-xs btn-ghost text-info"
              @click="handleCopy(row.prompt, row)"
            >
              复制
            </button>
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
      <div class="modal-box w-11/12 max-w-4xl h-[90vh] flex flex-col">
        <h3
          class="font-bold text-lg mb-4 shrink-0 border-b border-base-200 pb-2"
        >
          {{ isEdit ? "编辑提示词" : "新增提示词" }}
        </h3>

        <form
          @submit.prevent="saveData"
          class="flex-1 overflow-y-auto pr-2 space-y-6"
        >
          <div class="grid grid-cols-2 gap-4 bg-base-200/30 p-4 rounded-box">
            <div class="form-control w-full">
              <label class="label"
                ><span class="label-text font-medium"
                  >所属词典 <span class="text-error">*</span></span
                ></label
              >
              <select
                v-model="formData.dictionaryId"
                class="select select-bordered w-full"
                required
                @change="handleDictChange"
              >
                <option value="" disabled>请选择词典</option>
                <option
                  v-for="dict in dictionaries"
                  :key="dict.id"
                  :value="dict.id"
                >
                  {{ dict.name }}
                </option>
              </select>
            </div>
            <div class="form-control w-full">
              <label class="label"
                ><span class="label-text font-medium"
                  >所属分类 <span class="text-error">*</span></span
                ></label
              >
              <select
                v-model="formData.categoryId"
                class="select select-bordered w-full"
                required
                :disabled="!formData.dictionaryId"
              >
                <option value="" disabled>
                  {{ formData.dictionaryId ? "请选择分类" : "请先选择词典" }}
                </option>
                <option
                  v-for="cat in availableCategories"
                  :key="cat.id"
                  :value="cat.id"
                >
                  {{ cat.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-control w-full">
              <label class="label"
                ><span class="label-text font-medium"
                  >提示词 (Prompt) <span class="text-error">*</span></span
                ></label
              >
              <textarea
                v-model.trim="formData.prompt"
                class="textarea textarea-bordered h-32 font-mono text-sm"
                placeholder="输入核心提示词..."
                required
              ></textarea>
            </div>
            <div class="form-control w-full flex flex-col">
              <label class="label"
                ><span class="label-text font-medium"
                  >中文翻译 / 解释 <span class="text-error">*</span></span
                ></label
              >
              <textarea
                v-model.trim="formData.translation"
                class="textarea textarea-bordered flex-1"
                placeholder="输入对应的中文翻译..."
                required
              ></textarea>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 bg-base-200/30 p-4 rounded-box">
            <div class="form-control w-full">
              <label class="label"
                ><span class="label-text font-medium"
                  >适用平台 (可多选)</span
                ></label
              >
              <MultiSelectInput
                v-model="formData.platforms"
                :options="platformsList"
                :allowCreate="false"
                placeholder="选择平台..."
                @update:modelValue="handlePlatformChange"
              />
            </div>
            <div class="form-control w-full">
              <label class="label">
                <span class="label-text font-medium">适用模型 (可多选)</span>
                <span class="label-text-alt text-base-content/50"
                  >基于已选平台过滤</span
                >
              </label>
              <MultiSelectInput
                v-model="formData.models"
                :options="availableModels"
                :allowCreate="false"
                placeholder="选择模型..."
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-control w-full">
              <label class="label">
                <span class="label-text font-medium"
                  >关联标签 <span class="text-error">*</span></span
                >
                <span class="label-text-alt text-base-content/50"
                  >输入后回车可快捷创建</span
                >
              </label>
              <MultiSelectInput
                v-model="formData.tags"
                :options="tagsList"
                :allowCreate="true"
                placeholder="选择或输入新标签并回车..."
                @create="handleCreateTag"
              />
            </div>
            <div class="form-control w-full">
              <label class="label"
                ><span class="label-text font-medium">备注 (Notes)</span></label
              >
              <input
                v-model.trim="formData.notes"
                type="text"
                class="input input-bordered w-full"
                placeholder="可选..."
              />
            </div>
          </div>
        </form>

        <div class="modal-action shrink-0 border-t border-base-200 pt-4 mt-0">
          <button type="button" class="btn btn-ghost" @click="closeModal">
            取消
          </button>
          <button type="button" class="btn btn-primary" @click="saveData">
            保存提示词
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click.prevent="closeModal">
        <button>关闭</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import BaseTable, { type TableColumn } from "@/components/ui/BaseTable.vue";
import MultiSelectInput from "@/components/ui/MultiSelectInput.vue";
import { localStore } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config";
import { useConfirm } from "@/composables/useConfirm";
import { useMessage } from "@/composables/useMessage";
import type {
  PromptItem,
  DictionaryItem,
  CategoryItem,
  PlatformItem,
  AIModelItem,
  TagItem,
} from "@/types";
import { createDefaultPrompt, createDefaultTag } from "@/utils/factories";

const { confirm } = useConfirm();
const { success, error, warning } = useMessage();

// --- 所有数据源状态 ---
const prompts = ref<PromptItem[]>([]);
const dictionaries = ref<DictionaryItem[]>([]);
const categories = ref<CategoryItem[]>([]);
const platformsList = ref<PlatformItem[]>([]);
const modelsList = ref<AIModelItem[]>([]);
const tagsList = ref<TagItem[]>([]);

const isLoading = ref(false);
const isModalOpen = ref(false);
const isEdit = ref(false);

const formData = ref<PromptItem>(createDefaultPrompt());
// --- 表格列定义 ---
const columns: TableColumn<PromptItem>[] = [
  { key: "prompt", label: "提示词 / 翻译", width: "30%" },
  { key: "dictionaryId", label: "所属词典 / 分类", width: "20%" },
  { key: "tags", label: "标签", width: "15%" },
  { key: "platforms", label: "适用平台", width: "15%" },
  { key: "useCount", label: "使用次数", sortable: true, width: "10%" },
  { key: "actions", label: "操作", width: "10%" },
];

// --- 级联计算属性 ---
// 1. 根据当前选中的 dictionaryId 过滤可用的分类
const availableCategories = computed(() => {
  if (!formData.value.dictionaryId) return [];
  return categories.value.filter(
    (c) => c.dictionaryId === formData.value.dictionaryId,
  );
});

// 2. 根据当前选中的 platforms 过滤可用的模型
const availableModels = computed(() => {
  if (!formData.value.platforms || formData.value.platforms.length === 0)
    return [];
  return modelsList.value.filter((m) =>
    formData.value.platforms!.includes(m.platformId),
  );
});

// --- 级联重置逻辑 ---
const handleDictChange = () => {
  // 切换词典时，必须清空已选分类
  formData.value.categoryId = "";
};

const handlePlatformChange = () => {
  // 切换平台时，检查已选的模型，如果它所属的平台被取消选中了，则将其移除
  if (formData.value.models) {
    formData.value.models = formData.value.models.filter((modelId) => {
      const model = modelsList.value.find((m) => m.id === modelId);
      return model && formData.value.platforms?.includes(model.platformId);
    });
  }
};

// --- 加载数据字典 ---
const loadAllData = async () => {
  isLoading.value = true;
  // 并发拉取所有的存储表
  const [p, d, c, pt, m, t] = await Promise.all([
    localStore.get<PromptItem[]>(STORAGE_KEYS.PROMPTS, []),
    localStore.get<DictionaryItem[]>(STORAGE_KEYS.DICTIONARIES, []),
    localStore.get<CategoryItem[]>(STORAGE_KEYS.CATEGORIES, []),
    localStore.get<PlatformItem[]>(STORAGE_KEYS.PLATFORMS, []),
    localStore.get<AIModelItem[]>(STORAGE_KEYS.MODELS, []),
    localStore.get<TagItem[]>(STORAGE_KEYS.TAGS, []),
  ]);

  prompts.value = p || [];
  dictionaries.value = d || [];
  categories.value = c || [];
  platformsList.value = pt || [];
  modelsList.value = m || [];
  tagsList.value = t || [];

  isLoading.value = false;
};

// --- 辅助渲染函数 (ID 映射为名称) ---
const getDictName = (id: string) =>
  dictionaries.value.find((d) => d.id === id)?.name || "未知词典";
const getCategoryName = (id: string) =>
  categories.value.find((c) => c.id === id)?.name || "未知分类";
const getTagName = (id: string) =>
  tagsList.value.find((t) => t.id === id)?.name || "未知标签";
const getPlatformName = (id: string) =>
  platformsList.value.find((p) => p.id === id)?.name || "未知平台";

// --- 弹窗与核心逻辑 ---
const openAddModal = () => {
  if (dictionaries.value.length === 0) {
    warning("请先前往“词典管理”创建一个词典！");
    return;
  }
  isEdit.value = false;
  // 2. 干净的重置
  formData.value = createDefaultPrompt();
  isModalOpen.value = true;
};

const openEditModal = (row: PromptItem) => {
  isEdit.value = true;
  // 深度拷贝以避免直接修改原响应式对象
  formData.value = JSON.parse(JSON.stringify(row));
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

// --- 在 Prompt 表单内直接回车创建新标签 ---
const handleCreateTag = async (tagName: string) => {
  const newTag = createDefaultTag(tagName); // 👈 极简生成
  tagsList.value.unshift(newTag);
  formData.value.tags?.push(newTag.id);
  await localStore.set(STORAGE_KEYS.TAGS, tagsList.value);
  success(`标签 "${tagName}" 创建成功`);
};

// --- 复制并统计使用次数 ---
const handleCopy = async (text: string, row: PromptItem) => {
  try {
    await navigator.clipboard.writeText(text);
    success("已复制到剪贴板！");

    // 增加使用次数并落盘
    const index = prompts.value.findIndex((p) => p.id === row.id);
    if (index > -1) {
      prompts.value[index].useCount += 1;
      await localStore.set(STORAGE_KEYS.PROMPTS, prompts.value);
    }
  } catch (err) {
    error("复制失败");
  }
};

// --- 保存落盘 ---
const saveData = async () => {
  // 必填项校验
  if (
    !formData.value.dictionaryId ||
    !formData.value.categoryId ||
    !formData.value.prompt ||
    !formData.value.translation
  ) {
    warning("请填完必填项 (*)");
    return;
  }
  if (formData.value.tags.length === 0) {
    // 👈 直接访问 length，绝对安全
    warning("请至少关联一个标签！");
    return;
  }

  const promptData: PromptItem = {
    ...formData.value, // 👈 直接解构，完美继承
    id: isEdit.value ? formData.value.id : crypto.randomUUID(),
    createdAt: isEdit.value ? formData.value.createdAt : Date.now(),
    updatedAt: Date.now(),
  };

  const newList = [...prompts.value];
  if (isEdit.value) {
    const idx = newList.findIndex((p) => p.id === promptData.id);
    if (idx > -1) newList[idx] = promptData;
  } else {
    newList.unshift(promptData);
  }

  await localStore.set(STORAGE_KEYS.PROMPTS, newList);
  success(isEdit.value ? "修改成功" : "新增成功");
  closeModal();
  await loadAllData();
};

const handleDelete = async (row: PromptItem) => {
  const isOk = await confirm(
    "确定要永久删除这条提示词吗？",
    "删除确认",
    "danger",
  );
  if (isOk) {
    const newList = prompts.value.filter((item) => item.id !== row.id);
    await localStore.set(STORAGE_KEYS.PROMPTS, newList);
    success("删除成功");
    await loadAllData();
  }
};

onMounted(() => loadAllData());
</script>
