<template>
  <div class="fixed inset-y-0 right-0 z-[999999] flex pointer-events-none">
    <div
      class="w-[400px] h-full bg-base-100 shadow-2xl border-l border-base-300 pointer-events-auto transition-transform duration-300 transform"
      :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="flex flex-col h-full p-4 gap-4">
        <header class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-bold">✨ PromptPark</h2>
            <button class="btn btn-ghost btn-xs" @click="isOpen = false">
              关闭
            </button>
          </div>
          <select
            v-model="currentLibId"
            class="select select-bordered select-sm w-full"
          >
            <option v-for="lib in dictionaries" :key="lib.id" :value="lib.id">
              {{ lib.name }}
            </option>
          </select>
        </header>

        <div class="tabs tabs-boxed bg-base-200">
          <a
            v-for="catId in currentLibCategoryIds"
            :key="catId"
            class="tab tab-sm"
            :class="{ 'tab-active': activeCatId === catId }"
            @click="activeCatId = catId"
          >
            {{ getCatName(catId) }}
          </a>
        </div>

        <div class="flex-1 overflow-y-auto pr-1 custom-scrollbar">
          <div class="grid grid-cols-3 gap-2 relative">
            <div
              v-for="prompt in filteredPrompts"
              :key="prompt.id"
              class="relative h-16 group cursor-pointer rounded-lg overflow-visible bg-base-300"
              @click="toggleSelect(prompt)"
            >
              <div
                class="absolute inset-0 flex items-center justify-center p-1 rounded-lg overflow-hidden"
              >
                <img
                  v-if="prompt.imageUrl"
                  :src="prompt.imageUrl"
                  class="absolute inset-0 w-full h-full object-cover opacity-30"
                />
                <div
                  class="relative z-10 text-[10px] font-bold text-center leading-tight line-clamp-2"
                >
                  {{ prompt.chinese }}<br /><span
                    class="font-normal opacity-60"
                    >{{ prompt.text }}</span
                  >
                </div>
              </div>

              <div
                class="absolute top-0 left-0 w-full min-h-[160px] bg-base-100 shadow-2xl border border-primary/40 rounded-lg z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 p-2 pointer-events-none"
              >
                <img
                  v-if="prompt.imageUrl"
                  :src="prompt.imageUrl"
                  class="absolute inset-0 w-full h-full object-cover opacity-20 rounded-lg"
                />
                <div class="relative z-10 flex flex-col gap-1">
                  <div class="text-xs font-bold text-primary">
                    {{ prompt.chinese }}
                  </div>
                  <div class="text-[10px] leading-relaxed italic">
                    {{ prompt.text }}
                  </div>
                  <div class="mt-2 flex flex-wrap gap-1">
                    <span
                      v-for="tId in prompt.tagIds"
                      :key="tId"
                      class="badge badge-ghost badge-xs"
                      >{{ getTagName(tId) }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-base-200 p-3 rounded-xl border border-base-300 space-y-3"
        >
          <div
            class="flex flex-wrap gap-2 min-h-[60px] max-h-[120px] overflow-y-auto p-2 bg-base-100 rounded-lg border border-inner"
          >
            <div
              v-for="(item, idx) in selectedItems"
              :key="idx"
              class="badge badge-primary gap-1 py-3"
            >
              {{ item.text }}
              <span
                class="cursor-pointer hover:text-error"
                @click.stop="removeItem(idx)"
                >✕</span
              >
            </div>
            <input
              v-model="tempInput"
              type="text"
              placeholder="手动输入..."
              class="bg-transparent text-xs outline-none w-24"
              @keyup.enter="addTempItem"
            />
          </div>
          <button
            class="btn btn-primary btn-block btn-sm"
            @click="copyCombinedPrompt"
          >
            一键复制组合词
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="!isOpen"
      class="fixed right-0 top-1/2 -translate-y-1/2 pointer-events-auto"
    >
      <button
        class="btn btn-primary btn-circle shadow-lg"
        @click="isOpen = true"
      >
        🚀
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  getDictionaries,
  getCategories,
  getPrompts,
  getTags,
} from "@/utils/storage";
import type { Prompt, Dictionary, Category, PromptTag } from "@/types";

/** 数据加载 **/
const isOpen = ref(false);
const dictionaries = ref<Dictionary[]>([]);
const categories = ref<Category[]>([]);
const allPrompts = ref<Prompt[]>([]);
const allTags = ref<PromptTag[]>([]);

const currentLibId = ref("");
const activeCatId = ref("");
const tempInput = ref("");
const selectedItems = ref<{ text: string; type: "db" | "temp" }[]>([]);

onMounted(async () => {
  console.log("🎯 Drawer 组件挂载，开始获取数据");
  try {
    const [dics, cats, pts, tags] = await Promise.all([
      getDictionaries(),
      getCategories(),
      getPrompts(),
      getTags(),
    ]);
    console.log("🎯 获取到的词典数据:", dics);
    console.log("🎯 获取到的分类数据:", cats);
    console.log("🎯 获取到的提示词数据:", pts);
    console.log("🎯 获取到的标签数据:", tags);
    dictionaries.value = dics;
    categories.value = cats;
    allPrompts.value = pts;
    allTags.value = tags;
    if (dics.length > 0) {
      const firstDictionary = dics[0];
      if (firstDictionary) {
        currentLibId.value = firstDictionary.id;
      }
    }
    console.log("🎯 数据加载完成，当前词典ID:", currentLibId.value);
  } catch (error) {
    console.error("🎯 数据加载失败:", error);
  }
});

/** 联动逻辑 **/
const currentLibCategoryIds = computed(() => {
  const lib = dictionaries.value.find((l) => l.id === currentLibId.value);
  const ids = lib?.categoryIds || [];
  if (ids.length > 0 && !activeCatId.value) {
    const firstCategoryId = ids[0];
    if (firstCategoryId) {
      activeCatId.value = firstCategoryId;
    }
  }
  return ids;
});

const filteredPrompts = computed(() => {
  console.log(
    "🎯 filteredPrompts 计算 - 活动分类ID:",
    activeCatId.value,
    "提示词总数:",
    allPrompts.value.length,
  );
  const result = allPrompts.value.filter(
    (p) => p.categoryId === activeCatId.value,
  );
  console.log("🎯 filteredPrompts 结果:", result);
  return result;
});

/** 交互逻辑 **/
const toggleSelect = (p: Prompt) => {
  selectedItems.value.push({ text: p.text, type: "db" });
};

const addTempItem = () => {
  if (!tempInput.value.trim()) return;
  selectedItems.value.push({ text: tempInput.value.trim(), type: "temp" });
  tempInput.value = "";
};

const removeItem = (index: number) => {
  selectedItems.value.splice(index, 1);
};

const copyCombinedPrompt = () => {
  const combined = selectedItems.value.map((i) => i.text).join(", ");
  navigator.clipboard.writeText(combined);
  // 可接入 toast 提示
};

const getCatName = (id: string) =>
  categories.value.find((c) => c.id === id)?.name || "未命名";
const getTagName = (id: string) =>
  allTags.value.find((t) => t.id === id)?.name || "";
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: oklch(var(--p));
  border-radius: 10px;
}
</style>
