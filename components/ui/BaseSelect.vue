<template>
  <div class="w-full">
    <label class="label" v-if="label">
      <span class="label-text font-medium text-sm mb-1">
        {{ label }}
        <span v-if="required" class="text-error">*</span>
      </span>
    </label>

    <select
      :value="modelValue"
      :disabled="disabled"
      :readonly="readonly"
      :multiple="multiple"
      :size="size"
      class="select select-bordered w-full bg-base-100"
      @change="handleChange"
    >
      <option v-if="placeholder" :value="''" disabled>
        {{ placeholder }}
      </option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <p v-if="helpText" class="text-xs text-base-content/50 mt-2">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Option {
  value: string | number;
  label: string;
}

interface Props {
  modelValue: string | number | (string | number)[];
  label?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  multiple?: boolean;
  size?: number;
  placeholder?: string;
  options: Option[];
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  readonly: false,
  multiple: false,
  size: 1,
});

const emit = defineEmits(["update:modelValue", "change"]);

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  let value: string | number | (string | number)[];

  if (props.multiple) {
    value = Array.from(target.selectedOptions).map((option) => {
      const optValue = option.value;
      return isNaN(Number(optValue)) ? optValue : Number(optValue);
    });
  } else {
    const optValue = target.value;
    value = isNaN(Number(optValue)) ? optValue : Number(optValue);
  }

  emit("update:modelValue", value);
  emit("change", value);
};
</script>
