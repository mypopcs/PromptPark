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
                  <span
                    :class="{
                      'text-primary font-bold':
                        sortKey === col.key && sortOrder === 'asc',
                    }"
                    >▲</span
                  >
                  <span
                    :class="{
                      'text-primary font-bold':
                        sortKey === col.key && sortOrder === 'desc',
                    }"
                    >▼</span
                  >
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-12 h-12 opacity-20"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                  />
                </svg>
                <span>暂无数据</span>
              </div>
            </td>
          </tr>

          <template v-else>
            <tr v-for="(row, index) in data" :key="index" class="hover">
              <td v-for="col in columns" :key="String(col.key)">
                <slot
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
        <button
          class="join-item btn btn-sm"
          :disabled="currentPage === 1 || loading"
          @click="changePage(currentPage - 1)"
        >
          <<
        </button>
        <button class="join-item btn btn-sm no-animation pointer-events-none">
          {{ currentPage }}
        </button>
        <button
          class="join-item btn btn-sm"
          :disabled="currentPage * pageSize >= total || loading"
          @click="changePage(currentPage + 1)"
        >
          >>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
// 注意上面这一行！ generic="T" 是 Vue 3.3+ 的泛型支持
import { ref } from "vue";

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
  }>(),
  {
    loading: false,
    total: 0,
    currentPage: 1,
    pageSize: 10,
  },
);

// 定义向外抛出的事件 (排序、翻页)
const emit = defineEmits<{
  (e: "update:currentPage", page: number): void;
  (e: "sort", key: keyof T, order: "asc" | "desc" | null): void;
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
