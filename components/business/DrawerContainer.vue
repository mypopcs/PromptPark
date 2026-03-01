<template>
  <div class="prompt-park-drawer-wrapper">
    <div
      v-show="!isOpen"
      @click="isOpen = true"
      class="fixed right-0 top-1/2 -translate-y-1/2 w-8 h-32 bg-primary text-primary-content rounded-l-2xl flex items-center justify-center cursor-pointer z-[999999] shadow-[-4px_0_15px_rgba(0,0,0,0.2)] hover:w-10 transition-all duration-500 group"
    >
      <div class="flex flex-col items-center gap-3">
        <div class="w-1.5 h-1.5 rounded-full bg-current animate-ping"></div>
        <span
          class="text-[10px] [writing-mode:vertical-lr] font-black tracking-widest uppercase opacity-80 group-hover:opacity-100"
          >PromptPark</span
        >
      </div>
    </div>

    <Transition name="drawer-physic">
      <div
        v-if="isOpen"
        class="fixed right-0 top-0 h-screen w-85 bg-base-100 shadow-[-20px_0_60px_rgba(0,0,0,0.2)] z-[999999] border-l border-base-200 flex flex-col overflow-hidden"
      >
        <header
          class="p-4 flex items-center justify-between bg-base-100 border-b border-base-200 shrink-0"
        >
          <div class="flex flex-col">
            <span
              class="text-[10px] uppercase font-black text-primary/60 tracking-tighter"
              >Library</span
            >
            <select
              v-model="selectedDictId"
              class="select select-ghost select-sm p-0 h-auto text-base font-bold min-h-0 focus:bg-transparent"
            >
              <option
                v-for="dict in dictionaries"
                :key="dict.id"
                :value="dict.id"
              >
                {{ dict.name }}
              </option>
              <option v-if="dictionaries.length === 0" disabled>
                请先创建词典
              </option>
            </select>
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
            class="bg-base-100 border border-base-300 rounded-2xl p-3 shadow-inner min-h-[120px] flex flex-col"
          >
            <div
              class="flex-1 flex flex-wrap gap-2 content-start overflow-y-auto max-h-[160px] no-scrollbar"
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
                class="bg-transparent border-none outline-none text-xs flex-1 min-w-[80px] h-6"
                placeholder="键入自定义词汇..."
              />
            </div>
            <div class="mt-4 flex gap-2">
              <button
                class="btn btn-primary btn-sm flex-1 rounded-xl shadow-lg shadow-primary/20"
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
                复制组合 ({{ combinationList.length }})
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
                class="input input-sm input-bordered w-full pl-9 rounded-xl bg-base-200/50"
                placeholder="搜索关键词..."
              />
            </div>
          </div>
          <div class="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-3">
            <button
              @click="selectedCatId = 'all'"
              class="btn btn-xs rounded-lg whitespace-nowrap px-4 border-none"
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
              class="btn btn-xs rounded-lg whitespace-nowrap px-4 border-none"
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

        <main
          class="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 bg-base-100 relative"
        >
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
              >No Prompts Found</span
            >
          </div>

          <div
            v-for="p in filteredPrompts"
            :key="p.id"
            @click="addSelectedPrompt(p)"
            @mouseenter="showHoverCard($event, p)"
            @mouseleave="hideHoverCard"
            class="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all duration-300 shadow-sm bg-base-300"
          >
            <img
              v-if="p.thumbnail"
              :src="p.thumbnail"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-2 transition-opacity group-hover:opacity-0"
            >
              <p class="text-[10px] font-bold text-white truncate">
                {{ p.prompt }}
              </p>
              <p class="text-[8px] text-white/50 truncate">
                {{ p.translation }}
              </p>
            </div>
          </div>
        </main>
      </div>
    </Transition>

    <Teleport to="body">
      <Transition name="preview-pop">
        <div
          v-if="preview.visible"
          class="fixed z-[2147483647] pointer-events-none"
          :style="previewStyle"
        >
          <div
            class="w-64 rounded-2xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)] border border-white/10 bg-neutral flex flex-col animate-in zoom-in-90 duration-200"
          >
            <div class="h-40 w-full overflow-hidden bg-base-300">
              <img
                v-if="preview.data?.thumbnail"
                :src="preview.data?.thumbnail"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="p-4 bg-gradient-to-b from-neutral to-base-300">
              <h3 class="text-white font-black text-sm leading-tight mb-2">
                {{ preview.data?.prompt }}
              </h3>
              <p
                class="text-white/60 text-[11px] line-clamp-4 leading-relaxed italic"
              >
                {{ preview.data?.translation }}
              </p>
              <div class="mt-4 flex flex-wrap gap-1">
                <span
                  v-for="tagName in preview.tags"
                  :key="tagName"
                  class="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[9px] font-bold"
                >
                  #{{ tagName }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from "vue";
import { localStore } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config";
import { useMessage } from "@/composables/useMessage";
import type {
  PromptItem,
  DictionaryItem,
  CategoryItem,
  TagItem,
} from "@/types";

const { success, error } = useMessage();

// 1. 状态控制与数据源 (强制初始化为数组)
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

// 2. 物理预览状态
const preview = reactive({
  visible: false,
  data: null as PromptItem | null,
  tags: [] as string[],
  pos: { x: 0, y: 0 },
});

const previewStyle = computed(() => ({
  left: `${preview.pos.x - 280}px`, // 弹出在卡片左侧
  top: `${preview.pos.y - 120}px`,
}));

// --- 数据同步逻辑 ---
const loadData = async () => {
  try {
    const [d, c, p, t] = await Promise.all([
      localStore.get<DictionaryItem[]>(STORAGE_KEYS.DICTIONARIES, []),
      localStore.get<CategoryItem[]>(STORAGE_KEYS.CATEGORIES, []),
      localStore.get<PromptItem[]>(STORAGE_KEYS.PROMPTS, []),
      localStore.get<TagItem[]>(STORAGE_KEYS.TAGS, []),
    ]);

    // 🌟 强力纠错：确保全是纯数组
    dictionaries.value = Array.isArray(d) ? d : Object.values(d || {});
    allCategories.value = Array.isArray(c) ? c : Object.values(c || {});
    allPrompts.value = Array.isArray(p) ? p : Object.values(p || {});
    tagList.value = Array.isArray(t) ? t : Object.values(t || {});

    if (!selectedDictId.value && dictionaries.value.length > 0) {
      selectedDictId.value = dictionaries.value[0].id;
    }
  } catch (err) {
    console.error("Drawer Load Fail:", err);
  }
};

// --- 计算属性：联动与过滤 (修复 .filter 报错的关键) ---
const currentCategories = computed(() => {
  if (!Array.isArray(allCategories.value)) return [];
  return allCategories.value.filter(
    (c) => c.dictionaryId === selectedDictId.value,
  );
});

const filteredPrompts = computed(() => {
  // 🌟 第一道防线：非数组直接截断
  if (!Array.isArray(allPrompts.value)) return [];
  if (!selectedDictId.value) return [];

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

// --- 交互逻辑 ---
const showHoverCard = (e: MouseEvent, p: PromptItem) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

  // 🌟 核心修复：确保在 map 之前，tags 绝对被转换成了数组
  const safeTags = Array.isArray(p.tags)
    ? p.tags
    : p.tags
      ? Object.values(p.tags)
      : [];

  preview.pos = { x: rect.left, y: rect.top + rect.height / 2 };
  preview.data = p;

  // 使用清洗后的 safeTags 进行映射
  preview.tags = safeTags
    .map(
      (id) =>
        tagList.value.find((t) => t.id.toString() === id?.toString())?.name,
    )
    .filter((name): name is string => Boolean(name)); // 过滤掉未找到的标签名

  preview.visible = true;
};
const hideHoverCard = () => {
  preview.visible = false;
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

// 监听词典切换
watch(selectedDictId, () => {
  selectedCatId.value = "all";
});

onMounted(() => {
  loadData();

  // 跨端同步：监听存储变化
  chrome.storage.onChanged.addListener((changes) => {
    if (changes[STORAGE_KEYS.PROMPTS] || changes[STORAGE_KEYS.DICTIONARIES]) {
      loadData();
    }
  });

  // 监听来自 popup 的 toggle 事件
  window.addEventListener("promptpark:toggle-drawer", () => {
    isOpen.value = !isOpen.value;
  });
});
</script>

<style scoped>
/* 1. 抽屉物理滑动 */
.drawer-physic-enter-active,
.drawer-physic-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-physic-enter-from,
.drawer-physic-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* 2. 预览窗弹出微动效 */
.preview-pop-enter-active {
  animation: physic-pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.preview-pop-leave-active {
  animation: physic-pop-in 0.25s reverse ease-in;
}
@keyframes physic-pop-in {
  from {
    opacity: 0;
    transform: scale(0.8) translateX(30px) rotate(-3deg);
  }
  to {
    opacity: 1;
    transform: scale(1) translateX(0) rotate(0deg);
  }
}

/* 3. 标签入场 */
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
