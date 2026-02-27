<template>
  <div class="space-y-8 max-w-3xl">
    <div v-if="isLoading" class="flex justify-center py-10">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <template v-else>
      <section class="space-y-4">
        <h2 class="text-xl font-semibold border-b border-base-200 pb-2">
          飞书多维表格配置
        </h2>
        <div class="grid grid-cols-2 gap-4">
          <label class="form-control w-full">
            <div class="label"><span class="label-text">App ID</span></div>
            <input
              v-model="form.feishu.appId"
              type="text"
              placeholder="输入飞书应用的 App ID"
              class="input input-bordered w-full"
            />
          </label>
          <label class="form-control w-full">
            <div class="label"><span class="label-text">App Secret</span></div>
            <input
              v-model="form.feishu.appSecret"
              type="password"
              placeholder="输入飞书应用的 App Secret"
              class="input input-bordered w-full"
            />
          </label>
          <label class="form-control w-full">
            <div class="label">
              <span class="label-text">Bitable ID (app_token)</span>
            </div>
            <input
              v-model="form.feishu.bitableId"
              type="text"
              placeholder="多维表格的基础 Token"
              class="input input-bordered w-full"
            />
          </label>
          <label class="form-control w-full">
            <div class="label">
              <span class="label-text">Table ID (table_id)</span>
            </div>
            <input
              v-model="form.feishu.tableId"
              type="text"
              placeholder="具体的表格 ID"
              class="input input-bordered w-full"
            />
          </label>
        </div>
        <div class="form-control">
          <label class="label cursor-pointer justify-start gap-4">
            <input
              v-model="form.enableAutoSync"
              type="checkbox"
              class="toggle toggle-primary"
            />
            <span class="label-text"
              >开启后台自动同步 (间隔: {{ form.syncInterval / 60 }} 分钟)</span
            >
          </label>
        </div>
      </section>

      <section class="space-y-4 pt-4">
        <h2 class="text-xl font-semibold border-b border-base-200 pb-2">
          GitHub 图床配置 (用于提示词缩略图)
        </h2>
        <div class="grid grid-cols-2 gap-4">
          <label class="form-control w-full">
            <div class="label">
              <span class="label-text">个人访问令牌 (PAT)</span>
            </div>
            <input
              v-model="form.github.token"
              type="password"
              placeholder="ghp_xxxxxxxxxxx"
              class="input input-bordered w-full"
            />
          </label>
          <label class="form-control w-full">
            <div class="label">
              <span class="label-text">仓库所有者 (Owner)</span>
            </div>
            <input
              v-model="form.github.owner"
              type="text"
              placeholder="GitHub 用户名"
              class="input input-bordered w-full"
            />
          </label>
          <label class="form-control w-full">
            <div class="label">
              <span class="label-text">仓库名称 (Repo)</span>
            </div>
            <input
              v-model="form.github.repo"
              type="text"
              placeholder="例如: prompt-images"
              class="input input-bordered w-full"
            />
          </label>
          <label class="form-control w-full">
            <div class="label">
              <span class="label-text">存储目录路径 (Path)</span>
            </div>
            <input
              v-model="form.github.path"
              type="text"
              placeholder="例如: images/2026/"
              class="input input-bordered w-full"
            />
          </label>
        </div>
      </section>

      <section class="space-y-4 pt-4">
        <h2 class="text-xl font-semibold border-b border-base-200 pb-2">
          个性化设置
        </h2>
        <div class="grid grid-cols-2 gap-4">
          <label class="form-control w-full max-w-xs">
            <div class="label"><span class="label-text">界面语言</span></div>
            <select v-model="form.language" class="select select-bordered">
              <option value="zh-CN">简体中文 (默认)</option>
              <option value="en-US">English</option>
            </select>
          </label>
          <label class="form-control w-full max-w-xs">
            <div class="label"><span class="label-text">UI 主题</span></div>
            <select v-model="form.theme" class="select select-bordered">
              <option value="light">明亮模式 (Light)</option>
              <option value="dark">暗黑模式 (Dark)</option>
            </select>
          </label>
        </div>
      </section>

      <div class="pt-6 flex gap-4">
        <button
          class="btn btn-primary"
          @click="handleSave"
          :disabled="isSaving"
        >
          <span v-if="isSaving" class="loading loading-spinner"></span>
          保存所有配置
        </button>
        <button class="btn btn-outline" @click="testConnection">
          测试 API 连接
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getSettings, saveSettings } from "@/utils/storage";
import type { AppSettings } from "@/types";

/**
 * 响应式状态定义
 */
const isLoading = ref(true); // 控制初始化加载状态
const isSaving = ref(false); // 控制保存按钮状态

// 使用 ref 完整映射 AppSettings 的结构
// 这里赋予初始空值，onMounted 时会被真实数据覆盖
const form = ref<AppSettings>({
  feishu: {
    appId: "",
    appSecret: "",
    bitableId: "",
    tableId: "",
    wikiNodeId: "",
  },
  github: { token: "", owner: "", repo: "", path: "" },
  syncInterval: 3600,
  enableAutoSync: false,
  syncOnStartup: true,
  language: "zh-CN",
  theme: "light",
});

/**
 * 生命周期: 组件挂载时读取本地存储的配置
 */
onMounted(async () => {
  try {
    const settings = await getSettings();
    form.value = { ...settings }; // 浅拷贝赋值给表单
  } catch (error) {
    console.error("读取配置失败:", error);
  } finally {
    isLoading.value = false;
  }
});

/**
 * 方法: 保存表单配置到本地存储
 * 逻辑: 调用 utils/storage.ts 中的 saveSettings 接口
 */
const handleSave = async () => {
  isSaving.value = true;
  try {
    // 强制转换为 AppSettings 确保类型安全
    await saveSettings(form.value as AppSettings);
    // TODO: 可以在这里添加一个 Toast 成功提示 (如 DaisyUI 的 toast 气泡)
    alert("配置保存成功！");
  } catch (error) {
    console.error("保存配置失败:", error);
    alert("保存失败，请重试");
  } finally {
    isSaving.value = false;
  }
};

/**
 * 方法: 预留的测试网络连接功能
 */
const testConnection = () => {
  alert("网络测试功能将在后续“同步引擎”模块中完善。");
};
</script>
