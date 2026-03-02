<template>
  <div class="prompt-park-drawer-wrapper">
    <div
      v-show="!isOpen"
      @click="isOpen = true"
      class="fixed right-0 top-1/2 -translate-y-1/2 bg-primary text-primary-content rounded-l-sm cursor-pointer z-[99] shadow-[-4px_0_15px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-300 ease-in-out hover:px-4 select-none"
    >
      <div class="relative h-[28px] w-full px-2">
        <div class="animate-slide-up">
          <p
            class="text-xs font-black h-[28px] flex items-center justify-center"
          >
            Prompt Park
          </p>
          <p
            class="text-xs font-black h-[28px] flex items-center justify-center"
          >
            Ctrl+Shift+Z
          </p>
        </div>
      </div>
    </div>

    <Transition name="drawer-physic">
      <div
        v-if="isOpen"
        class="fixed right-0 top-0 h-screen w-[560px] bg-base-100 shadow-[-20px_0_60px_rgba(0,0,0,0.2)] z-[999999] border-l border-base-200 flex flex-col overflow-hidden"
      >
        <header
          class="p-4 flex items-center justify-between bg-base-100 border-b border-base-200 shrink-0"
        >
          <div class="flex flex-col w-[160px]">
            <BaseSelect
              label="选择词典"
              v-model="selectedDictId"
              :options="dictionaryOptions"
            />
          </div>
          <button
            class="btn btn-sm btn-circle btn-ghost"
            @click="isOpen = false"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>

        <section class="p-4 bg-base-200/30 shrink-0">
          <div
            class="bg-base-100 border border-base-300 rounded-sm p-3 shadow-inner min-h-[140px] flex flex-col"
          >
            <div
              class="flex-1 flex flex-wrap gap-2 content-start overflow-y-auto max-h-[240px] no-scrollbar"
            >
              <TransitionGroup name="tag-pop">
                <span
                  v-for="item in combinationList"
                  :key="item.id"
                  class="badge badge-primary py-3 px-3 gap-2 font-medium shadow-sm hover:scale-105 transition-transform"
                >
                  {{ item.text }}
                  <span
                    class="cursor-pointer opacity-60 hover:opacity-100"
                    @click="removeFromCombo(item.id)"
                    >✕</span
                  >
                </span>
              </TransitionGroup>
              <input
                v-model="manualInput"
                @keyup.enter="addManualToken"
                class="bg-transparent border-none outline-none text-xs flex-1 min-w-[80px] h-10"
                placeholder="输入或选择提示词..."
              />
            </div>
            <div class="grid grid-cols-6 gap-2">
              <button
                class="btn btn-primary shadow-sm btn-sm col-span-5"
                @click="copyAll"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-3.5 h-3.5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
                复制组合
              </button>
              <button
                class="btn btn-sm btn-square btn-ghost"
                @click="combinationList = []"
                title="清空全部"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4 opacity-40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </section>

        <nav
          class="shrink-0 bg-base-100 border-b border-base-200 sticky top-0 z-20"
        >
          <div class="px-4 pt-4 pb-2">
            <div class="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                v-model="searchQuery"
                class="input input-base input-bordered w-full pl-9 rounded-sm bg-base-200/50"
                placeholder="搜索提示词..."
              />
            </div>
          </div>
          <div class="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-3">
            <button
              @click="selectedCatId = 'all'"
              class="btn btn-sm rounded-sm whitespace-nowrap px-4 border-none"
              :class="
                selectedCatId === 'all'
                  ? 'btn-primary'
                  : 'bg-base-200 text-base-content/60 hover:bg-base-300'
              "
            >
              全部
            </button>
            <button
              v-for="cat in currentCategories"
              :key="cat.id"
              @click="selectedCatId = cat.id"
              class="btn btn-sm rounded-sm whitespace-nowrap px-4 border-none"
              :class="
                selectedCatId === cat.id
                  ? 'btn-primary'
                  : 'bg-base-200 text-base-content/60 hover:bg-base-300'
              "
            >
              {{ cat.name }}
            </button>
          </div>
        </nav>

        <main class="p-4 grid grid-cols-3 gap-3 relative h-16">
          <div
            v-if="filteredPrompts.length === 0"
            class="col-span-2 py-20 text-center opacity-20 flex flex-col items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-12 h-12 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1"
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
              />
            </svg>
            <span class="text-xs font-bold uppercase tracking-widest"
              >请先添加提示词</span
            >
          </div>

          <PromptCard
            v-for="p in filteredPrompts"
            :key="p.id"
            :prompt="p"
            :category-name="getCatName(p.categoryId)"
            @click="addSelectedPrompt"
          />
        </main>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { localStore } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config";
import { useMessage } from "@/composables/useMessage";
import type {
  PromptItem,
  DictionaryItem,
  CategoryItem,
  TagItem,
} from "@/types";
import BaseSelect from "@/components/ui/BaseSelect.vue";
import PromptCard from "@/components/ui/PromptCard.vue";

const { success, error } = useMessage();

const isOpen = ref(false);
const dictionaries = ref<DictionaryItem[]>([]);
const allCategories = ref<CategoryItem[]>([]);
const allPrompts = ref<PromptItem[]>([]);
const tagList = ref<TagItem[]>([]);

const selectedDictId = ref("");
const selectedCatId = ref("all");
const searchQuery = ref("");
const combinationList = ref<{ id: string; text: string }[]>([]);
const manualInput = ref("");

const dictionaryOptions = computed(() =>
  dictionaries.value.map((dict) => ({ value: dict.id, label: dict.name })),
);

const currentCategories = computed(() => {
  if (!Array.isArray(allCategories.value)) return [];
  return allCategories.value.filter(
    (c) => c.dictionaryId === selectedDictId.value,
  );
});

const filteredPrompts = computed(() => {
  if (!Array.isArray(allPrompts.value) || !selectedDictId.value) return [];

  let list = allPrompts.value.filter(
    (p) => p.dictionaryId === selectedDictId.value,
  );

  if (selectedCatId.value !== "all") {
    list = list.filter((p) => p.categoryId === selectedCatId.value);
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (p) =>
        (p.prompt || "").toLowerCase().includes(q) ||
        (p.translation || "").toLowerCase().includes(q),
    );
  }

  return list;
});

const getCatName = (categoryId: string) => {
  const category = allCategories.value.find((c) => c.id === categoryId);
  return category?.name || "未分类";
};

const ensureArray = <T,>(
  data: T[] | Record<string, T> | null | undefined,
): T[] => {
  if (!data) return [];
  return Array.isArray(data) ? data : Object.values(data);
};

const loadData = async () => {
  try {
    const [d, c, p, t] = await Promise.all([
      localStore.get<DictionaryItem[]>(STORAGE_KEYS.DICTIONARIES, []),
      localStore.get<CategoryItem[]>(STORAGE_KEYS.CATEGORIES, []),
      localStore.get<PromptItem[]>(STORAGE_KEYS.PROMPTS, []),
      localStore.get<TagItem[]>(STORAGE_KEYS.TAGS, []),
    ]);

    dictionaries.value = ensureArray(d);
    allCategories.value = ensureArray(c);
    allPrompts.value = ensureArray(p);
    tagList.value = ensureArray(t);

    if (!selectedDictId.value && dictionaries.value.length > 0) {
      selectedDictId.value = dictionaries.value[0].id;
    }
  } catch (err) {
    console.error("Drawer Load Fail:", err);
  }
};

const addSelectedPrompt = (p: PromptItem) => {
  if (!combinationList.value.find((i) => i.id === p.id)) {
    combinationList.value.push({ id: p.id, text: p.prompt });
  }
};

const addManualToken = () => {
  if (manualInput.value.trim()) {
    combinationList.value.push({
      id: `manual-${Date.now()}`,
      text: manualInput.value.trim(),
    });
    manualInput.value = "";
  }
};

const removeFromCombo = (id: string) => {
  combinationList.value = combinationList.value.filter((i) => i.id !== id);
};

const copyAll = async () => {
  if (combinationList.value.length === 0) return;
  const text = combinationList.value.map((i) => i.text).join(", ");
  try {
    await navigator.clipboard.writeText(text);
    success("组合 Prompt 已复制到剪贴板");
  } catch (err) {
    error("复制失败");
  }
};

watch(selectedDictId, () => {
  selectedCatId.value = "all";
});

onMounted(() => {
  loadData();

  chrome.storage.onChanged.addListener((changes) => {
    if (changes[STORAGE_KEYS.PROMPTS] || changes[STORAGE_KEYS.DICTIONARIES]) {
      loadData();
    }
  });

  window.addEventListener("promptpark:toggle-drawer", () => {
    isOpen.value = !isOpen.value;
  });
});
</script>

<style scoped>
@keyframes slideUp {
  0%,
  45% {
    transform: translateY(0);
  }
  50%,
  95% {
    transform: translateY(-50%);
  }
  100% {
    transform: translateY(0);
  }
}
.animate-slide-up {
  animation: slideUp 4s infinite ease-in-out;
}
.drawer-physic-enter-active,
.drawer-physic-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-physic-enter-from,
.drawer-physic-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
.tag-pop-enter-active {
  animation: pop-up 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes pop-up {
  from {
    opacity: 0;
    transform: scale(0.5) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
