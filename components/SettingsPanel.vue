<template>
  <div class="space-y-6 max-w-4xl pb-10">
    <section class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body gap-4">
        <h2 class="card-title text-lg border-l-4 border-primary pl-2">
          飞书多维表格配置
        </h2>
        <div class="grid grid-cols-2 gap-4">
          <label class="form-control w-full">
            <div class="label"><span class="label-text">App ID</span></div>
            <input
              v-model="form.feishu.appId"
              type="text"
              class="input input-bordered input-sm"
            />
          </label>
          <label class="form-control w-full">
            <div class="label"><span class="label-text">App Secret</span></div>
            <input
              v-model="form.feishu.appSecret"
              type="password"
              class="input input-bordered input-sm"
            />
          </label>
          <label class="form-control w-full">
            <div class="label"><span class="label-text">Bitable ID</span></div>
            <input
              v-model="form.feishu.bitableId"
              type="text"
              class="input input-bordered input-sm"
            />
          </label>
          <label class="form-control w-full">
            <div class="label"><span class="label-text">Table ID</span></div>
            <input
              v-model="form.feishu.tableId"
              type="text"
              class="input input-bordered input-sm"
            />
          </label>
        </div>
        <div class="card-actions justify-end mt-2">
          <button
            class="btn btn-outline btn-xs"
            @click="handleTestFeishu"
            :disabled="isTestingFeishu"
          >
            <span
              v-if="isTestingFeishu"
              class="loading loading-spinner loading-xs"
            ></span>
            测试飞书 API
          </button>
        </div>
      </div>
    </section>

    <section class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body gap-4">
        <h2 class="card-title text-lg border-l-4 border-secondary pl-2">
          GitHub 图床配置
        </h2>
        <div class="grid grid-cols-2 gap-4">
          <label class="form-control w-full">
            <div class="label"><span class="label-text">Repo Owner</span></div>
            <input
              v-model="form.github.owner"
              type="text"
              class="input input-bordered input-sm"
            />
          </label>
          <label class="form-control w-full">
            <div class="label"><span class="label-text">Repository</span></div>
            <input
              v-model="form.github.repo"
              type="text"
              class="input input-bordered input-sm"
            />
          </label>
          <label class="form-control w-full">
            <div class="label"><span class="label-text">Token</span></div>
            <input
              v-model="form.github.token"
              type="password"
              class="input input-bordered input-sm"
            />
          </label>
          <label class="form-control w-full">
            <div class="label"><span class="label-text">Path</span></div>
            <input
              v-model="form.github.path"
              type="text"
              class="input input-bordered input-sm"
            />
          </label>
        </div>
        <div class="card-actions justify-end mt-2">
          <button
            class="btn btn-outline btn-xs"
            @click="handleTestGithub"
            :disabled="isTestingGithub"
          >
            <span
              v-if="isTestingGithub"
              class="loading loading-spinner loading-xs"
            ></span>
            测试 GitHub 图床
          </button>
        </div>
      </div>
    </section>

    <div
      class="sticky bottom-0 bg-base-100/80 backdrop-blur py-4 border-t border-base-200 flex justify-between items-center px-2"
    >
      <div class="flex gap-2">
        <button
          class="btn btn-ghost btn-sm"
          @click="handleSyncAction('syncFromFeishu')"
          :disabled="isSyncing"
        >
          从飞书获取数据
        </button>
        <button
          class="btn btn-ghost btn-sm"
          @click="handleSyncAction('syncToFeishu')"
          :disabled="isSyncing"
        >
          同步数据到飞书
        </button>
      </div>
      <button
        class="btn btn-primary btn-sm px-10"
        @click="handleSave"
        :disabled="isSaving"
      >
        {{ isSaving ? "正在保存..." : "保存配置" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getSettings, saveSettings } from "@/utils/storage";
import { testFeishuConfig, testGithubConfig } from "@/utils/sync-engine";
import type { AppSettings } from "@/types";

// 修正：补全 AppSettings 缺失的属性（如 syncOnStartup）
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

const isSaving = ref(false);
const isTestingFeishu = ref(false);
const isTestingGithub = ref(false);
const isSyncing = ref(false);

onMounted(async () => {
  const settings = await getSettings();
  form.value = { ...settings };
});

const handleSave = async () => {
  isSaving.value = true;
  try {
    await saveSettings(form.value);
    browser.runtime.sendMessage({ action: "UPDATE_SETTINGS" });
    alert("配置已保存");
  } finally {
    isSaving.value = false;
  }
};

const handleTestFeishu = async () => {
  isTestingFeishu.value = true;
  try {
    await saveSettings(form.value);
    await testFeishuConfig();
    alert("飞书连接成功！");
  } catch (e: any) {
    alert(`测试失败: ${e.message}`);
  } finally {
    isTestingFeishu.value = false;
  }
};

const handleTestGithub = async () => {
  isTestingGithub.value = true;
  try {
    await saveSettings(form.value);
    await testGithubConfig();
    alert("GitHub 连接成功！");
  } catch (e: any) {
    alert(`测试失败: ${e.message}`);
  } finally {
    isTestingGithub.value = false;
  }
};

const handleSyncAction = async (action: string) => {
  isSyncing.value = true;
  try {
    const res = await browser.runtime.sendMessage({ action });
    if (res?.success) alert("同步任务已完成");
    else throw new Error(res?.error || "同步失败");
  } catch (e: any) {
    alert(`同步异常: ${e.message}`);
  } finally {
    isSyncing.value = false;
  }
};
</script>
