<template>
  <div class="w-full" ref="containerRef">
    <label class="label" v-if="label">
      <span class="label-text font-medium text-sm mb-1">
        {{ label }}
        <span v-if="required" class="text-error">*</span>
      </span>
    </label>
    <div
      ref="inputWrapperRef"
      class="input input-bordered flex flex-wrap w-full items-center gap-1 py-1.5 cursor-text focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-base-content/20"
      @click="focusInput"
    >
      <span
        v-for="item in selectedItems"
        :key="item.id"
        class="badge badge-primary badge-sm gap-1 pl-2 pr-1 py-3"
      >
        {{ item.name }}
        <button
          @click.stop="removeOption(item.id)"
          class="btn btn-ghost btn-xs btn-circle h-4 w-4 min-h-0 text-primary-content hover:bg-primary-focus"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="inline-block w-3 h-3 stroke-current"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </span>

      <input
        ref="inputRef"
        v-model.trim="inputValue"
        type="text"
        :placeholder="selectedItems.length === 0 ? placeholder : ''"
        class="flex-1 min-w-[120px] bg-transparent outline-none border-none text-sm p-1 text-base-content placeholder:text-base-content/40"
        @focus="openDropdown"
        @keydown.enter.prevent="handleEnter"
        @keydown.backspace="handleBackspace"
      />
    </div>

    <Teleport to="body">
      <ul
        v-show="isDropdownOpen && showDropdownContent"
        ref="dropdownRef"
        class="menu bg-base-100 rounded-box shadow-xl fixed overflow-y-auto border border-base-200"
        :style="dropdownStyle"
      >
        <li v-for="opt in filteredOptions" :key="opt.id">
          <a @click.stop="selectOption(opt.id)">
            {{ opt.name }}
          </a>
        </li>

        <li v-if="inputValue && allowCreate && !exactMatch">
          <span
            @click.stop="handleEnter"
            class="text-gray-500 text-sm flex items-center gap-2"
          >
            <svg
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
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            按回车创建 "{{ inputValue }}"
          </span>
        </li>
      </ul>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";

export interface BaseOption {
  id: string;
  name: string;
  [key: string]: any;
}

const props = withDefaults(
  defineProps<{
    modelValue: string[];
    options: BaseOption[];
    placeholder?: string;
    allowCreate?: boolean;
    label?: string;
    required?: boolean;
  }>(),
  {
    placeholder: "请选择或输入...",
    allowCreate: true,
    required: false,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string[]): void;
  (e: "create", name: string): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
const inputWrapperRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);

const inputValue = ref("");
const isDropdownOpen = ref(false);
const dropdownStyle = ref({
  top: "0px",
  left: "0px",
  width: "0px",
  zIndex: 99999,
});

const showDropdownContent = computed(() => {
  return (
    filteredOptions.value.length > 0 ||
    (inputValue.value && props.allowCreate && !exactMatch.value)
  );
});

const safeOptions = computed<BaseOption[]>(() => {
  if (Array.isArray(props.options)) return props.options;
  if (props.options && typeof props.options === "object") {
    return Object.values(props.options) as BaseOption[];
  }
  return [];
});

const selectedItems = computed(() => {
  if (!Array.isArray(props.modelValue)) return [];

  return props.modelValue
    .map((id) => safeOptions.value.find((opt) => opt.id === id))
    .filter((item): item is BaseOption => Boolean(item));
});

const filteredOptions = computed(() => {
  const list = safeOptions.value;
  if (!inputValue.value) return list;

  const query = inputValue.value.toLowerCase();
  return list.filter((opt: BaseOption) =>
    opt.name.toLowerCase().includes(query),
  );
});

const exactMatch = computed(() => {
  if (!inputValue.value) return false;
  const kw = inputValue.value.toLowerCase();
  return props.options.some((opt) => opt.name.toLowerCase() === kw);
});

const updateDropdownPosition = () => {
  if (!inputWrapperRef.value) return;

  const rect = inputWrapperRef.value.getBoundingClientRect();
  dropdownStyle.value = {
    top: `${rect.bottom + 8}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: 99999,
  };
};

const openDropdown = () => {
  isDropdownOpen.value = true;
  nextTick(() => {
    updateDropdownPosition();
  });
};

const focusInput = () => {
  inputRef.value?.focus();
  openDropdown();
};

const selectOption = (id: string) => {
  if (!props.modelValue.includes(id)) {
    emit("update:modelValue", [...props.modelValue, id]);
  }
  inputValue.value = "";
  inputRef.value?.focus();
};

const removeOption = (id: string) => {
  emit(
    "update:modelValue",
    props.modelValue.filter((val) => val !== id),
  );
};

const handleEnter = () => {
  if (!inputValue.value) return;

  const matchedOpt = props.options.find(
    (opt) => opt.name.toLowerCase() === inputValue.value.toLowerCase(),
  );
  if (matchedOpt) {
    selectOption(matchedOpt.id);
    return;
  }

  if (props.allowCreate) {
    emit("create", inputValue.value);
    inputValue.value = "";
  }
};

const handleBackspace = () => {
  if (inputValue.value === "" && props.modelValue.length > 0) {
    const newValues = [...props.modelValue];
    newValues.pop();
    emit("update:modelValue", newValues);
  }
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (
    containerRef.value &&
    !containerRef.value.contains(target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(target)
  ) {
    isDropdownOpen.value = false;
  }
};

const handleScroll = () => {
  if (isDropdownOpen.value) {
    updateDropdownPosition();
  }
};

watch(isDropdownOpen, (open) => {
  if (open) {
    nextTick(() => {
      updateDropdownPosition();
    });
  }
});

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
  window.addEventListener("scroll", handleScroll, true);
  window.addEventListener("resize", updateDropdownPosition);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
  window.removeEventListener("scroll", handleScroll, true);
  window.removeEventListener("resize", updateDropdownPosition);
});
</script>
