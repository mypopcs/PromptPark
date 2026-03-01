<template>
  <div
    class="prompt-park-content-root text-base-content"
    :class="{ dark: currentTheme === 'dark' }"
    :data-theme="currentTheme"
  >
    <CollectAction />
    <DrawerContainer />
    <AppToast />
  </div>
</template>

<script setup lang="ts">
import { useAppSync } from "@/composables/useAppSync";
import CollectAction from "./CollectAction.vue"; // 我们把刚才写的划词逻辑拆到这个小组件
import DrawerContainer from "@/components/business/DrawerContainer.vue";
import AppToast from "@/components/ui/AppToast.vue";
const { currentTheme } = useAppSync(); // 🌟 自动同步主题
</script>
