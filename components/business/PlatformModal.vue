<template>
  <BaseModal
    v-model="isVisible"
    :title="mode === 'edit' ? '编辑AI平台与模型' : '新增AI平台与模型'"
    confirmText="提交"
    @confirm="handleSave"
  >
    <div class="space-y-6">
      <BaseInput
        v-model="formData.name"
        label="AI平台"
        placeholder="例如: ChatGPT"
        :required="true"
        :trim="true"
        type="text"
      />
      <MultiSelectInput
        label="关联模型"
        v-model="selectedModelIds"
        :options="currentPlatformModels"
        placeholder="输入新模型名称并回车..."
        @create="handleCreateModel"
      />
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import MultiSelectInput from "@/components/ui/MultiSelectInput.vue";
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

const handleCreateModel = (name: string) => {
  const newModel = createDefaultModel(formData.value.id, name);
  currentPlatformModels.value.push(newModel);
  selectedModelIds.value.push(newModel.id);
};

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
