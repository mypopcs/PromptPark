<template>
  <div class="space-y-6 h-full flex flex-col animate-fade-in">
    <div class="flex items-center justify-between shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-base-content">词典与分类管理</h1>
        <p class="text-sm text-base-content/70 mt-1">
          管理您的词典及下属分类，分类将与词典强绑定
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
        新增词典
      </button>
    </div>

    <div class="flex-1 overflow-hidden">
      <BaseTable
        :columns="columns"
        :data="dictionaries"
        :loading="isLoading"
        :total="dictionaries.length"
      >
        <template #cell-coverImage="{ row }">
          <div class="avatar">
            <div class="w-10 rounded">
              <img
                :src="
                  row.coverImage || 'https://placehold.co/100x100?text=Dict'
                "
                alt="Cover"
              />
            </div>
          </div>
        </template>

        <template #cell-isOfficialRecommended="{ row }">
          <span
            v-if="row.isOfficialRecommended"
            class="badge badge-success badge-sm"
            >官方推荐</span
          >
          <span v-else class="text-base-content/40 text-sm">-</span>
        </template>

        <template #cell-price="{ row }">
          <span class="font-mono text-warning"
            >¥ {{ row.price?.toFixed(2) || "0.00" }}</span
          >
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

    <dialog class="modal" :class="{ 'modal-open': isModalOpen }">
      <div class="modal-box w-11/12 max-w-2xl">
        <h3 class="font-bold text-lg mb-6 border-b border-base-200 pb-2">
          {{ isEdit ? "编辑词典" : "新增词典" }}
        </h3>

        <form @submit.prevent="saveData" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-control w-full">
              <label class="label"
                ><span class="label-text font-medium"
                  >词典名称 <span class="text-error">*</span></span
                ></label
              >
              <input
                v-model.trim="formData.name"
                type="text"
                placeholder="例如: 爆款文案词典"
                class="input input-bordered w-full"
                required
              />
            </div>
            <div class="form-control w-full">
              <label class="label"
                ><span class="label-text font-medium">销售价格 (¥)</span></label
              >
              <input
                v-model.number="formData.price"
                type="number"
                step="0.01"
                min="0"
                class="input input-bordered w-full"
              />
            </div>
          </div>

          <div class="form-control w-full">
            <label class="label"
              ><span class="label-text font-medium">词典描述</span></label
            >
            <textarea
              v-model.trim="formData.description"
              class="textarea textarea-bordered h-20"
              placeholder="一句话介绍这个词典..."
            ></textarea>
          </div>

          <div
            class="form-control w-full bg-base-200/50 p-4 rounded-box border border-base-200"
          >
            <label class="label pt-0"
              ><span class="label-text font-medium text-primary"
                >下属分类管理</span
              ></label
            >
            <p class="text-xs text-base-content/60 mb-2">
              输入分类名称后按回车(Enter)即可快速创建分类，按退格键(Backspace)可删除。
            </p>

            <MultiSelectInput
              v-model="selectedCategoryIds"
              :options="currentDictCategories"
              placeholder="输入新分类名称并回车..."
              @create="handleCreateCategory"
            />
          </div>

          <div class="flex items-center gap-6 mt-4">
            <div class="form-control w-full max-w-xs">
              <label class="label"
                ><span class="label-text font-medium"
                  >封面图链接 (URL)</span
                ></label
              >
              <input
                v-model.trim="formData.coverImage"
                type="url"
                placeholder="https://..."
                class="input input-sm input-bordered w-full"
              />
            </div>
            <label class="cursor-pointer label flex gap-2 mt-7">
              <span class="label-text font-medium">设为官方推荐</span>
              <input
                v-model="formData.isOfficialRecommended"
                type="checkbox"
                class="toggle toggle-success"
              />
            </label>
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
import type { DictionaryItem, CategoryItem } from "@/types";
import { localStore } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config";
import { useConfirm } from "@/composables/useConfirm";
import { useMessage } from "@/composables/useMessage";
import {
  createDefaultDictionary,
  createDefaultCategory,
} from "@/utils/factories"; // 👈 引入工厂函数

const { confirm } = useConfirm();
const { success } = useMessage();

// --- 状态定义 ---
const dictionaries = ref<DictionaryItem[]>([]);
const allCategories = ref<CategoryItem[]>([]);
const isLoading = ref(false);

const isModalOpen = ref(false);
const isEdit = ref(false);

// 👈 核心重构 1：直接用工厂初始化，彻底干掉冗余的 currentDictId
const formData = ref<DictionaryItem>(createDefaultDictionary());
const currentDictCategories = ref<CategoryItem[]>([]); // 当前词典拥有的分类列表 (作为选项源)
const selectedCategoryIds = ref<string[]>([]); // MultiSelectInput 绑定的选中 ID

// --- 表格列定义 ---
const columns: TableColumn<DictionaryItem>[] = [
  { key: "coverImage", label: "封面", width: "8%" },
  { key: "name", label: "词典名称", sortable: true, width: "20%" },
  { key: "description", label: "描述", width: "20%" },
  { key: "categoryCount", label: "分类数", sortable: true, width: "10%" },
  { key: "promptCount", label: "提示词数", sortable: true, width: "10%" },
  { key: "price", label: "价格", sortable: true, width: "10%" },
  { key: "isOfficialRecommended", label: "官方推荐", width: "10%" },
  { key: "actions", label: "操作", width: "12%" },
];

// --- 数据加载 ---
const loadData = async () => {
  isLoading.value = true;
  dictionaries.value =
    (await localStore.get<DictionaryItem[]>(STORAGE_KEYS.DICTIONARIES, [])) ||
    [];
  allCategories.value =
    (await localStore.get<CategoryItem[]>(STORAGE_KEYS.CATEGORIES, [])) || [];

  // 动态计算每个词典的分类数量 (确保数据一致性)
  dictionaries.value.forEach((dict) => {
    dict.categoryCount = allCategories.value.filter(
      (c) => c.dictionaryId === dict.id,
    ).length;
  });

  isLoading.value = false;
};

// --- 弹窗逻辑 ---
const openAddModal = () => {
  isEdit.value = false;
  // 👈 核心重构 2：极其干净的重置，工厂内部已生成全新的 ID
  formData.value = createDefaultDictionary();

  currentDictCategories.value = [];
  selectedCategoryIds.value = [];
  isModalOpen.value = true;
};

const openEditModal = (row: DictionaryItem) => {
  isEdit.value = true;
  // 深度拷贝，避免直接修改原响应式对象
  formData.value = JSON.parse(JSON.stringify(row));

  // 找出属于这个词典的所有分类
  const dictCats = allCategories.value.filter((c) => c.dictionaryId === row.id);
  currentDictCategories.value = [...dictCats];
  // 默认全部选中 (因为分类强绑定词典)
  selectedCategoryIds.value = dictCats.map((c) => c.id);

  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

// --- 分类创建逻辑 (对接 MultiSelectInput) ---
const handleCreateCategory = (name: string) => {
  // 👈 核心重构 3：使用工厂生成分类对象，极其清爽
  const newCat = createDefaultCategory(formData.value.id, name);

  currentDictCategories.value.push(newCat);
  selectedCategoryIds.value.push(newCat.id);
};

// --- 保存落盘逻辑 ---
const saveData = async () => {
  // 👈 核心重构 4：不需要再手动拼装长长的对象，直接更新字段即可
  formData.value.categoryCount = selectedCategoryIds.value.length;
  formData.value.updatedAt = Date.now();
  if (!isEdit.value) {
    formData.value.createdAt = Date.now();
  }

  const newDictList = [...dictionaries.value];
  if (isEdit.value) {
    const index = newDictList.findIndex((d) => d.id === formData.value.id);
    if (index > -1) newDictList[index] = formData.value;
  } else {
    newDictList.unshift(formData.value);
  }

  // 处理分类数据的保存：保留“其他词典的分类” + “当前词典被选中的分类”
  const otherCats = allCategories.value.filter(
    (c) => c.dictionaryId !== formData.value.id,
  );
  const selectedCatsToSave = currentDictCategories.value.filter((c) =>
    selectedCategoryIds.value.includes(c.id),
  );
  const newCatList = [...otherCats, ...selectedCatsToSave];

  // 一起存入本地存储
  await localStore.set(STORAGE_KEYS.DICTIONARIES, newDictList);
  await localStore.set(STORAGE_KEYS.CATEGORIES, newCatList);

  success(isEdit.value ? "词典及分类修改成功" : "词典及分类创建成功");
  closeModal();
  await loadData(); // 重新加载刷新页面
};

// --- 删除逻辑 ---
const handleDelete = async (row: DictionaryItem) => {
  const isOk = await confirm(
    `确定要删除词典 "${row.name}" 吗？其下属的分类也将被一并删除！`,
    "危险操作",
    "danger",
  );
  if (isOk) {
    // 删词典
    const newDictList = dictionaries.value.filter((item) => item.id !== row.id);
    await localStore.set(STORAGE_KEYS.DICTIONARIES, newDictList);

    // 级联删分类
    const newCatList = allCategories.value.filter(
      (c) => c.dictionaryId !== row.id,
    );
    await localStore.set(STORAGE_KEYS.CATEGORIES, newCatList);

    success("删除成功");
    await loadData();
  }
};

onMounted(() => loadData());
</script>
