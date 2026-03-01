<template>
  <div class="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
    <div class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body">
        <h2 class="card-title text-lg border-b border-base-200 pb-2 mb-4">
          全局设置
        </h2>
        <div class="grid grid-cols-2 gap-8">
          <div class="form-control w-full">
            <label class="label"
              ><span class="label-text font-medium">主题外观</span></label
            >
            <select
              class="select select-bordered w-full"
              v-model="formData.theme"
              @change="saveSettings"
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
          <div class="form-control w-full">
            <label class="label"
              ><span class="label-text font-medium">图床引擎</span></label
            >
            <select
              class="select select-bordered w-full"
              v-model="formData.imageHostProvider"
              @change="saveSettings"
            >
              <option value="none">不使用图床 (转为 Base64 存本地)</option>
              <option value="github">Github Repo (推荐)</option>
            </select>
          </div>
        </div>

        <div
          v-if="formData.imageHostProvider === 'github'"
          class="mt-6 space-y-4 animate-fade-in bg-base-200/50 p-4 rounded-box"
        >
          <div
            class="font-medium text-sm text-primary mb-2 flex justify-between items-center"
          >
            Github 仓库图床配置
            <a
              href="https://github.com/new"
              target="_blank"
              class="text-xs link link-primary font-normal"
              >去新建一个公开仓库</a
            >
          </div>
          <div class="form-control w-full">
            <label class="label py-1"
              ><span class="label-text text-xs"
                >Github Token (必须包含 repo 权限)</span
              ></label
            >
            <input
              v-model.trim="formData.githubImageHost.token"
              type="password"
              class="input input-bordered input-sm w-full"
              placeholder="ghp_..."
              @blur="saveSettings"
            />
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div class="form-control w-full">
              <label class="label py-1"
                ><span class="label-text text-xs"
                  >仓库 (用户名/仓库名)</span
                ></label
              >
              <input
                v-model.trim="formData.githubImageHost.repo"
                type="text"
                placeholder="例如: zhangsan/images"
                class="input input-bordered input-sm w-full"
                @blur="saveSettings"
              />
            </div>
            <div class="form-control w-full">
              <label class="label py-1"
                ><span class="label-text text-xs">分支</span></label
              >
              <input
                v-model.trim="formData.githubImageHost.branch"
                type="text"
                placeholder="例如: main"
                class="input input-bordered input-sm w-full"
                @blur="saveSettings"
              />
            </div>
            <div class="form-control w-full">
              <label class="label py-1"
                ><span class="label-text text-xs"
                  >存储路径 (留空放根目录)</span
                ></label
              >
              <input
                v-model.trim="formData.githubImageHost.path"
                type="text"
                placeholder="例如: uploads/"
                class="input input-bordered input-sm w-full"
                @blur="saveSettings"
              />
            </div>
          </div>
          <p class="text-xs text-base-content/50 mt-2">
            * 提示：上传的图片将通过
            <b>jsDelivr CDN</b> 加速分发，请确保您的仓库是
            <b>Public (公开)</b> 的，否则无法正常显示图片。
          </p>
        </div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body">
        <div
          class="flex justify-between items-center border-b border-base-200 pb-2 mb-4"
        >
          <h2 class="card-title text-lg flex items-center gap-2">
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
            多端数据同步引擎
          </h2>
          <div class="flex items-center gap-2">
            <span class="text-sm text-base-content/70">当前引擎：</span>
            <select
              class="select select-bordered select-sm w-40"
              v-model="formData.syncProvider"
              @change="saveSettings"
            >
              <option value="none">停用同步</option>
              <option value="github">Github Gist</option>
              <option value="feishu">飞书多维表格</option>
              <option value="notion">Notion Database</option>
            </select>
          </div>
        </div>

        <div
          v-if="formData.syncProvider === 'none'"
          class="text-center py-8 text-base-content/50 text-sm"
        >
          数据同步功能已停用。您的数据目前仅保存在浏览器本地。
        </div>

        <div
          v-if="formData.syncProvider === 'github'"
          class="space-y-4 animate-fade-in"
        >
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text font-medium"
                >Github Personal Access Token</span
              >
              <a
                href="https://github.com/settings/tokens/new"
                target="_blank"
                class="label-text-alt link link-primary"
                >获取 Token</a
              >
            </label>
            <input
              v-model.trim="formData.githubSync.token"
              type="password"
              class="input input-bordered w-full"
              placeholder="ghp_..."
              @blur="saveSettings"
            />
          </div>
          <div class="form-control w-full">
            <label class="label"
              ><span class="label-text font-medium"
                >Gist ID (留空则自动创建)</span
              ></label
            >
            <input
              v-model.trim="formData.githubSync.gistId"
              type="text"
              class="input input-bordered w-full font-mono text-sm"
              @blur="saveSettings"
            />
          </div>
        </div>

        <div
          v-if="formData.syncProvider === 'feishu'"
          class="space-y-4 animate-fade-in"
        >
          <div class="grid grid-cols-2 gap-4">
            <div class="form-control w-full">
              <label class="label"
                ><span class="label-text font-medium">App ID</span></label
              >
              <input
                v-model.trim="formData.feishuSync.appId"
                type="text"
                class="input input-bordered w-full"
                @blur="saveSettings"
              />
            </div>
            <div class="form-control w-full">
              <label class="label"
                ><span class="label-text font-medium">App Secret</span></label
              >
              <input
                v-model.trim="formData.feishuSync.appSecret"
                type="password"
                class="input input-bordered w-full"
                @blur="saveSettings"
              />
            </div>
          </div>
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text font-medium">多维表格 App Token</span>
              <span class="label-text-alt text-base-content/50"
                >URL 中 base/ 后面的字符</span
              >
            </label>
            <input
              v-model.trim="formData.feishuSync.appToken"
              type="text"
              class="input input-bordered w-full"
              @blur="saveSettings"
            />
          </div>

          <div class="divider text-xs text-base-content/50">
            多表映射关系 (Table ID)
          </div>
          <div class="grid grid-cols-3 gap-4 bg-base-200/50 p-4 rounded-box">
            <div class="form-control" v-for="key in tableKeys" :key="key.id">
              <label class="label py-1"
                ><span class="label-text text-xs">{{ key.label }}</span></label
              >
              <input
                v-model.trim="formData.feishuSync.mapping[key.id]"
                type="text"
                class="input input-bordered input-sm w-full"
                @blur="saveSettings"
              />
            </div>
          </div>
        </div>

        <div
          v-if="formData.syncProvider === 'notion'"
          class="space-y-4 animate-fade-in"
        >
          <div class="form-control w-full">
            <label class="label"
              ><span class="label-text font-medium"
                >Notion Integration Token</span
              ></label
            >
            <input
              v-model.trim="formData.notionSync.token"
              type="password"
              class="input input-bordered w-full"
              @blur="saveSettings"
            />
          </div>
          <div class="divider text-xs text-base-content/50">
            Database ID 映射
          </div>
          <div class="grid grid-cols-3 gap-4 bg-base-200/50 p-4 rounded-box">
            <div class="form-control" v-for="key in tableKeys" :key="key.id">
              <label class="label py-1"
                ><span class="label-text text-xs">{{ key.label }}</span></label
              >
              <input
                v-model.trim="formData.notionSync.mapping[key.id]"
                type="text"
                class="input input-bordered input-sm w-full"
                @blur="saveSettings"
              />
            </div>
          </div>
        </div>

        <div
          v-if="formData.syncProvider !== 'none'"
          class="flex gap-4 pt-6 mt-4 border-t border-base-200"
        >
          <button
            class="btn btn-neutral flex-1"
            :disabled="isSyncing"
            @click="handlePush"
          >
            <span
              v-if="isSyncing"
              class="loading loading-spinner loading-xs"
            ></span>
            上云：覆盖云端数据
          </button>

          <button
            class="btn btn-outline btn-primary flex-1"
            :disabled="isSyncing"
            @click="handlePull"
          >
            <span
              v-if="isSyncing"
              class="loading loading-spinner loading-xs"
            ></span>
            下云：覆盖本地数据
          </button>
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
              将永久删除本地存储的所有提示词和设置，不可恢复。（不影响云端数据）
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
import type {
  AppSettings,
  TableMapping,
  PromptItem,
  DictionaryItem,
  CategoryItem,
  PlatformItem,
  AIModelItem,
  TagItem,
} from "@/types";
import type { SyncDataPayload } from "@/utils/sync";
import { SyncFactory } from "@/utils/sync/SyncFactory";

const { setTheme, THEME_OPTIONS } = useTheme();
const { confirm } = useConfirm();
const { success, error } = useMessage();

const isSyncing = ref(false);

// 用于循环渲染 6 个表的映射输入框 (Type-safe)
const tableKeys: { id: keyof TableMapping; label: string }[] = [
  { id: "promptsTableId", label: "提示词表 ID" },
  { id: "dictionariesTableId", label: "词典表 ID" },
  { id: "categoriesTableId", label: "分类表 ID" },
  { id: "platformsTableId", label: "平台表 ID" },
  { id: "modelsTableId", label: "模型表 ID" },
  { id: "tagsTableId", label: "标签表 ID" },
];

// 极其严谨的表单状态初始化，彻底杜绝 undefined 导致的 v-model 报错
const formData = ref<AppSettings>(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)));

// --- 加载与保存设置 ---
const loadSettings = async () => {
  const storedSettings = await syncStore.get<AppSettings>(
    STORAGE_KEYS.SETTINGS,
  );

  // 深度防御：如果本地缓存缺少某些嵌套对象(由于版本升级)，进行深度合并
  formData.value = {
    ...DEFAULT_SETTINGS,
    ...(storedSettings || {}),
    githubSync: {
      ...DEFAULT_SETTINGS.githubSync,
      ...(storedSettings?.githubSync || {}),
    },
    feishuSync: {
      ...DEFAULT_SETTINGS.feishuSync,
      ...(storedSettings?.feishuSync || {}),
      mapping: {
        ...DEFAULT_SETTINGS.feishuSync.mapping,
        ...(storedSettings?.feishuSync?.mapping || {}),
      },
    },
    notionSync: {
      ...DEFAULT_SETTINGS.notionSync,
      ...(storedSettings?.notionSync || {}),
      mapping: {
        ...DEFAULT_SETTINGS.notionSync.mapping,
        ...(storedSettings?.notionSync?.mapping || {}),
      },
    },
    githubImageHost: {
      ...DEFAULT_SETTINGS.githubImageHost,
      ...(storedSettings?.githubImageHost || {}),
    },
  };
};

const saveSettings = async () => {
  // 当主题改变时立刻生效
  setTheme(formData.value.theme);
  // 🌟 存入 chrome.storage，此时 Content Script 会立刻收到 onChange 信
  await syncStore.set(STORAGE_KEYS.SETTINGS, formData.value);
  // 不弹 toast 防止频繁打扰，这属于静默保存
};

onMounted(() => loadSettings());

// --- 本地数据打包与解包逻辑 ---
const packLocalData = async (): Promise<SyncDataPayload> => {
  const [prompts, dictionaries, categories, platforms, models, tags] =
    await Promise.all([
      localStore.get<PromptItem[]>(STORAGE_KEYS.PROMPTS, []),
      localStore.get<DictionaryItem[]>(STORAGE_KEYS.DICTIONARIES, []),
      localStore.get<CategoryItem[]>(STORAGE_KEYS.CATEGORIES, []),
      localStore.get<PlatformItem[]>(STORAGE_KEYS.PLATFORMS, []),
      localStore.get<AIModelItem[]>(STORAGE_KEYS.MODELS, []),
      localStore.get<TagItem[]>(STORAGE_KEYS.TAGS, []),
    ]);

  return {
    prompts: prompts || [],
    dictionaries: dictionaries || [],
    categories: categories || [],
    platforms: platforms || [],
    models: models || [],
    tags: tags || [],
    timestamp: Date.now(),
  };
};

const unpackToLocal = async (payload: SyncDataPayload) => {
  await Promise.all([
    localStore.set(STORAGE_KEYS.PROMPTS, payload.prompts || []),
    localStore.set(STORAGE_KEYS.DICTIONARIES, payload.dictionaries || []),
    localStore.set(STORAGE_KEYS.CATEGORIES, payload.categories || []),
    localStore.set(STORAGE_KEYS.PLATFORMS, payload.platforms || []),
    localStore.set(STORAGE_KEYS.MODELS, payload.models || []),
    localStore.set(STORAGE_KEYS.TAGS, payload.tags || []),
  ]);
};

// --- 同步核心逻辑 ---
const handlePush = async () => {
  const isOk = await confirm(
    "确定将本地数据推送到云端吗？这将覆盖云端原有数据。",
    "上云确认",
    "info",
  );
  if (!isOk) return;

  isSyncing.value = true;
  try {
    // 强制保存一次最新配置
    await saveSettings();

    // 1. 获取工厂实例
    const provider = SyncFactory.createProvider(
      formData.value.syncProvider,
      formData.value,
    );

    // 2. 测试连通性
    const isConnected = await provider.testConnection();
    if (!isConnected)
      throw new Error("连通性测试失败，请检查您的 Token 或网络配置");

    // 3. 打包本地数据
    const payload = await packLocalData();

    // 4. 执行推送
    const resultId = await provider.pushData(payload);

    // 5. 如果是 Github 新建的 Gist，回填 ID
    if (
      formData.value.syncProvider === "github" &&
      resultId &&
      typeof resultId === "string"
    ) {
      if (formData.value.githubSync.gistId !== resultId) {
        formData.value.githubSync.gistId = resultId;
        await saveSettings();
      }
    }

    success("🎉 数据已成功推送至云端！");
  } catch (err: any) {
    error(err.message || "上传云端失败，请检查配置");
  } finally {
    isSyncing.value = false;
  }
};

const handlePull = async () => {
  const isOk = await confirm(
    "确定从云端拉取数据吗？警告：这将会完全覆盖您的本地数据！此操作不可逆！",
    "高危操作：覆盖本地",
    "danger",
  );
  if (!isOk) return;

  isSyncing.value = true;
  try {
    await saveSettings();

    // 1. 获取工厂实例
    const provider = SyncFactory.createProvider(
      formData.value.syncProvider,
      formData.value,
    );

    // 2. 执行拉取
    const payload = await provider.pullData();

    // 3. 覆盖本地
    await unpackToLocal(payload);

    success("☁️ 云端数据已成功拉取并覆盖本地！");
    setTimeout(() => window.location.reload(), 1500);
  } catch (err: any) {
    error(err.message || "拉取数据失败，请检查配置");
  } finally {
    isSyncing.value = false;
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
