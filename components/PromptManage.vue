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

    <!-- Debug: BaseTable 数据接收调试 -->
    <!-- 数据总数: {{ filteredPrompts.length }}, 当前页: {{ currentPage }}, 分页数据量: {{ paginatedData.length }} -->
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

      <template #cell-text="{ row }">
        <div class="max-w-xs truncate opacity-70 italic text-xs">
          {{ row.text }}
        </div>
      </template>

      <template #cell-dictionaryName="{ row }">
        <span class="badge badge-outline badge-sm">{{
          row.dictionaryName
        }}</span>
      </template>

      <template #cell-categoryName="{ row }">
        <span class="badge badge-ghost badge-sm">{{ row.categoryName }}</span>
      </template>

      <template #cell-tagNames="{ row }">
        <div class="flex flex-wrap gap-1 max-w-xs">
          <span v-if="!row.tagNames" class="text-xs opacity-40">-</span>
          <span
            v-for="tag in row.tagNames.split(', ').filter(Boolean)"
            :key="tag"
            class="badge badge-primary badge-sm text-[10px]"
          >
            {{ tag }}
          </span>
        </div>
      </template>

      <template #cell-platformNames="{ row }">
        <div class="flex flex-wrap gap-1 max-w-xs">
          <span v-if="!row.platformNames" class="text-xs opacity-40">-</span>
          <span
            v-for="platform in row.platformNames.split(', ').filter(Boolean)"
            :key="platform"
            class="badge badge-secondary badge-sm text-[10px]"
          >
            {{ platform }}
          </span>
        </div>
      </template>

      <template #cell-modelNames="{ row }">
        <div class="flex flex-wrap gap-1 max-w-xs">
          <span v-if="!row.modelNames" class="text-xs opacity-40">-</span>
          <span
            v-for="model in row.modelNames.split(', ').filter(Boolean)"
            :key="model"
            class="badge badge-accent badge-sm text-[10px]"
          >
            {{ model }}
          </span>
        </div>
      </template>

      <template #cell-parkUseNum="{ row }">
        <span
          class="badge badge-sm"
          :class="row.parkUseNum === '是' ? 'badge-success' : 'badge-ghost'"
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

    <dialog ref="promptModal" class="modal">
      <div class="modal-box max-w-4xl">
        <h3 class="font-bold text-lg border-b pb-2 mb-4">
          {{ isEdit ? "编辑" : "新建" }}提示词
        </h3>

        <div class="grid grid-cols-2 gap-8">
          <div class="space-y-4">
            <label class="form-control">
              <span class="label-text font-bold">英文提示词 (Prompt)</span>
              <textarea
                v-model="form.text"
                class="textarea textarea-bordered h-32"
                placeholder="输入核心提示词..."
              ></textarea>
            </label>
            <label class="form-control">
              <span class="label-text font-bold">中文解释</span>
              <input
                v-model="form.chinese"
                type="text"
                class="input input-bordered"
                placeholder="用于搜索和识别"
              />
            </label>
            <div class="form-control">
              <span class="label-text">备注</span>
              <input
                v-model="form.remark"
                type="text"
                class="input input-bordered"
              />
            </div>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <label class="form-control">
                <span class="label-text">所属词典</span>
                <select
                  v-model="form.dictionaryId"
                  class="select select-bordered select-sm"
                >
                  <option v-for="d in dictionaries" :key="d.id" :value="d.id">
                    {{ d.name }}
                  </option>
                </select>
              </label>
              <label class="form-control">
                <span class="label-text">所属分类</span>
                <select
                  v-model="form.categoryId"
                  class="select select-bordered select-sm"
                >
                  <option
                    v-for="c in availableCategories"
                    :key="c.id"
                    :value="c.id"
                  >
                    {{ c.name }}
                  </option>
                </select>
              </label>
            </div>

            <div class="form-control border p-3 rounded-lg bg-base-200/30">
              <span class="label-text mb-2">提示词封面 (GitHub 上传)</span>
              <div class="flex items-center gap-4">
                <div
                  class="w-16 h-16 bg-base-100 rounded border border-dashed flex items-center justify-center overflow-hidden"
                >
                  <img
                    v-if="form.imageUrl"
                    :src="form.imageUrl"
                    class="object-cover w-full h-full"
                  />
                  <span v-else class="text-[10px] opacity-30">预览</span>
                </div>
                <input
                  type="file"
                  @change="handleImageUpload"
                  class="file-input file-input-bordered file-input-sm flex-1"
                  accept="image/*"
                />
              </div>
            </div>

            <div class="form-control">
              <span class="label-text mb-1">标签</span>
              <div class="flex gap-2 mb-2">
                <input
                  v-model="newTagInput"
                  type="text"
                  class="input input-bordered input-sm flex-1"
                  placeholder="输入新标签名称，按回车添加"
                  @keyup.enter="handleAddNewTag"
                />
                <button
                  class="btn btn-sm btn-secondary"
                  @click="handleAddNewTag"
                >
                  添加标签
                </button>
              </div>
              <div
                class="flex flex-wrap gap-2 border p-2 rounded-lg max-h-24 overflow-y-auto"
              >
                <label
                  v-for="tag in tags"
                  :key="tag.id"
                  class="flex items-center gap-1 cursor-pointer badge badge-outline badge-sm p-2"
                  :class="{ 'badge-primary': form.tagIds?.includes(tag.id) }"
                >
                  <input
                    type="checkbox"
                    v-model="form.tagIds"
                    :value="tag.id"
                    class="checkbox checkbox-xs hidden"
                  />
                  <span class="text-xs">{{ tag.name }}</span>
                </label>
                <span v-if="tags.length === 0" class="text-xs opacity-50"
                  >暂无标签，请在上方输入新建</span
                >
              </div>
            </div>

            <div class="form-control">
              <span class="label-text mb-1">适用平台</span>
              <div
                class="flex flex-wrap gap-2 border p-2 rounded-lg max-h-24 overflow-y-auto"
              >
                <label
                  v-for="platform in platforms"
                  :key="platform.id"
                  class="flex items-center gap-1 cursor-pointer badge badge-outline badge-sm p-2"
                  :class="{
                    'badge-secondary': form.AIPlatformIds?.includes(
                      platform.id,
                    ),
                  }"
                >
                  <input
                    type="checkbox"
                    v-model="form.AIPlatformIds"
                    :value="platform.id"
                    class="checkbox checkbox-xs hidden"
                  />
                  <span class="text-xs">{{ platform.name }}</span>
                </label>
                <span v-if="platforms.length === 0" class="text-xs opacity-50"
                  >暂无平台，请在平台管理中添加</span
                >
              </div>
            </div>

            <div class="form-control">
              <span class="label-text mb-1">适用模型</span>
              <div
                class="flex flex-wrap gap-2 border p-2 rounded-lg max-h-24 overflow-y-auto"
              >
                <label
                  v-for="model in availableModels"
                  :key="model.id"
                  class="flex items-center gap-1 cursor-pointer badge badge-outline badge-sm p-2"
                  :class="{
                    'badge-accent': form.AIModelIds?.includes(model.id),
                  }"
                >
                  <input
                    type="checkbox"
                    v-model="form.AIModelIds"
                    :value="model.id"
                    class="checkbox checkbox-xs hidden"
                  />
                  <span class="text-xs">{{ model.name }}</span>
                </label>
                <span
                  v-if="availableModels.length === 0"
                  class="text-xs opacity-50"
                  >请先选择适用平台</span
                >
              </div>
            </div>
          </div>
        </div>

        <div class="modal-action">
          <button
            class="btn btn-primary"
            @click="handleSave"
            :disabled="isUploading"
          >
            <span v-if="isUploading" class="loading loading-spinner"></span
            >保存数据
          </button>
          <button class="btn" @click="promptModal?.close()">取消</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  getDictionaries,
  getCategories,
  getPrompts,
  savePrompts,
  getTags,
  saveTags,
  getPlatforms,
  getModels,
} from "@/utils/storage";
import type {
  Prompt,
  Dictionary,
  Category,
  PromptTag,
  AIPlatform,
  AIModel,
} from "@/types";
import BaseTable from "./BaseTable.vue";

/** 数据状态 **/
const dictionaries = ref<Dictionary[]>([]);
const categories = ref<Category[]>([]);
const prompts = ref<Prompt[]>([]);
const tags = ref<PromptTag[]>([]);
const platforms = ref<AIPlatform[]>([]);
const models = ref<AIModel[]>([]);

const searchQuery = ref("");
const filterDictId = ref("");
const currentPage = ref(1);
const pageSize = 10;
const isUploading = ref(false);
const newTagInput = ref("");

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

/** 弹窗表单 **/
const promptModal = ref<HTMLDialogElement | null>(null);
const isEdit = ref(false);
const form = ref<Partial<Prompt>>({});

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
  console.log("📦 获取到的词典数据:", d);
  console.log("📦 获取到的分类数据:", c);
  console.log("📦 获取到的提示词数据:", p);
  console.log("📦 获取到的标签数据:", t);
  console.log("📦 获取到的平台数据:", pl);
  console.log("📦 获取到的模型数据:", m);
  dictionaries.value = d;
  categories.value = c;
  prompts.value = p;
  tags.value = t;
  platforms.value = pl;
  models.value = m;
  console.log("📦 处理后的提示词数据:", prompts.value);
  console.log("📦 组件挂载完成");
});

/** 联动逻辑：过滤当前词典下的分类 **/
const availableCategories = computed(() => {
  const dict = dictionaries.value.find((d) => d.id === form.value.dictionaryId);
  return dict
    ? categories.value.filter((cat) => dict.categoryIds.includes(cat.id))
    : [];
});

/** 联动逻辑：根据选中的平台过滤模型 **/
const availableModels = computed(() => {
  if (!form.value.AIPlatformIds || form.value.AIPlatformIds.length === 0) {
    return [];
  }
  // 获取选中平台关联的所有模型ID
  const selectedPlatformModelIds = new Set<string>();
  form.value.AIPlatformIds.forEach((platformId) => {
    const platform = platforms.value.find((p) => p.id === platformId);
    if (platform) {
      platform.AIModelIds.forEach((modelId) => {
        selectedPlatformModelIds.add(modelId);
      });
    }
  });
  // 返回这些模型
  return models.value.filter((m) => selectedPlatformModelIds.has(m.id));
});

/** 添加新标签 **/
const handleAddNewTag = async () => {
  const tagName = newTagInput.value.trim();
  if (!tagName) return;

  // 检查是否已存在
  const existingTag = tags.value.find((t) => t.name === tagName);
  if (existingTag) {
    // 如果已存在，直接选中
    if (!form.value.tagIds) {
      form.value.tagIds = [];
    }
    if (!form.value.tagIds.includes(existingTag.id)) {
      form.value.tagIds.push(existingTag.id);
    }
    newTagInput.value = "";
    return;
  }

  // 创建新标签
  const newTag: PromptTag = {
    id: "tag_" + Date.now(),
    name: tagName,
    num: 0,
  };
  tags.value.push(newTag);

  // 保存到存储
  await saveTags(tags.value);

  // 选中新建的标签
  if (!form.value.tagIds) {
    form.value.tagIds = [];
  }
  form.value.tagIds.push(newTag.id);

  // 清空输入框
  newTagInput.value = "";
};

/** 列表过滤逻辑 **/
const filteredPrompts = computed(() => {
  const result = prompts.value.filter((p) => {
    const matchDict =
      !filterDictId.value || p.dictionaryId === filterDictId.value;
    const matchSearch =
      !searchQuery.value ||
      (p.chinese && p.chinese.includes(searchQuery.value)) ||
      (p.text && p.text.includes(searchQuery.value));
    return matchDict && matchSearch;
  });
  console.log(
    "🔍 过滤结果 - 提示词总数:",
    prompts.value.length,
    "筛选词典ID:",
    filterDictId.value,
    "搜索关键词:",
    searchQuery.value,
    "过滤后数量:",
    result.length,
  );
  return result;
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const result = filteredPrompts.value.slice(start, start + pageSize);

  // 转换 ID 为名称
  const enrichedResult = result.map((prompt) => {
    const dict = dictionaries.value.find((d) => d.id === prompt.dictionaryId);
    const category = categories.value.find((c) => c.id === prompt.categoryId);
    const tagNames =
      prompt.tagIds
        ?.map((id) => tags.value.find((t) => t.id === id)?.name)
        .filter(Boolean)
        .join(", ") || "";
    const platformNames =
      prompt.AIPlatformIds?.map(
        (id) => platforms.value.find((p) => p.id === id)?.name,
      )
        .filter(Boolean)
        .join(", ") || "";
    const modelNames =
      prompt.AIModelIds?.map(
        (id) => models.value.find((m) => m.id === id)?.name,
      )
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

  console.log(
    "📊 分页计算 - 当前页:",
    currentPage.value,
    "开始索引:",
    start,
    "结束索引:",
    start + pageSize,
    "结果:",
    enrichedResult,
  );
  return enrichedResult;
});

/** 模拟上传逻辑 (后续接入具体的 github.ts) **/
const handleImageUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  isUploading.value = true;
  // TODO: 调用 uploadToGithub(file)
  setTimeout(() => {
    form.value.imageUrl = URL.createObjectURL(file); // 临时预览
    isUploading.value = false;
  }, 8000);
};

const openModal = (row?: Prompt) => {
  isEdit.value = !!row;
  form.value = row
    ? { ...row }
    : {
        tagIds: [],
        AIPlatformIds: [],
        AIModelIds: [],
        dictionaryId: dictionaries.value[0]?.id || "",
        useNum: 0,
        viewNum: 0,
        favoriteNum: 0,
      };
  promptModal.value?.showModal();
};

const handleSave = async () => {
  if (!form.value.text || !form.value.dictionaryId) return;

  if (isEdit.value) {
    const idx = prompts.value.findIndex((p) => p.id === form.value.id);
    if (idx !== -1)
      prompts.value[idx] = {
        ...prompts.value[idx],
        ...form.value,
        updatedAt: Date.now(),
      } as Prompt;
  } else {
    prompts.value.push({
      ...form.value,
      id: "p_" + Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as Prompt);
  }

  await savePrompts(prompts.value);
  promptModal.value?.close();
};

const handleDelete = async (id: string) => {
  if (!confirm("确定删除此提示词？")) return;
  prompts.value = prompts.value.filter((p) => p.id !== id);
  await savePrompts(prompts.value);
};
</script>
