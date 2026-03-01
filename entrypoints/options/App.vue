<template>
  <div class="drawer w-full lg:drawer-open h-screen bg-base-100 font-sans">
    <input id="options-drawer" type="checkbox" class="drawer-toggle" />

    <div class="drawer-content flex flex-col h-full overflow-hidden">
      <OptionHeader />

      <main class="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-base-100/50">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <div class="drawer-side z-40 border-r border-base-200">
      <label
        for="options-drawer"
        class="drawer-overlay"
        aria-label="close sidebar"
      ></label>
      <OptionSidemenu />
    </div>
  </div>

  <AppToast />
  <ConfirmDialog />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import OptionHeader from "@/components/layout/OptionHeader.vue";
import OptionSidemenu from "@/components/layout/OptionSidemenu.vue";
import AppToast from "@/components/ui/AppToast.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import { useTheme } from "@/composables/useTheme";

const { initTheme } = useTheme();

onMounted(async () => {
  // 插件 Options 页面打开时，立刻初始化系统主题
  await initTheme();
});
</script>

<style>
/* 优雅的路由切换渐变动画 */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
