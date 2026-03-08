<template>
  <Dialog
    v-model:visible="isVisible"
    :header="mode === 'edit' ? '编辑AI平台与模型' : '新增AI平台与模型'"
    :style="{ width: '500px' }"
    :modal="true"
  >
    <div class="space-y-6">
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">
          AI平台 <span class="text-red-500">*</span>
        </label>
        <InputText v-model="formData.name" placeholder="例如: ChatGPT" />
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">关联模型</label>
        <MultiSelect
          v-model="selectedModelIds"
          :options="currentPlatformModels"
          optionLabel="name"
          optionValue="id"
          placeholder="输入新模型名称并回车..."
          editable
          :showToggleAll="false"
        />
      </div>
    </div>
    <template #footer>
      <Button text severity="secondary" @click="isVisible = false">取消</Button>
      <Button @click="handleSave">提交</Button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { localStore } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config";
import { createDefaultPlatform, createDefaultModel } from "@/utils/factories";
import { useMessage } from "@/composables/useMessage";
import type { PlatformItem, AIModelItem } from "@/types";

const props = defineProps<{
  modelValue: boolean;
  mode: "create" | "edit";
  initialData?: PlatformItem;
}>();

const emit = defineEmits(["update:modelValue", "save"]);
const { warning } = useMessage();

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const formData = ref<PlatformItem>(createDefaultPlatform());
const currentPlatformModels = ref<AIModelItem[]>([]);
const selectedModelIds = ref<string[]>([]);
const allModelsCache = ref<AIModelItem[]>([]);

watch(
  () => props.modelValue,
  async (newVal) => {
    if (newVal) {
      const allModels =
        (await localStore.get<AIModelItem[]>(STORAGE_KEYS.MODELS, [])) || [];
      allModelsCache.value = allModels;

      if (props.mode === "edit" && props.initialData) {
        formData.value = JSON.parse(JSON.stringify(props.initialData));
        const pModels = allModels.filter(
          (m) => m.platformId === formData.value.id,
        );
        currentPlatformModels.value = [...pModels];
        selectedModelIds.value = pModels.map((m) => m.id);
      } else {
        formData.value = createDefaultPlatform();
        currentPlatformModels.value = [];
        selectedModelIds.value = [];
      }
    }
  },
);

const handleSave = async () => {
  if (!formData.value.name) {
    warning("请填写AI平台");
    return;
  }

  formData.value.modelCount = selectedModelIds.value.length;
  if (props.mode === "create") formData.value.createdAt = Date.now();

  const otherModels = allModelsCache.value.filter(
    (m) => m.platformId !== formData.value.id,
  );
  const selectedModelsToSave = currentPlatformModels.value.filter((m) =>
    selectedModelIds.value.includes(m.id),
  );
  const finalModels = [...otherModels, ...selectedModelsToSave];

  emit("save", {
    platformData: formData.value,
    modelsData: finalModels,
  });
  isVisible.value = false;
};
</script>
