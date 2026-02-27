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
              @click="col.sortable ? handleSort(col.key) : null"
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
          <tr v-if="data.length === 0">
            <td
              :colspan="columns.length + ($slots.actions ? 1 : 0)"
              class="text-center py-8 opacity-40"
            >
              暂无数据
            </td>
          </tr>
          <tr v-for="(row, index) in data" :key="index" class="hover">
            <td v-for="col in columns" :key="col.key">
              <slot :name="`cell-${col.key}`" :row="row">{{
                row[col.key]
              }}</slot>
            </td>
            <td v-if="$slots.actions">
              <slot name="actions" :row="row"></slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex items-center justify-between px-2 text-xs opacity-70">
      <div>
        共 <span class="font-bold">{{ total }}</span> 条记录
      </div>
      <div v-if="totalPages > 1" class="join">
        <button
          class="join-item btn btn-xs"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          «
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
          »
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";

const props = defineProps<{
  columns: any[];
  data: any[];
  total: number;
  currentPage: number;
  pageSize: number;
}>();
const emit = defineEmits(["update:currentPage", "sort-change"]);
const totalPages = computed(() => Math.ceil(props.total / props.pageSize));
const currentSort = reactive({ key: null, order: "asc" });

const handleSort = (key: any) => {
  currentSort.order =
    currentSort.key === key && currentSort.order === "asc" ? "desc" : "asc";
  currentSort.key = key;
  emit("sort-change", key, currentSort.order);
};
const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) emit("update:currentPage", page);
};
</script>
