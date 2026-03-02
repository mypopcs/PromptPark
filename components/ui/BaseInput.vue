<template>
  <div class="w-full">
    <label class="label" v-if="label">
      <span class="label-text font-medium text-sm mb-1">
        {{ label }}
        <span v-if="required" class="text-error">*</span>
      </span>
    </label>

    <input
      v-if="!isTextarea && !isToggle"
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
      :value="modelValue"
      @input="handleInput"
      class="input input-bordered w-full"
    />

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
      :value="modelValue"
      @input="handleInput"
      class="textarea textarea-bordered w-full"
    ></textarea>
    <!-- switch切换按钮 -->
    <div
      v-else-if="isToggle"
      class="cursor-pointer label flex gap-4 justify-start p-4 bg-base-200/30 rounded-xl border border-base-200"
    >
      <input
        type="checkbox"
        @change="handleToggle"
        class="toggle toggle-success"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

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
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  trim: false,
  type: "text",
  rows: 3,
});

const emit = defineEmits(["update:modelValue"]);

const isTextarea = computed(() => props.type === "textarea");
const isToggle = computed(() => props.type === "toggle");

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
</script>
