<template>
  <div class="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
    <div class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body">
        <h2 class="card-title text-lg border-b border-base-200 pb-2 mb-4">
          外观设置
        </h2>
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium text-base-content">主题外观</div>
            <div class="text-sm text-base-content/70">
              选择您喜欢的主题模式（支持跟随系统）
            </div>
          </div>
          <select
            class="select select-bordered w-48"
            :value="currentTheme"
            @change="handleThemeChange"
          >
            <option
              v-for="opt in THEME_OPTIONS"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body">
        <h2
          class="card-title text-lg border-b border-base-200 pb-2 mb-4 flex justify-between items-center"
        >
          <div class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-primary"
            >
              <path
                d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
              />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            Github Gist 同步
          </div>
          <span v-if="isValidated" class="badge badge-success badge-sm gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            已连接
          </span>
        </h2>

        <div class="space-y-6">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text font-medium"
                >Github Personal Access Token</span
              >
              <a
                href="https://github.com/settings/tokens/new?scopes=gist&description=PromptPark+Sync"
                target="_blank"
                class="label-text-alt link link-primary"
                >获取 Token (需勾选 gist 权限)</a
              >
            </label>
            <div class="flex gap-2">
              <input
                v-model.trim="githubToken"
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                class="input input-bordered flex-1"
              />
              <button
                class="btn btn-primary"
                :disabled="!githubToken || isTesting"
                @click="verifyAndSaveToken"
              >
                <span
                  v-if="isTesting"
                  class="loading loading-spinner loading-xs"
                ></span>
                {{ isValidated ? "更新 Token" : "验证并保存" }}
              </button>
            </div>
            <p class="text-xs text-base-content/50 mt-1">
              您的 Token 仅保存在浏览器本地，绝不会上传至任何第三方服务器。
            </p>
          </div>

          <div class="form-control w-full">
            <label class="label">
              <span class="label-text font-medium">Gist ID (备份文件标识)</span>
            </label>
            <input
              v-model.trim="gistId"
              type="text"
              placeholder="留空将在首次同步时自动创建，若需恢复数据请填入旧 ID"
              class="input input-bordered w-full font-mono text-sm"
            />
            <p class="text-xs text-base-content/50 mt-1">
              自动创建后此 ID 会自动填充，请妥善保管该 ID
              以便在其他设备上恢复数据。
            </p>
          </div>

          <div class="flex gap-4 pt-4 border-t border-base-200">
            <button
              class="btn btn-neutral flex-1"
              :disabled="!isValidated || isPushing || isPulling"
              @click="handlePush"
            >
              <span
                v-if="isPushing"
                class="loading loading-spinner loading-xs"
              ></span>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-4 h-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                />
              </svg>
              将本地数据推送到云端
            </button>

            <button
              class="btn btn-outline btn-primary flex-1"
              :disabled="!isValidated || !gistId || isPushing || isPulling"
              @click="handlePull"
            >
              <span
                v-if="isPulling"
                class="loading loading-spinner loading-xs"
              ></span>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-4 h-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                />
              </svg>
              从云端拉取并覆盖本地
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card bg-error/5 shadow-sm border border-error/20">
      <div class="card-body">
        <h2
          class="card-title text-lg text-error border-b border-error/20 pb-2 mb-4"
        >
          危险操作
        </h2>
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium text-error">清空本地所有数据</div>
            <div class="text-sm text-error/70">
              将永久删除本地存储的所有提示词、词典和设置，不可恢复。（不影响云端数据）
            </div>
          </div>
          <button class="btn btn-error" @click="handleClearData">
            清空数据
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useTheme } from "@/composables/useTheme";
import { useConfirm } from "@/composables/useConfirm";
import { useMessage } from "@/composables/useMessage";
import { localStore, syncStore } from "@/utils/storage";
import { STORAGE_KEYS, DEFAULT_SETTINGS } from "@/config";
import type { ThemeType, AppSettings } from "@/types";
import { githubSync } from "@/utils/githubSync";

const { currentTheme, setTheme, THEME_OPTIONS } = useTheme();
const { confirm } = useConfirm();
const { success, error, warning } = useMessage();

// --- 状态定义 ---
const githubToken = ref("");
const gistId = ref("");
const isValidated = ref(false);

const isTesting = ref(false);
const isPushing = ref(false);
const isPulling = ref(false);

// --- 初始化加载设置 ---
onMounted(async () => {
  const settings =
    (await syncStore.get<AppSettings>(STORAGE_KEYS.SETTINGS)) ||
    DEFAULT_SETTINGS;
  githubToken.value = settings.githubToken || "";
  gistId.value = settings.gistId || "";
  // 如果本地有 Token，默认认为验证通过（为了防止每次打开都发请求，实际验证在保存或同步时拦截）
  if (githubToken.value) isValidated.value = true;
});

// --- 主题切换 ---
const handleThemeChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  setTheme(target.value as ThemeType);
};

// --- Github Token 校验与保存 ---
const verifyAndSaveToken = async () => {
  if (!githubToken.value) return;

  isTesting.value = true;
  isValidated.value = false;

  const isOk = await githubSync.testToken(githubToken.value);
  if (isOk) {
    const settings =
      (await syncStore.get<AppSettings>(STORAGE_KEYS.SETTINGS)) ||
      DEFAULT_SETTINGS;
    settings.githubToken = githubToken.value;

    // 如果用户修改了 Gist ID，一并保存
    if (gistId.value) settings.gistId = gistId.value;

    await syncStore.set(STORAGE_KEYS.SETTINGS, settings);
    isValidated.value = true;
    success("Token 验证通过并已安全保存！");
  } else {
    error("Token 无效或权限不足，请检查！");
  }
  isTesting.value = false;
};

// --- 上推到云端 (Push) ---
const handlePush = async () => {
  const isOk = await confirm(
    "确定将本地所有数据推送到云端吗？这将覆盖云端原有数据。",
    "上云确认",
    "info",
  );
  if (!isOk) return;

  isPushing.value = true;
  try {
    // 确保把用户最新输入的 Gist ID 先存入设置
    const settings =
      (await syncStore.get<AppSettings>(STORAGE_KEYS.SETTINGS)) ||
      DEFAULT_SETTINGS;
    if (gistId.value !== settings.gistId) {
      settings.gistId = gistId.value;
      await syncStore.set(STORAGE_KEYS.SETTINGS, settings);
    }

    const newGistId = await githubSync.pushToCloud();

    // 如果是新建的，回填 ID
    if (newGistId && newGistId !== gistId.value) {
      gistId.value = newGistId;
    }

    success("🎉 数据已成功备份至 Github Gist！");
  } catch (err: any) {
    error(err.message || "上传云端失败，请检查网络或 Token 权限");
  } finally {
    isPushing.value = false;
  }
};

// --- 下拉到本地 (Pull) ---
const handlePull = async () => {
  if (!gistId.value) {
    warning("请先输入要恢复的 Gist ID！");
    return;
  }

  const isOk = await confirm(
    "确定从云端拉取数据吗？警告：这将会完全覆盖您当前的本地数据！此操作不可逆！",
    "高危操作：覆盖本地",
    "danger",
    "确认覆盖",
  );
  if (!isOk) return;

  isPulling.value = true;
  try {
    // 先保存用户可能手填的旧 Gist ID
    const settings =
      (await syncStore.get<AppSettings>(STORAGE_KEYS.SETTINGS)) ||
      DEFAULT_SETTINGS;
    if (gistId.value !== settings.gistId) {
      settings.gistId = gistId.value;
      await syncStore.set(STORAGE_KEYS.SETTINGS, settings);
    }

    await githubSync.pullFromCloud();
    success("☁️ 云端数据已成功拉取并覆盖本地！请刷新页面查看。");

    // 提示用户刷新以让所有页面重新读取数据
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (err: any) {
    error(err.message || "拉取数据失败，请检查 Gist ID 是否正确");
  } finally {
    isPulling.value = false;
  }
};

// --- 清空数据 ---
const handleClearData = async () => {
  const isOk = await confirm(
    "确定要清空所有本地数据吗？此操作不可逆转！",
    "高危操作",
    "danger",
    "确认清空",
    "取消",
  );
  if (isOk) {
    await localStore.clear();
    await syncStore.clear();
    success("所有本地数据已成功清空");
    setTheme("system");

    // 清空状态
    githubToken.value = "";
    gistId.value = "";
    isValidated.value = false;

    setTimeout(() => window.location.reload(), 1000);
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
