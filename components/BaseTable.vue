<template>
  <div class="flex flex-col gap-4 w-full">
    <div class="overflow-x-auto bg-base-100 rounded-box border border-base-200">
      <table class="table table-zebra w-full">
        <thead class="bg-base-200/50 text-xs">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="{ 'cursor-pointer hover:bg-base-200': col.sortable }"
              @click="col.sortable ? handleSort(col.key) : undefined"
            >
              <div class="flex items-center gap-1">
                <span>{{ col.title }}</span>
                <span v-if="col.sortable" class="text-[10px] opacity-50">
                  {{
                    currentSort.key === col.key
                      ? currentSort.order === "asc"
                        ? "▲"
                        : "▼"
                      : "↕"
                  }}
                </span>
              </div>
            </th>
            <th v-if="$slots.actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td
              :colspan="columns.length + ($slots.actions ? 1 : 0)"
              class="text-center py-8 opacity-60"
            >
              <span class="loading loading-spinner loading-sm mr-2"></span>
              数据加载中...
            </td>
          </tr>
          <tr v-else-if="data.length === 0">
            <td
              :colspan="columns.length + ($slots.actions ? 1 : 0)"
              class="text-center py-8 opacity-40"
            >
              暂无数据
            </td>
          </tr>
          <tr v-for="(row, index) in data" v-else :key="index" class="hover">
            <td v-for="col in columns" :key="col.key">
              <slot :name="`cell-${col.key}`" :row="row">
                {{ formatCellValue(row[col.key]) }}
              </slot>
            </td>
            <td v-if="$slots.actions">
              <slot name="actions" :row="row"></slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between px-2 text-xs opacity-70">
      <div>共 <span class="font-bold">{{ total }}</span> 条记录</div>
      <div v-if="totalPages > 1" class="join">
        <button
          class="join-item btn btn-xs"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          上一页
        </button>
        <button
          v-for="page in totalPages"
          :key="page"
          class="join-item btn btn-xs"
          :class="{ 'btn-active btn-primary': page === currentPage }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
        <button
          class="join-item btn btn-xs"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";

/** 表格单行数据结构 */
/**
 * 表格行数据采用动态字段结构。
 * 这里使用 any 的原因：
 * 1. 该基础表格需要兼容多个业务模块（词典/提示词/标签）不同列结构；
 * 2. Vue 模板插槽推断会把 row 透传到各业务页，使用 unknown 会导致现有调用点大量类型报错。
 * 后续可在业务组件中通过泛型封装进一步收敛类型。
 */
type RowRecord = any;

/** 表头配置 */
interface BaseTableColumn {
  /** 字段键名 */
  key: string;
  /** 表头展示文本 */
  title: string;
  /** 是否允许排序 */
  sortable?: boolean;
}

/** 排序方向 */
type SortOrder = "asc" | "desc";

const props = withDefaults(
  defineProps<{
    /** 表头配置 */
    columns: BaseTableColumn[];
    /**
     * 表格数据。
     * 说明：这里使用 any[] 是为了兼容当前多业务模块插槽透传（Dictionary/Prompt/Tag 等）
     * 的异构字段，避免在重构中引入大规模调用点断裂。
     */
    data: any[];
    /** 总记录数 */
    total: number;
    /** 当前页码 */
    currentPage: number;
    /** 每页条数 */
    pageSize: number;
    /** 加载状态 */
    loading?: boolean;
  }>(),
  {
    loading: false,
  },
);

const emit = defineEmits<{
  /** 页码切换 */
  "update:currentPage": [page: number];
  /** 排序变更 */
  "sort-change": [key: string, order: SortOrder];
}>();

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.total / Math.max(1, props.pageSize))),
);

const currentSort = reactive<{ key: string | null; order: SortOrder }>({
  key: null,
  order: "asc",
});

/**
 * 处理排序事件。
 */
const handleSort = (key: string): void => {
  currentSort.order =
    currentSort.key === key && currentSort.order === "asc" ? "desc" : "asc";
  currentSort.key = key;
  emit("sort-change", key, currentSort.order);
};

/**
 * 处理分页切换事件。
 */
const changePage = (page: number): void => {
  if (page >= 1 && page <= totalPages.value) {
    emit("update:currentPage", page);
  }
};

/**
 * 将单元格值转换为可展示文案。
 */
const formatCellValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "--";
  }
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return JSON.stringify(value);
};
</script>
