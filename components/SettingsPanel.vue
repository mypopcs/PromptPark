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
              placeholder="例如：cli_xxx"
            />
          </label>
          <label class="form-control w-full">
            <div class="label"><span class="label-text">App Secret</span></div>
            <input
              v-model="form.feishu.appSecret"
              type="password"
              class="input input-bordered input-sm"
              placeholder="请输入飞书应用密钥"
            />
          </label>
          <label class="form-control w-full">
            <div class="label"><span class="label-text">Bitable ID</span></div>
            <input
              v-model="form.feishu.bitableId"
              type="text"
              class="input input-bordered input-sm"
              placeholder="例如：bascnxxxx"
            />
          </label>
          <label class="form-control w-full">
            <div class="label"><span class="label-text">Table ID</span></div>
            <input
              v-model="form.feishu.tableId"
              type="text"
              class="input input-bordered input-sm"
              placeholder="例如：tblxxxx"
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
              placeholder="例如：your-github-name"
            />
          </label>
          <label class="form-control w-full">
            <div class="label"><span class="label-text">Repository</span></div>
            <input
              v-model="form.github.repo"
              type="text"
              class="input input-bordered input-sm"
              placeholder="例如：prompt-park-assets"
            />
          </label>
          <label class="form-control w-full">
            <div class="label"><span class="label-text">Token</span></div>
            <input
              v-model="form.github.token"
              type="password"
              class="input input-bordered input-sm"
              placeholder="请输入 GitHub Token"
            />
          </label>
          <label class="form-control w-full">
            <div class="label"><span class="label-text">Path</span></div>
            <input
              v-model="form.github.path"
              type="text"
              class="input input-bordered input-sm"
              placeholder="例如：images/prompts"
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


    <section class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body gap-4">
        <h2 class="card-title text-lg border-l-4 border-accent pl-2">
          界面与语言设置
        </h2>
        <div class="grid grid-cols-2 gap-4">
          <label class="form-control w-full">
            <div class="label"><span class="label-text">界面语言</span></div>
            <select v-model="form.language" class="select select-bordered select-sm">
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
            </select>
          </label>
          <label class="form-control w-full">
            <div class="label"><span class="label-text">主题模式</span></div>
            <select v-model="form.theme" class="select select-bordered select-sm">
              <option value="light">亮色模式</option>
              <option value="dark">暗黑模式</option>
            </select>
          </label>
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
import { useMessage } from "@/composables/useMessage";
import { useTheme } from "@/composables/useTheme";
import { useLocale } from "@/composables/useLocale";
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

const { success, error } = useMessage();
const { setTheme } = useTheme();
const { setLocale } = useLocale();

/**
 * 将未知错误转换为用户可读文案。
 */
const getErrorMessage = (value: unknown): string => {
  if (value instanceof Error) return value.message;
  return "操作失败，请稍后重试";
};

onMounted(async () => {
  const settings = await getSettings();
  form.value = { ...settings };
  setTheme(form.value.theme);
  setLocale(form.value.language);
});

const handleSave = async () => {
  isSaving.value = true;
  try {
    await saveSettings(form.value);
    setTheme(form.value.theme);
    setLocale(form.value.language);
    browser.runtime.sendMessage({ action: "UPDATE_SETTINGS" });
    success("配置已保存，主题与语言已更新");
  } catch (e: unknown) {
    error(`保存失败：${getErrorMessage(e)}`);
  } finally {
    isSaving.value = false;
  }
};

const handleTestFeishu = async () => {
  isTestingFeishu.value = true;
  try {
    await saveSettings(form.value);
    await testFeishuConfig();
    success("飞书连接成功！");
  } catch (e: unknown) {
    error(`飞书测试失败：${getErrorMessage(e)}`);
  } finally {
    isTestingFeishu.value = false;
  }
};

const handleTestGithub = async () => {
  isTestingGithub.value = true;
  try {
    await saveSettings(form.value);
    await testGithubConfig();
    success("GitHub 连接成功！");
  } catch (e: unknown) {
    error(`GitHub 测试失败：${getErrorMessage(e)}`);
  } finally {
    isTestingGithub.value = false;
  }
};

const handleSyncAction = async (action: string) => {
  isSyncing.value = true;
  try {
    const res = await browser.runtime.sendMessage({ action });
    if (res?.success) success("同步任务已完成");
    else throw new Error(res?.error || "同步失败");
  } catch (e: unknown) {
    error(`同步异常：${getErrorMessage(e)}`);
  } finally {
    isSyncing.value = false;
  }
};
</script>
