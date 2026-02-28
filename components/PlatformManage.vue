<template>
  <div class="grid grid-cols-12 gap-6">
    <div class="col-span-12 lg:col-span-5 space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-bold">AI 平台</h2>
        <button class="btn btn-sm btn-primary" @click="openPlatformModal()">
          添加平台
        </button>
      </div>
      <div
        class="bg-base-100 border border-base-200 rounded-box overflow-hidden"
      >
        <table class="table w-full">
          <thead>
            <tr>
              <th>平台名称</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in platforms"
              :key="p.id"
              class="hover cursor-pointer"
              :class="{ 'bg-primary/10': selectedPlatformId === p.id }"
              @click="selectedPlatformId = p.id"
            >
              <td>{{ p.name }}</td>
              <td>
                <button
                  class="btn btn-ghost btn-xs text-error"
                  @click.stop="deletePlatform(p.id)"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="col-span-12 lg:col-span-7 space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-bold">
          {{
            selectedPlatform
              ? `[${selectedPlatform.name}] 对应模型`
              : "选择平台以管理模型"
          }}
        </h2>
        <button
          v-if="selectedPlatform"
          class="btn btn-sm btn-secondary"
          @click="openModelModal()"
        >
          添加模型
        </button>
      </div>
      <div
        v-if="selectedPlatform"
        class="bg-base-100 border border-base-200 rounded-box"
      >
        <table class="table w-full">
          <thead>
            <tr>
              <th>模型名称</th>
              <th>关联提示词数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in currentModels" :key="m.id">
              <td>{{ m.name }}</td>
              <td>{{ m.promptNum }}</td>
              <td>
                <button
                  class="btn btn-ghost btn-xs text-error"
                  @click="deleteModel(m.id)"
                >
                  移除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-else
        class="h-48 flex items-center justify-center text-base-content/40 bg-base-200/30 rounded-box italic"
      >
        请选择平台
      </div>
    </div>

    <dialog ref="modalRef" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">{{ modalTitle }}</h3>
        <input
          v-model="tempName"
          type="text"
          class="input input-bordered w-full"
          placeholder="输入名称"
        />
        <div class="modal-action">
          <button class="btn" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="handleModalSave">保存</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useConfirm } from "@/composables/useConfirm";
import {
  getPlatforms,
  savePlatforms,
  getModels,
  saveModels,
} from "@/utils/storage";
import type { AIPlatform, AIModel } from "@/types";

const { openConfirm } = useConfirm();

const platforms = ref<AIPlatform[]>([]);
const allModels = ref<AIModel[]>([]);
const selectedPlatformId = ref<string | null>(null);
const modalRef = ref<HTMLDialogElement | null>(null);
const modalType = ref<"platform" | "model">("platform");
const tempName = ref("");

const selectedPlatform = computed(() =>
  platforms.value.find((p) => p.id === selectedPlatformId.value),
);
const currentModels = computed(() => {
  if (!selectedPlatform.value) return [];
  return allModels.value.filter((m) =>
    selectedPlatform.value?.AIModelIds.includes(m.id),
  );
});
const modalTitle = computed(() =>
  modalType.value === "platform"
    ? "新增 AI 平台"
    : `为 ${selectedPlatform.value?.name} 新增模型`,
);

onMounted(async () => {
  const [p, m] = await Promise.all([getPlatforms(), getModels()]);
  platforms.value = Array.isArray(p) ? p : [];
  allModels.value = Array.isArray(m) ? m : [];
});

const openPlatformModal = () => {
  modalType.value = "platform";
  tempName.value = "";
  modalRef.value?.showModal();
};
const openModelModal = () => {
  modalType.value = "model";
  tempName.value = "";
  modalRef.value?.showModal();
};
const closeModal = () => modalRef.value?.close();

const handleModalSave = async () => {
  if (!tempName.value) return;
  if (modalType.value === "platform") {
    platforms.value.push({
      id: "plat_" + Date.now(),
      name: tempName.value,
      AIModelIds: [],
      promptNum: 0,
    });
    await savePlatforms(platforms.value);
  } else if (modalType.value === "model" && selectedPlatform.value) {
    const newModel = {
      id: "model_" + Date.now(),
      name: tempName.value,
      promptNum: 0,
    };
    allModels.value.push(newModel);
    selectedPlatform.value.AIModelIds.push(newModel.id);
    await Promise.all([
      saveModels(allModels.value),
      savePlatforms(platforms.value),
    ]);
  }
  closeModal();
};

/**
 * 危险删除二次确认。
 * 第一次确认用于避免误触，第二次确认用于再次提示不可恢复风险。
 */
const confirmDangerousDelete = async (targetName: string): Promise<boolean> => {
  const firstConfirm = await openConfirm("危险操作确认", `确定要删除${targetName}吗？`);
  if (!firstConfirm) return false;
  return openConfirm("再次确认", `删除后将无法恢复，请再次确认删除${targetName}`);
};

const deletePlatform = async (id: string) => {
  if (!(await confirmDangerousDelete("该平台"))) return;
  platforms.value = platforms.value.filter((p) => p.id !== id);
  await savePlatforms(platforms.value);
};

const deleteModel = async (modelId: string) => {
  if (!selectedPlatform.value) return;
  if (!(await confirmDangerousDelete("该模型"))) return;
  selectedPlatform.value.AIModelIds = selectedPlatform.value.AIModelIds.filter(
    (id) => id !== modelId,
  );
  await savePlatforms(platforms.value);
};
</script>
