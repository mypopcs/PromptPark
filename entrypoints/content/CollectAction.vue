<template>
  <div class="collect-action-container">
    <Transition name="bounce">
      <BaseButton
        v-show="showButton"
        variant="primary"
        size="sm"
        class="fixed z-[999] shadow-2xl px-4 font-bold"
        :style="{ top: buttonPos.y + 'px', left: buttonPos.x + 'px' }"
        @mousedown.prevent
        @click.stop="openCollectModal"
      >
        <i class="ri-add-line mr-1"></i>
        采集到词库 (Ctrl+Alt+A)
      </BaseButton>
    </Transition>

    <SharedPromptModal
      v-model="isModalOpen"
      mode="collect"
      :initialData="collectedData"
      @save="onSavePrompt"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import SharedPromptModal from "@/components/business/SharedPromptModal.vue";
import { useMessage } from "@/composables/useMessage";
import { localStore } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config";
import { createDefaultPrompt } from "@/utils/factories";
import type { PromptItem } from "@/types";
import BaseButton from "@/components/ui/BaseButton.vue";

const { success } = useMessage();
const showButton = ref(false);
const isModalOpen = ref(false);
const buttonPos = ref({ x: 0, y: 0 });
const selectedText = ref("");
const collectedData = ref<PromptItem | undefined>(undefined);

// 处理划词位置计算
const handleMouseUp = () => {
  if (isModalOpen.value) return;

  setTimeout(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 2) {
      const range = selection!.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      buttonPos.value = {
        x: rect.left + rect.width / 2,
        y: rect.top - 50 < 10 ? rect.bottom + 10 : rect.top - 50,
      };
      selectedText.value = text;
      showButton.value = true;
    } else {
      showButton.value = false;
    }
  }, 50);
};

const openCollectModal = () => {
  showButton.value = false;
  // 构造初始数据
  const prompt = createDefaultPrompt();
  prompt.prompt = selectedText.value;
  collectedData.value = prompt;

  // 显式开启弹窗
  isModalOpen.value = true;
};

// 监听快捷键
const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === "a") {
    const text = window.getSelection()?.toString().trim();
    if (text) {
      e.preventDefault();
      selectedText.value = text;
      openCollectModal();
    }
  }
};

const onSavePrompt = async (data: PromptItem) => {
  const list =
    (await localStore.get<PromptItem[]>(STORAGE_KEYS.PROMPTS, [])) || [];
  list.unshift(data);
  await localStore.set(STORAGE_KEYS.PROMPTS, list);
  success("采集成功！已同步至本地词库");
};

onMounted(() => {
  window.addEventListener("mouseup", handleMouseUp);
  window.addEventListener("keydown", handleKeyDown);
});
onUnmounted(() => {
  window.removeEventListener("mouseup", handleMouseUp);
  window.removeEventListener("keydown", handleKeyDown);
});
</script>
