<template>
  <div
    class="prompt-park-content-root text-base-content"
    :class="{ dark: currentTheme === 'dark' }"
    :data-theme="currentTheme"
  >
    <CollectAction />
    <DrawerContainer />
    <Toast position="top-center" />
  </div>
</template>

<script setup lang="ts">
import { useAppSync } from "@/composables/useAppSync";
import CollectAction from "./CollectAction.vue";
import DrawerContainer from "@/components/business/DrawerContainer.vue";
const { currentTheme } = useAppSync();
</script>
