<template>
  <div
    class="w-full bg-base-100 rounded-box shadow-sm border border-base-200 overflow-hidden flex flex-col h-full"
  >
    <div class="overflow-x-auto flex-1">
      <table class="table table-zebra w-full">
        <thead class="bg-base-200/50 text-base-content sticky top-0 z-10">
          <tr>
            <th
              v-for="col in columns"
              :key="String(col.key)"
              :style="{ width: col.width }"
              :class="{
                'cursor-pointer hover:bg-base-300 transition-colors':
                  col.sortable,
              }"
              @click="col.sortable && handleSort(col.key)"
            >
              <div class="flex items-center gap-1">
                {{ col.label }}
                <span
                  v-if="col.sortable"
                  class="flex flex-col text-[10px] leading-none opacity-50"
                  :class="{ 'opacity-100 text-primary': sortKey === col.key }"
                >
                  <i
                    class="ri-arrow-up-s-fill"
                    :class="{
                      'text-primary font-bold':
                        sortKey === col.key && sortOrder === 'asc',
                    }"
                  ></i>
                  <i
                    class="ri-arrow-down-s-fill -mt-2"
                    :class="{
                      'text-primary font-bold':
                        sortKey === col.key && sortOrder === 'desc',
                    }"
                  ></i>
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length" class="text-center py-10">
              <span
                class="loading loading-spinner loading-md text-primary"
              ></span>
            </td>
          </tr>

          <tr v-else-if="!data || data.length === 0">
            <td
              :colspan="columns.length"
              class="text-center py-16 text-base-content/50"
            >
              <div class="flex flex-col items-center gap-2">
                <i class="ri-archive-box-line text-5xl opacity-20"></i>
                <span>暂无数据</span>
              </div>
            </td>
          </tr>

          <template v-else>
            <tr v-for="(row, index) in data" :key="index" class="hover">
              <td v-for="col in columns" :key="String(col.key)">
                <!-- 操作列内置渲染 -->
                <template v-if="col.key === 'actions' && showActions">
                  <div class="flex gap-2">
                    <BaseButton
                      variant="primary"
                      size="sm"
                      type="ghost"
                      @click="$emit('edit', row)"
                    >
                      编辑
                    </BaseButton>
                    <BaseButton
                      variant="error"
                      size="sm"
                      type="ghost"
                      @click="$emit('delete', row)"
                    >
                      删除
                    </BaseButton>
                  </div>
                </template>
                <!-- 自定义列插槽 -->
                <slot
                  v-else
                  :name="`cell-${String(col.key)}`"
                  :row="row"
                  :index="index"
                >
                  {{ row[col.key as keyof T] }}
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div
      v-if="total > 0"
      class="flex items-center justify-between p-4 border-t border-base-200 bg-base-100 shrink-0"
    >
      <span class="text-sm text-base-content/70">
        共 <strong class="text-base-content">{{ total }}</strong> 条记录
      </span>
      <div class="join">
        <BaseButton
          variant="default"
          size="sm"
          type="ghost"
          shape="square"
          @click="changePage(currentPage - 1)"
        >
          <i class="ri-arrow-left-s-line"></i>
        </BaseButton>
        <BaseButton variant="default" size="sm" type="ghost" shape="square">
          {{ currentPage }}
        </BaseButton>
        <BaseButton
          variant="default"
          size="sm"
          type="ghost"
          shape="square"
          @click="changePage(currentPage + 1)"
        >
          <i class="ri-arrow-right-s-line"></i>
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
// 注意上面这一行！ generic="T" 是 Vue 3.3+ 的泛型支持
import { ref } from "vue";
import BaseButton from "./BaseButton.vue";
import BaseTag from "./BaseTag.vue";

// 严格定义列的类型：key 只能是 T 包含的属性，或者是特殊的 'actions' 列
export interface TableColumn<T> {
  key: keyof T | "actions";
  label: string;
  width?: string;
  sortable?: boolean;
}

// 定义 Props (接收外部传入的配置和数据)
const props = withDefaults(
  defineProps<{
    columns: TableColumn<T>[];
    data: T[];
    loading?: boolean;
    total?: number;
    currentPage?: number;
    pageSize?: number;
    showActions?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
  }>(),
  {
    loading: false,
    total: 0,
    currentPage: 1,
    pageSize: 10,
    showActions: false,
    showEdit: true,
    showDelete: true,
  },
);

// 定义向外抛出的事件 (排序、翻页、操作)
const emit = defineEmits<{
  (e: "update:currentPage", page: number): void;
  (e: "sort", key: keyof T, order: "asc" | "desc" | null): void;
  (e: "edit", row: T): void;
  (e: "delete", row: T): void;
}>();

// 内部排序状态
const sortKey = ref<keyof T | "actions" | null>(null);
const sortOrder = ref<"asc" | "desc" | null>(null);

const handleSort = (key: keyof T | "actions") => {
  if (key === "actions") return; // 操作列不可排序

  if (sortKey.value === key) {
    // 状态轮转: asc -> desc -> null
    if (sortOrder.value === "asc") sortOrder.value = "desc";
    else if (sortOrder.value === "desc") {
      sortOrder.value = null;
      sortKey.value = null;
    }
  } else {
    sortKey.value = key;
    sortOrder.value = "asc";
  }
  emit("sort", key as keyof T, sortOrder.value);
};

const changePage = (newPage: number) => {
  emit("update:currentPage", newPage);
};
</script>
