<template>
  <div
    :class="[
      'w-full relative',
      label && labelPosition === 'horizontal' ? 'flex items-center gap-4' : '',
    ]"
  >
    <label
      v-if="label"
      :class="[
        'label',
        labelPosition === 'horizontal'
          ? 'shrink-0 font-medium text-sm text-right' // 核心修改：text-right 右对齐 + pr-2 右侧内边距
          : 'font-medium text-sm mb-1',
      ]"
    >
      <span>
        {{ label }}
        <span v-if="required" class="text-error">*</span>
      </span>
    </label>
    <div :class="[label && labelPosition === 'horizontal' ? 'flex-1' : '']">
      <div
        class="relative"
        ref="selectContainer"
        :style="{
          width: selectWidth || '100%',
          minWidth: '160px',
        }"
      >
        <!-- 触发按钮 -->
        <button
          type="button"
          :disabled="disabled || readonly"
          :class="[
            'w-full flex items-center justify-between bg-base-200/30 border border-base-300 rounded-lg hover:border-primary/50 hover:bg-base-200/50 focus:border-primary focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
            sizeClasses.input,
          ]"
          @click="toggleDropdown"
        >
          <!-- 多选模式：显示 tag -->
          <div
            v-if="props.multiple"
            class="flex flex-wrap items-center gap-1 flex-1 text-left"
          >
            <template v-if="selectedOptions.length > 0">
              <!-- 第一个 tag -->
              <BaseTag
                :label="selectedOptions[0].label"
                :value="selectedOptions[0].value"
                variant="neutral"
                size="small"
                :closable="true"
                @close="removeOption"
              />
              <!-- 超过1个时显示数字标签 -->
              <BaseTag
                v-if="selectedOptions.length > 1"
                :label="`+${selectedOptions.length - 1}`"
                variant="neutral"
                size="small"
                :closable="false"
              />
            </template>
            <span v-else class="text-base-content/50">
              {{ placeholder || "请选择" }}
            </span>
          </div>
          <!-- 单选模式：显示文本 -->
          <div v-else class="flex-1 text-left">
            <span v-if="selectedLabel">
              {{ selectedLabel }}
            </span>
            <span v-else class="text-base-content/50">
              {{ placeholder || "请选择" }}
            </span>
          </div>
          <i
            class="ri-arrow-down-s-line text-base-content/50 transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"
          ></i>
        </button>

        <!-- 下拉面板 - 使用 Teleport 传送到 body -->
        <Teleport to="body">
          <div
            v-if="isOpen"
            :style="{
              position: 'fixed',
              left: dropdownStyle.left,
              top: dropdownStyle.top,
              width: dropdownStyle.width,
            }"
            class="bg-base-100 border border-base-300 rounded-lg shadow-lg z-5000 max-h-60 overflow-y-auto"
          >
            <!-- 选项列表 -->
            <div class="py-1">
              <button
                v-for="option in options"
                :key="option.value"
                type="button"
                :class="[
                  'w-full text-left hover:bg-base-200 transition-colors duration-200',
                  sizeClasses.input,
                  {
                    'bg-primary/10 text-primary': props.multiple
                      ? Array.isArray(props.modelValue) &&
                        (props.modelValue as (string | number)[]).includes(
                          option.value,
                        )
                      : props.modelValue === option.value,
                  },
                ]"
                @click="selectOption(option.value)"
              >
                <div class="flex items-center justify-between w-full">
                  <!-- 左侧主文本 -->
                  <span>{{ option.label }}</span>
                  <!-- 右侧提示文本 + 选中图标 -->
                  <div class="flex items-center gap-2">
                    <!-- 选项右侧提示文字 -->
                    <span
                      v-if="option.tip"
                      class="text-xs text-base-content/60"
                    >
                      {{ option.tip }}
                    </span>
                    <!-- 选中状态图标 -->
                    <i
                      v-if="
                        props.multiple
                          ? Array.isArray(props.modelValue) &&
                            (props.modelValue as (string | number)[]).includes(
                              option.value,
                            )
                          : props.modelValue === option.value
                      "
                      class="ri-check-line text-primary"
                    ></i>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </Teleport>
      </div>

      <p v-if="helpText" class="text-xs text-base-content/50 mt-2">
        {{ helpText }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import BaseTag from "./BaseTag.vue";

// 扩展Option接口，新增tip字段
interface Option {
  value: string | number;
  label: string;
  tip?: string; // 新增：选项右侧提示文字
}

interface Props {
  modelValue: string | number | (string | number)[];
  label?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  multiple?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  placeholder?: string;
  labelPosition?: "vertical" | "horizontal";
  selectWidth?: string;
  options: readonly Option[];
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  readonly: false,
  multiple: false,
  size: "md",
  labelPosition: "vertical",
  selectWidth: "",
});

const emit = defineEmits(["update:modelValue", "change"]);

const sizeClasses = computed(() => {
  const sizes = {
    xs: {
      input: "px-2 py-1 text-xs",
    },
    sm: {
      input: "px-3 py-1.5 text-sm",
    },
    md: {
      input: "px-4 py-2.5 text-base",
    },
    lg: {
      input: "px-5 py-3 text-lg",
    },
  };
  return sizes[props.size];
});

const isOpen = ref(false);
const selectContainer = ref<HTMLElement | null>(null);
const dropdownStyle = ref({
  left: "0px",
  top: "0px",
  width: "0px",
});

const selectedOptions = computed(() => {
  if (props.multiple) {
    let values: (string | number)[];
    if (Array.isArray(props.modelValue)) {
      values = props.modelValue as (string | number)[];
    } else if (props.modelValue !== undefined && props.modelValue !== null) {
      values = [props.modelValue];
    } else {
      values = [];
    }
    return props.options.filter((opt) => values.includes(opt.value));
  } else {
    const option = props.options.find((opt) => opt.value === props.modelValue);
    return option ? [option] : [];
  }
});

const selectedLabel = computed(() => {
  if (props.multiple) {
    const options = selectedOptions.value;
    if (options.length === 0) return "";
    if (options.length === 1) return options[0].label;
    return `${options[0].label} +${options.length - 1}`;
  } else {
    const option = props.options.find((opt) => opt.value === props.modelValue);
    return option?.label || "";
  }
});

const toggleDropdown = async () => {
  if (props.disabled || props.readonly) return;
  isOpen.value = !isOpen.value;

  if (isOpen.value) {
    await nextTick();
    updateDropdownPosition();
  }
};

const updateDropdownPosition = () => {
  if (!selectContainer.value) return;

  const rect = selectContainer.value.getBoundingClientRect();

  dropdownStyle.value = {
    left: `${rect.left}px`,
    top: `${rect.bottom}px`,
    width: `${rect.width}px`,
  };
};

const selectOption = (value: string | number) => {
  if (props.multiple) {
    let currentValue: (string | number)[];
    if (Array.isArray(props.modelValue)) {
      currentValue = [...(props.modelValue as (string | number)[])];
    } else if (props.modelValue !== undefined && props.modelValue !== null) {
      // 处理字符串或数字类型的 modelValue
      currentValue = [props.modelValue];
    } else {
      currentValue = [];
    }
    const index = currentValue.indexOf(value);

    if (index === -1) {
      // 添加选项
      currentValue.push(value);
    } else {
      // 移除选项
      currentValue.splice(index, 1);
    }

    emit("update:modelValue", currentValue);
    emit("change", currentValue);
  } else {
    emit("update:modelValue", value);
    emit("change", value);
    isOpen.value = false;
  }
};

const removeOption = (value: string | number) => {
  if (props.multiple) {
    let currentValue: (string | number)[];
    if (Array.isArray(props.modelValue)) {
      currentValue = [...(props.modelValue as (string | number)[])];
    } else if (props.modelValue !== undefined && props.modelValue !== null) {
      currentValue = [props.modelValue];
    } else {
      currentValue = [];
    }
    const index = currentValue.indexOf(value);

    if (index !== -1) {
      currentValue.splice(index, 1);
      emit("update:modelValue", currentValue);
      emit("change", currentValue);
    }
  }
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!selectContainer.value?.contains(target)) {
    isOpen.value = false;
  }
};

const handleResize = () => {
  if (isOpen.value) {
    updateDropdownPosition();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("resize", handleResize);
});
</script>
