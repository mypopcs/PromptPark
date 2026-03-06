<template>
  <div
    class="max-w-6xl mx-auto animate-fade-in card bg-base-100 shadow-sm border border-base-200"
  >
    <section class="card-body border-b-2 border-base-300">
      <h2 class="card-title text-lg border-b border-base-200 pb-2 mb-4">
        全局设置
      </h2>
      <div class="grid grid-cols-2 gap-8">
        <BaseSelect
          v-model="formData.theme"
          label="主题外观"
          size="sm"
          :options="THEME_OPTIONS"
          @change="saveSettings"
        />
      </div>
    </section>
    <section class="card-body border-b-2 border-base-300">
      <div
        class="flex justify-between items-center border-b border-base-200 pb-2 mb-4"
      >
        <h2 class="card-title text-lg flex items-center gap-2">图床设置</h2>
        <div class="flex items-center gap-2">
          <BaseSelect
            v-model="formData.imageHostProvider"
            size="sm"
            label="图床"
            labelPosition="horizontal"
            selectWidth="240px"
            :options="[
              { value: 'none', label: '不使用图床', tip: '以 Base64 本地存储' },
              { value: 'github', label: 'Github', tip: '推荐' },
            ]"
            @change="saveSettings"
            class="w-60"
          />
        </div>
      </div>
      <div class="flex justify-between items-center">
        <div
          v-if="formData.imageHostProvider === 'github'"
          class="space-y-4 animate-fade-in"
        >
          <BaseInput
            v-model.trim="formData.githubImageHost.token"
            type="password"
            size="sm"
            label="Github Token (必须包含 repo 权限)"
            placeholder="ghp_..."
            @blur="saveSettings"
          />
          <div class="grid grid-cols-3 gap-4">
            <BaseInput
              v-model.trim="formData.githubImageHost.repo"
              size="sm"
              label="仓库 (用户名/仓库名)"
              placeholder="zhangsan/images"
              @blur="saveSettings"
            />
            <BaseInput
              v-model.trim="formData.githubImageHost.branch"
              size="sm"
              label="分支"
              placeholder="master"
              @blur="saveSettings"
            />
            <BaseInput
              v-model.trim="formData.githubImageHost.path"
              size="sm"
              label="存储路径 (留空放根目录)"
              placeholder="prompts/"
              @blur="saveSettings"
            />
          </div>
          <p class="text-xs text-base-content/50 mt-2">
            提示：上传的图片将通过
            <b>jsDelivr CDN</b> 加速分发，请确保您的仓库是
            <b>Public (公开)</b> 的，否则无法正常显示图片。
            <a
              href="https://github.com/new"
              target="_blank"
              class="text-xs link link-primary font-normal"
              >去新建一个公开仓库</a
            >
          </p>
        </div>
      </div>
    </section>

    <section class="card-body border-b-2 border-base-300">
      <div
        class="flex justify-between items-center border-b border-base-200 pb-2 mb-4"
      >
        <h2 class="card-title text-lg flex items-center gap-2">数据同步</h2>
        <div class="flex items-center gap-2">
          <BaseSelect
            v-model="formData.syncProvider"
            size="sm"
            label="同步引擎"
            labelPosition="horizontal"
            selectWidth="240px"
            :options="[
              { value: 'none', label: '停用同步' },
              { value: 'feishu', label: '飞书多维表格' },
            ]"
            @change="saveSettings"
            class="w-60"
          />
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
        <BaseInput
          v-model.trim="formData.githubSync.token"
          type="password"
          label="Github Personal Access Token"
          placeholder="ghp_..."
          @blur="saveSettings"
          size="sm"
        >
          <template #label-append>
            <a
              href="https://github.com/settings/tokens/new"
              target="_blank"
              class="label-text-alt link link-primary"
              >获取 Token</a
            >
          </template>
        </BaseInput>
        <BaseInput
          v-model.trim="formData.githubSync.gistId"
          label="Gist ID (留空则自动创建)"
          @blur="saveSettings"
          size="sm"
          placeholder="ghs_......"
        />
      </div>

      <div
        v-if="formData.syncProvider === 'feishu'"
        class="space-y-4 animate-fade-in"
      >
        <div class="grid grid-cols-2 gap-4">
          <BaseInput
            v-model.trim="formData.feishuSync.appId"
            label="App ID"
            @blur="saveSettings"
            size="sm"
            placeholder="cli_......"
          />
          <BaseInput
            v-model.trim="formData.feishuSync.appSecret"
            type="password"
            label="App Secret"
            @blur="saveSettings"
            size="sm"
            placeholder="******"
          />
        </div>
        <BaseInput
          v-model.trim="formData.feishuSync.appToken"
          label="多维表格 App Token"
          help-text="URL 中 base/ 后面的字符"
          @blur="saveSettings"
          size="sm"
          placeholder="CXi......"
        />

        <div class="divider text-xs text-base-content/50">
          多表映射关系 (Table ID)
        </div>
        <div class="grid grid-cols-3 gap-4 bg-base-200/50 p-4 rounded-box">
          <BaseInput
            v-for="key in tableKeys"
            :key="key.id"
            v-model.trim="formData.feishuSync.mapping[key.id]"
            size="sm"
            :label="key.label"
            placeholder="tbl_......"
            @blur="saveSettings"
          />
        </div>
      </div>

      <div
        v-if="formData.syncProvider === 'notion'"
        class="space-y-4 animate-fade-in"
      >
        <BaseInput
          v-model.trim="formData.notionSync.token"
          type="password"
          label="Notion Integration Token"
          placeholder="secret_......"
          @blur="saveSettings"
          size="sm"
        />
        <div class="divider text-xs text-base-content/50">Database ID 映射</div>
        <div class="grid grid-cols-3 gap-4 bg-base-200/50 p-4 rounded-box">
          <BaseInput
            v-for="key in tableKeys"
            :key="key.id"
            v-model.trim="formData.notionSync.mapping[key.id]"
            size="sm"
            :label="key.label"
            @blur="saveSettings"
            placeholder="tbl_......"
          />
        </div>
      </div>

      <div
        v-if="formData.syncProvider !== 'none'"
        class="flex gap-4 mt-4 border-t border-base-200"
      >
        <BaseButton
          variant="primary"
          type="soft"
          size="md"
          :disabled="isSyncing"
          @click="handlePush"
        >
          <span
            v-if="isSyncing"
            class="loading loading-spinner loading-xs"
          ></span>
          上传并覆盖云端数据
        </BaseButton>
        <BaseButton
          variant="success"
          type="soft"
          size="md"
          :disabled="isSyncing"
          @click="handlePull"
        >
          <span
            v-if="isSyncing"
            class="loading loading-spinner loading-xs"
          ></span>
          下载并覆盖本地数据
        </BaseButton>
      </div>
    </section>

    <section class="card-body">
      <div class="card-body bg-error/5 border border-error/20">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="card-title text-lg text-error">清空本地所有数据</h2>
            <p class="text-xs text-error/70">
              将永久删除本地存储的所有提示词和设置，不可恢复。（不影响云端数据）
            </p>
          </div>
          <BaseButton variant="error" size="md" @click="handleClearData">
            <i class="ri-delete-bin-5-line text-lg"></i>
            清空数据
          </BaseButton>
        </div>
      </div>
    </section>
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
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import BaseTag from "@/components/ui/BaseTag.vue";
import BaseSelect from "@/components/ui/BaseSelect.vue";

const { setTheme, THEME_OPTIONS } = useTheme();
const { confirm } = useConfirm();
const { success, error } = useMessage();

const isSyncing = ref(false);

const tableKeys: { id: keyof TableMapping; label: string }[] = [
  { id: "promptsTableId", label: "提示词表 ID" },
  { id: "dictionariesTableId", label: "词典表 ID" },
  { id: "categoriesTableId", label: "分类表 ID" },
  { id: "platformsTableId", label: "平台表 ID" },
  { id: "modelsTableId", label: "模型表 ID" },
  { id: "tagsTableId", label: "标签表 ID" },
];

const formData = ref<AppSettings>(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)));

const loadSettings = async () => {
  const storedSettings = await syncStore.get<AppSettings>(
    STORAGE_KEYS.SETTINGS,
  );

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
  setTheme(formData.value.theme);
  await syncStore.set(STORAGE_KEYS.SETTINGS, formData.value);
};

onMounted(() => loadSettings());

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

const handlePush = async () => {
  const isOk = await confirm(
    "确定将本地数据推送到云端吗？这将覆盖云端原有数据。",
    "上云确认",
    "info",
  );
  if (!isOk) return;

  isSyncing.value = true;
  try {
    await saveSettings();

    const provider = SyncFactory.createProvider(
      formData.value.syncProvider,
      formData.value,
    );

    const isConnected = await provider.testConnection();
    if (!isConnected)
      throw new Error("连通性测试失败，请检查您的 Token 或网络配置");

    const payload = await packLocalData();

    const resultId = await provider.pushData(payload);

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

    const provider = SyncFactory.createProvider(
      formData.value.syncProvider,
      formData.value,
    );

    const payload = await provider.pullData();

    await unpackToLocal(payload);

    success("☁️ 云端数据已成功拉取并覆盖本地！");
    setTimeout(() => window.location.reload(), 1500);
  } catch (err: any) {
    error(err.message || "拉取数据失败，请检查配置");
  } finally {
    isSyncing.value = false;
  }
};

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
