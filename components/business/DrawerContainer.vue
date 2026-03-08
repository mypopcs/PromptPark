<template>
  <div class="prompt-park-drawer-wrapper">
    <Button
      class="fixed right-1 top-1/2 rounded-l-lg z-[99] overflow-hidden transition-all duration-300 ease-in-out hover:px-4 flex items-center justify-center"
      @click="isOpen = true"
      title="展开/折叠快捷键：Ctrl+Shift+Z"
      :style="{ width: isHovered ? 'auto' : '32px' }"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <i class="ri-flashlight-fill text-sm shrink-0"></i>
      <p
        class="text-xs font-black h-full flex items-center justify-center transition-all duration-300 ease-in-out shrink-0"
        :class="{
          'ml-2 opacity-100 w-auto': isHovered,
          'ml-0 opacity-0 w-0': !isHovered,
        }"
      >
        PromptPark
      </p>
    </Button>
    <Transition name="drawer-physic">
      <div
        v-if="isOpen"
        class="fixed right-0 top-0 h-screen w-[560px] bg-base-100 shadow-[-20px_0_60px_rgba(0,0,0,0.2)] z-[9999] border-l border-base-200 flex flex-col overflow-hidden"
      >
        <header
          class="p-4 flex items-center justify-between bg-base-100 border-b border-base-200 shrink-0"
        >
          <div class="flex flex-col w-[160px]">
            <label class="text-sm font-medium mb-1">选择词典</label>
            <Select
              v-model="selectedDictId"
              :options="dictionaryOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="请选择词典"
              class="w-full"
              appendTo="self"
            />
          </div>
          <Button
            variant="text"
            severity="secondary"
            rounded
            @click="isOpen = false"
            class="!p-2"
          >
            <i class="ri-close-line text-lg"></i>
          </Button>
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
                    ><i class="ri-close-line"></i
                  ></span>
                </span>
              </TransitionGroup>
              <Textarea
                v-model="manualInput"
                @keyup.enter="addManualToken"
                placeholder="输入或选择提示词..."
                :autoResize="true"
                rows="1"
                class="border-none shadow-none flex-1 min-w-[200px]"
                :pt="{
                  root: {
                    class:
                      'border-none hover:border-none focus:border-none bg-transparent',
                  },
                }"
              />
            </div>
            <div class="grid grid-cols-8 gap-2">
              <Button @click="copyAll" class="col-span-7">
                <i class="ri-file-copy-line mr-1"></i>
                复制组合
              </Button>

              <Button
                severity="danger"
                variant="text"
                @click="combinationList = []"
                class="!p-2"
              >
                <i class="ri-delete-bin-line opacity-40"></i>
              </Button>
            </div>
          </div>
        </section>

        <nav
          class="shrink-0 bg-base-100 border-b border-base-200 sticky top-0 z-20"
        >
          <div class="px-4 pt-4 pb-2">
            <div class="relative">
              <i
                class="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"
              ></i>
              <InputText
                v-model="searchQuery"
                placeholder="搜索提示词..."
                class="w-full pl-9"
              />
            </div>
          </div>
          <div class="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-3">
            <Button size="small" @click="selectedCatId = 'all'">
              全部分类
            </Button>
            <Button
              v-for="cat in currentCategories"
              :key="cat.id"
              variant="outlined"
              size="small"
              @click="selectedCatId = cat.id"
            >
              {{ cat.name }}
            </Button>
          </div>
        </nav>

        <main class="p-4 grid grid-cols-3 gap-3 relative h-16">
          <div
            v-if="filteredPrompts.length === 0"
            class="col-span-3 py-20 text-center opacity-20 flex flex-col items-center"
          >
            <i class="ri-database-2-line text-5xl mb-2"></i>
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
import Button from "primevue/button";
import Select from "primevue/select";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import PromptCard from "@/components/ui/PromptCard.vue";

const { success, error } = useMessage();

const isOpen = ref(false);
const isHovered = ref(false);
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
