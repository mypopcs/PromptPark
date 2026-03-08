<template>
  <div class="space-y-6 h-full flex flex-col animate-fade-in">
    <div class="flex items-center justify-between shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-base-content">标签管理</h1>
        <p class="text-sm text-base-content/70 mt-1">
          管理系统中的所有标签，标签颜色将由系统自动生成绝美莫兰迪色
        </p>
      </div>
      <Button @click="openModal">
        <i class="ri-add-line text-lg"></i>
        新建标签
      </Button>
    </div>

    <div class="flex-1 overflow-hidden">
      <DataTable
        :value="tableData"
        :loading="isLoading"
        tableStyle="min-width: 50rem"
        class="w-full"
      >
        <Column field="name" header="标签名称" style="width: 40%">
          <template #body="{ data }">
            <Tag
              :value="data.name"
              :style="{
                backgroundColor: data.color,
                color: getTextColor(data.color),
              }"
            />
          </template>
        </Column>
        <Column
          field="promptCount"
          header="关联提示词数量"
          style="width: 30%"
        ></Column>
        <Column header="操作" style="width: 30%">
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

    <Dialog
      v-model:visible="isModalOpen"
      :header="modalMode === 'create' ? '新建标签' : '编辑标签'"
      :style="{ width: '450px' }"
      :modal="true"
    >
      <div class="space-y-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">
            标签名称 <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model.trim="formData.name"
            placeholder="请输入标签名称"
            @keydown.enter="saveData"
          />
          <small class="text-xs text-base-content/50">
            标签可用于为提示词的自定义分组，例如：AI漫剧常用，公司项目等
          </small>
        </div>
      </div>
      <template #footer>
        <Button text severity="secondary" @click="isModalOpen = false"
          >取消</Button
        >
        <Button @click="saveData">提交</Button>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useConfirm } from "primevue/useconfirm";
import { useMessage } from "@/composables/useMessage";
import type { TagItem, PromptItem } from "@/types";
import { localStore } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config";
import { createDefaultTag } from "@/utils/factories";

const confirm = useConfirm();
const { success, warning } = useMessage();

const tableData = ref<TagItem[]>([]);
const isLoading = ref(false);
const isModalOpen = ref(false);
const modalMode = ref<"create" | "edit">("create");
const editingId = ref<string>("");

const formData = ref<TagItem>(createDefaultTag());

const getTextColor = (bgColor: string): string => {
  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#1f2937" : "#ffffff";
};

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

const handleDelete = (row: TagItem) => {
  confirm.require({
    message: `确定删除标签 "${row.name}" 吗？`,
    header: "警告",
    icon: "ri-error-warning-line",
    rejectLabel: "取消",
    acceptLabel: "确定",
    acceptClass: "p-button-danger",
    accept: async () => {
      const newList = tableData.value.filter((item) => item.id !== row.id);
      await localStore.set(STORAGE_KEYS.TAGS, newList);
      success("删除成功");
      await loadData();
    },
  });
};

onMounted(() => loadData());
</script>
