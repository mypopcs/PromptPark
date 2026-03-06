<template>
  <div
    :class="[
      'w-full',
      label && !labelInside && !isRadio && labelPosition === 'horizontal'
        ? 'flex items-center gap-4'
        : '',
    ]"
  >
    <label
      v-if="label && !labelInside && !isRadio"
      :class="[
        'label',
        labelPosition === 'horizontal'
          ? 'w-32 shrink-0 font-medium text-sm'
          : 'font-medium text-sm mb-1',
      ]"
    >
      <span>
        {{ label }}
        <span v-if="required" class="text-error">*</span>
      </span>
    </label>
    <div
      :class="[
        label && !labelInside && !isRadio && labelPosition === 'horizontal'
          ? 'flex-1'
          : '',
      ]"
    >
      <!-- 输入框 -->
      <div class="relative" v-if="!isTextarea && !isToggle && !isRadio">
        <i
          v-if="searchIcon"
          :class="[
            'absolute top-1/2 -translate-y-1/2 text-base-content/50',
            sizeClasses.iconLeft,
          ]"
          class="ri-search-line"
        ></i>
        <span
          v-if="labelInside"
          :class="[
            'absolute top-1/2 -translate-y-1/2 text-base-content/50 pointer-events-none',
            sizeClasses.labelInside,
          ]"
        >
          {{ label }}
        </span>
        <input
          :type="type"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :maxlength="maxlength"
          :minlength="minlength"
          :min="min"
          :max="max"
          :step="step"
          :pattern="pattern"
          :autocomplete="autocomplete"
          :autofocus="autofocus"
          :value="modelValue === undefined ? '' : String(modelValue)"
          @input="handleInput"
          :class="[
            baseInputClass,
            ghost ? ghostClass : defaultClass,
            sizeClasses.input,
            searchIcon ? sizeClasses.iconPadding : '',
            labelInside ? sizeClasses.labelPadding : '',
            inputClass,
          ]"
        />
      </div>
      <!-- 文本域 -->
      <textarea
        v-else-if="isTextarea"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :minlength="minlength"
        :rows="rows"
        :cols="cols"
        :wrap="wrap"
        :autocomplete="autocomplete"
        :autofocus="autofocus"
        :value="String(modelValue)"
        @input="handleInput"
        :class="[
          baseInputClass,
          ghost ? ghostClass : defaultClass,
          sizeClasses.input,
          'resize-none',
          inputClass,
        ]"
      ></textarea>
      <!-- 切换开关 -->
      <div
        v-else-if="isToggle"
        class="cursor-pointer label flex gap-4 justify-start p-4 bg-base-200/30 rounded-xl border border-base-200"
      >
        <input
          type="checkbox"
          :checked="Boolean(modelValue)"
          @change="handleToggle"
          class="toggle toggle-success"
        />
      </div>
      <!-- 单选框 -->
      <div v-else-if="isRadio" class="flex flex-wrap gap-4">
        <label
          v-for="option in radioOptions"
          :key="option.value"
          :class="['label cursor-pointer gap-2', sizeClasses.radioLabel]"
        >
          <input
            type="radio"
            :name="radioName"
            :value="option.value"
            :checked="modelValue === option.value"
            :disabled="disabled"
            @change="handleRadioChange(option.value)"
            :class="['radio radio-primary', sizeClasses.radioInput]"
          />
          <span class="label-text">{{ option.label }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface RadioOption {
  label: string;
  value: string | number;
}

interface Props {
  modelValue: string | number | boolean | undefined;
  label?: string;
  helpText?: string;
  required?: boolean;
  trim?: boolean;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  maxlength?: number;
  minlength?: number;
  min?: number;
  max?: number;
  step?: number | string;
  pattern?: string;
  autocomplete?: string;
  autofocus?: boolean;
  value?: string | number | boolean | undefined;
  rows?: number;
  cols?: number;
  wrap?: string;
  inputClass?: string;
  labelInside?: boolean;
  ghost?: boolean;
  searchIcon?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  labelPosition?: "vertical" | "horizontal";
  radioOptions?: RadioOption[];
  radioName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  trim: false,
  type: "text",
  rows: 3,
  inputClass: "",
  labelInside: false,
  ghost: false,
  searchIcon: false,
  size: "md",
  labelPosition: "vertical",
  radioOptions: () => [],
  radioName: "radio-group",
});

const emit = defineEmits(["update:modelValue"]);

const isTextarea = computed(() => props.type === "textarea");
const isToggle = computed(() => props.type === "toggle");
const isRadio = computed(() => props.type === "radio");

const baseInputClass =
  "w-full outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

const defaultClass =
  "bg-base-200/30 border border-base-300 rounded-lg hover:border-primary/50 hover:bg-base-200/50 focus:border-primary";

const ghostClass =
  "bg-transparent border-b border-base-300 hover:border-primary/50 focus:border-primary";

const sizeClasses = computed(() => {
  const sizes = {
    xs: {
      input: "px-2 py-1 text-xs",
      iconLeft: "left-2 text-xs",
      iconPadding: "pl-7",
      labelInside: "left-2 text-xs",
      labelPadding: "pl-12",
      radioInput: "radio-xs",
      radioLabel: "text-xs",
    },
    sm: {
      input: "px-3 py-1.5 text-sm",
      iconLeft: "left-3 text-sm",
      iconPadding: "pl-9",
      labelInside: "left-3 text-sm",
      labelPadding: "pl-14",
      radioInput: "radio-sm",
      radioLabel: "text-sm",
    },
    md: {
      input: "px-4 py-2.5 text-base",
      iconLeft: "left-3 text-base",
      iconPadding: "pl-10",
      labelInside: "left-3 text-sm",
      labelPadding: "pl-16",
      radioInput: "radio-md",
      radioLabel: "text-base",
    },
    lg: {
      input: "px-5 py-3 text-lg",
      iconLeft: "left-4 text-lg",
      iconPadding: "pl-12",
      labelInside: "left-4 text-base",
      labelPadding: "pl-20",
      radioInput: "radio-lg",
      radioLabel: "text-lg",
    },
  };
  return sizes[props.size];
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  let value = target.value;

  if (props.trim) {
    value = value.trim();
  }

  emit("update:modelValue", value);
};

const handleToggle = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.checked);
};

const handleRadioChange = (value: string | number) => {
  emit("update:modelValue", value);
};
</script>
