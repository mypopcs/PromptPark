<template>
  <div class="flex flex-col gap-6">
    <div class="alert shadow-sm bg-base-100 border-base-200 text-sm">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        class="stroke-info shrink-0 w-6 h-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
      <div>点击左侧词典行的名称，即可在右侧管理该词典下的分类。</div>
    </div>

    <div class="grid grid-cols-12 gap-6 items-start">
      <div class="col-span-12 lg:col-span-6 space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold flex items-center gap-2">📚 词典管理</h2>
          <button class="btn btn-primary btn-sm" @click="openDictModal()">
            新建词典
          </button>
        </div>
        <BaseTable
          :columns="dictColumns"
          :data="dictionaries"
          :total="dictionaries.length"
          :currentPage="1"
          :pageSize="100"
        >
          <template #cell-name="{ row }">
            <div
              class="font-bold cursor-pointer hover:text-primary transition-colors"
              :class="{ 'text-primary': selectedDictId === row.id }"
              @click="selectedDictId = row.id"
            >
              {{ row.name }}
              <span
                v-if="selectedDictId === row.id"
                class="ml-2 badge badge-primary badge-xs"
                >已选</span
              >
            </div>
          </template>
          <template #actions="{ row }">
            <div class="flex gap-1">
              <button
                class="btn btn-ghost btn-xs text-info"
                @click.stop="openDictModal(row)"
              >
                编辑
              </button>
              <button
                class="btn btn-ghost btn-xs text-error"
                @click.stop="handleDeleteDict(row.id)"
              >
                删除
              </button>
            </div>
          </template>
        </BaseTable>
      </div>

      <div class="col-span-12 lg:col-span-6 space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold flex items-center gap-2 text-secondary">
            <span v-if="selectedDict">📂 [{{ selectedDict.name }}] 的分类</span>
            <span v-else class="text-base-content/40">📂 请先选择词典</span>
          </h2>
          <button
            v-if="selectedDict"
            class="btn btn-secondary btn-sm"
            @click="openCatModal()"
          >
            新建分类
          </button>
        </div>
        <div v-if="selectedDict">
          <BaseTable
            :columns="catColumns"
            :data="currentCategories"
            :total="currentCategories.length"
            :currentPage="1"
            :pageSize="100"
          >
            <template #actions="{ row }">
              <div class="flex gap-2">
                <button
                  class="btn btn-sm btn-ghost text-info"
                  @click="openCatModal(row)"
                >
                  编辑
                </button>
                <button
                  class="btn btn-sm btn-ghost text-error"
                  @click="handleDeleteCat(row.id)"
                >
                  删除
                </button>
              </div>
            </template>
          </BaseTable>
        </div>
        <div
          v-else
          class="h-64 flex flex-col items-center justify-center border-2 border-dashed border-base-300 rounded-box bg-base-100/50 italic text-base-content/40"
        >
          未选择词典，请点击左侧表格中的名称
        </div>
      </div>
    </div>

    <dialog ref="dictModal" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">
          {{ isEditDict ? "编辑词典" : "新建词典" }}
        </h3>
        <div class="form-control gap-4">
          <input
            v-model="dictForm.name"
            type="text"
            class="input input-bordered"
            placeholder="词典名称"
          />
          <textarea
            v-model="dictForm.description"
            class="textarea textarea-bordered h-24"
            placeholder="词典描述"
          ></textarea>
        </div>
        <div class="modal-action">
          <button class="btn" @click="dictModal?.close()">取消</button>
          <button class="btn btn-primary" @click="saveDict">保存</button>
        </div>
      </div>
    </dialog>

    <dialog ref="catModal" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">
          {{ isEditCat ? "编辑分类" : "新建分类" }}
        </h3>
        <div class="badge badge-outline mb-4">
          所属词典: {{ selectedDict?.name }}
        </div>
        <input
          v-model="catForm.name"
          type="text"
          placeholder="分类名称"
          class="input input-bordered w-full"
        />
        <div class="modal-action">
          <button class="btn" @click="catModal?.close()">取消</button>
          <button class="btn btn-primary" @click="saveCat">保存</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useConfirm } from "@/composables/useConfirm";
import {
  getDictionaries,
  saveDictionaries,
  getCategories,
  saveCategories,
} from "@/utils/storage";
import type { Dictionary, Category } from "@/types";
import BaseTable from "./BaseTable.vue";

const { openConfirm } = useConfirm();

const dictionaries = ref<Dictionary[]>([]);
const allCategories = ref<Category[]>([]);
const selectedDictId = ref<string | null>(null);

const dictColumns = [
  { key: "name", title: "词典名称" },
  { key: "categoryNum", title: "分类数", sortable: true },
  { key: "promptNum", title: "提示词", sortable: true },
];
const catColumns = [
  { key: "name", title: "分类名称" },
  { key: "promptNum", title: "关联提示词", sortable: true },
];

const dictModal = ref<HTMLDialogElement | null>(null);
const catModal = ref<HTMLDialogElement | null>(null);
const dictForm = ref<Partial<Dictionary>>({});
const catForm = ref<Partial<Category>>({});
const isEditDict = ref(false);
const isEditCat = ref(false);

const selectedDict = computed(() =>
  dictionaries.value.find((d) => d.id === selectedDictId.value),
);
const currentCategories = computed(() => {
  if (!selectedDict.value) return [];
  return allCategories.value.filter((cat) =>
    selectedDict.value?.categoryIds.includes(cat.id),
  );
});

onMounted(async () => {
  console.log("📦 组件挂载，开始获取数据");
  const [d, c] = await Promise.all([getDictionaries(), getCategories()]);
  console.log("📦 获取到的词典数据:", d);
  console.log("📦 获取到的分类数据:", c);
  dictionaries.value = Array.isArray(d) ? d : [];
  console.log("📦 处理后的词典数据:", dictionaries.value);
  allCategories.value = Array.isArray(c) ? c : [];
  if (dictionaries.value.length > 0) {
    const firstDictionary = dictionaries.value[0];
    if (firstDictionary) {
      selectedDictId.value = firstDictionary.id;
      console.log("📦 选中的词典ID:", selectedDictId.value);
    }
  }
  console.log("📦 组件挂载完成");
});

const openDictModal = (row?: Dictionary) => {
  isEditDict.value = !!row;
  dictForm.value = row ? { ...row } : { name: "", description: "" };
  dictModal.value?.showModal();
};

const saveDict = async () => {
  console.log("💾 开始保存词典");
  if (!dictForm.value.name) {
    console.log("❌ 词典名称为空，保存失败");
    return;
  }
  if (isEditDict.value) {
    console.log("📝 编辑词典:", dictForm.value);
    const idx = dictionaries.value.findIndex((d) => d.id === dictForm.value.id);
    if (idx !== -1) {
      dictionaries.value[idx] = {
        ...dictionaries.value[idx],
        ...dictForm.value,
        updatedAt: Date.now(),
      } as Dictionary;
      console.log("📝 编辑后的词典数据:", dictionaries.value[idx]);
    }
  } else {
    console.log("➕ 新增词典:", dictForm.value);
    const newDict = {
      id: "dict_" + Date.now(),
      name: dictForm.value.name!,
      description: dictForm.value.description || "",
      categoryIds: [],
      promptIds: [],
      parkRecommend: false,
      price: 0,
      categoryNum: 0,
      promptNum: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dictionaries.value.push(newDict);
    console.log("➕ 新增后的词典数据:", newDict);
  }
  console.log("💾 保存前的词典列表:", dictionaries.value);
  await saveDictionaries(dictionaries.value);
  console.log("💾 保存完成");
  dictModal.value?.close();
};

/**
 * 危险删除二次确认。
 */
const confirmDangerousDelete = async (targetName: string): Promise<boolean> => {
  const firstConfirm = await openConfirm("危险操作确认", `确定要删除${targetName}吗？`);
  if (!firstConfirm) return false;
  return openConfirm("再次确认", `删除后将无法恢复，请再次确认删除${targetName}`);
};

const handleDeleteDict = async (id: string) => {
  if (!(await confirmDangerousDelete("该词典"))) return;
  dictionaries.value = dictionaries.value.filter((d) => d.id !== id);
  await saveDictionaries(dictionaries.value);
};

const openCatModal = (row?: Category) => {
  isEditCat.value = !!row;
  catForm.value = row ? { ...row } : { name: "" };
  catModal.value?.showModal();
};

const saveCat = async () => {
  if (!catForm.value.name || !selectedDict.value) return;
  if (isEditCat.value) {
    const idx = allCategories.value.findIndex((c) => c.id === catForm.value.id);
    if (idx !== -1)
      allCategories.value[idx] = {
        ...allCategories.value[idx],
        ...catForm.value,
      } as Category;
  } else {
    const newCat = {
      id: "cat_" + Date.now(),
      name: catForm.value.name!,
      promptNum: 0,
      createdAt: Date.now(),
    };
    allCategories.value.push(newCat);
    selectedDict.value.categoryIds.push(newCat.id);
    selectedDict.value.categoryNum = selectedDict.value.categoryIds.length;
  }
  await Promise.all([
    saveCategories(allCategories.value),
    saveDictionaries(dictionaries.value),
  ]);
  catModal.value?.close();
};

const handleDeleteCat = async (catId: string) => {
  if (!selectedDict.value || !(await confirmDangerousDelete("该分类"))) return;
  allCategories.value = allCategories.value.filter((c) => c.id !== catId);
  selectedDict.value.categoryIds = selectedDict.value.categoryIds.filter(
    (id) => id !== catId,
  );
  selectedDict.value.categoryNum = selectedDict.value.categoryIds.length;
  await Promise.all([
    saveCategories(allCategories.value),
    saveDictionaries(dictionaries.value),
  ]);
};
</script>
