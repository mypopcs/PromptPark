<template>
  <div
    class="flex h-screen bg-base-100 text-base-content overflow-hidden font-sans"
  >
    <OptionSidemenu
      :isCollapsed="isCollapsed"
      :currentView="currentView"
      :currentTheme="currentTheme"
      @select-view="currentView = $event"
      @toggle-theme="toggleTheme"
    />
    <div class="flex-1 flex flex-col min-w-0 bg-base-200/30">
      <OptionHeader
        :isCollapsed="isCollapsed"
        @toggle-collapse="isCollapsed = !isCollapsed"
      />

      <main class="flex-1 overflow-y-auto p-6">
        <component :is="currentComponent" />
      </main>
    </div>
    <AppToast />
    <GlobalConfirm />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useTheme } from "@/composables/useTheme";
import PromptManage from "@/components/business/PromptManage.vue";
import DictionaryManage from "@/components/business/DictionaryManage.vue";
import TagManage from "@/components/business/TagManage.vue";
import PlatformManage from "@/components/business/PlatformManage.vue";
import SettingsPanel from "@/components/business/SettingsPanel.vue";
import AppToast from "@/components/ui/AppToast.vue";
import GlobalConfirm from "@/components/ui/GlobalConfirm.vue";
import FeedbackPanel from "@/components/business/FeedbackPanel.vue";
import OptionHeader from "@/components/layout/OptionHeader.vue";
import OptionSidemenu from "@/components/layout/OptionSidemenu.vue";

const { currentTheme, setTheme, initTheme } = useTheme();

const isCollapsed = ref(false);

const toggleTheme = () => {
  setTheme(currentTheme.value === "dark" ? "light" : "dark");
};

const currentView = ref("PromptManage");
const views = {
  PromptManage,
  DictionaryManage,
  TagManage,
  PlatformManage,
  SettingsPanel,
  FeedbackPanel,
};
const currentComponent = computed(
  () => views[currentView.value as keyof typeof views] || null,
);

onMounted(() => {
  initTheme();
});
</script>
