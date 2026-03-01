<template>
  <div class="relative w-full" ref="containerRef">
    <div 
      class="input input-bordered flex flex-wrap items-center gap-1 h-auto min-h-[3rem] py-1.5 cursor-text focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-base-content/20"
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
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-3 h-3 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </span>

      <input
        ref="inputRef"
        v-model.trim="inputValue"
        type="text"
        :placeholder="selectedItems.length === 0 ? placeholder : ''"
        class="flex-1 min-w-[120px] bg-transparent outline-none border-none text-sm p-1 text-base-content placeholder:text-base-content/40"
        @focus="isDropdownOpen = true"
        @keydown.enter.prevent="handleEnter"
        @keydown.backspace="handleBackspace"
      />
    </div>

    <ul 
      v-show="isDropdownOpen && (filteredOptions.length > 0 || (inputValue && allowCreate && !exactMatch))"
      class="menu dropdown-content bg-base-100 rounded-box z-[100] w-full shadow-lg absolute top-full mt-2 max-h-60 overflow-y-auto border border-base-200"
    >
      <li v-for="opt in filteredOptions" :key="opt.id">
        <a @click.stop="selectOption(opt.id)">
          {{ opt.name }}
        </a>
      </li>
      
      <li v-if="inputValue && allowCreate && !exactMatch">
        <a @click.stop="handleEnter" class="text-primary font-medium flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          按回车创建 "{{ inputValue }}"
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

// 定义选项的基础接口 (只需 id 和 name 即可满足绝大多数情况)
export interface BaseOption {
  id: string;
  name: string;
  [key: string]: any; // 兼容携带其他属性的对象
}

const props = withDefaults(defineProps<{
  modelValue: string[]; // 绑定的已选 ID 数组
  options: BaseOption[]; // 所有可选的数据源
  placeholder?: string;
  allowCreate?: boolean; // 是否允许输入不存在的内容进行创建
}>(), {
  placeholder: '请选择或输入...',
  allowCreate: true,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
  // 当用户回车创建新项时触发，向外抛出新名称，让父组件去数据库落盘并返回新选项
  (e: 'create', name: string): void; 
}>();

const containerRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

const inputValue = ref('');
const isDropdownOpen = ref(false);

// 将选中的 ID 映射回完整的选项对象，用于渲染蓝色小 Badge
const selectedItems = computed(() => {
  return props.modelValue
    .map(id => props.options.find(opt => opt.id === id))
    .filter(Boolean) as BaseOption[];
});

// 过滤出 未被选中 且 包含输入关键字 的选项
const filteredOptions = computed(() => {
  const kw = inputValue.value.toLowerCase();
  return props.options.filter(opt => {
    const isNotSelected = !props.modelValue.includes(opt.id);
    const matchesSearch = opt.name.toLowerCase().includes(kw);
    return isNotSelected && matchesSearch;
  });
});

// 判断当前输入的内容是否已经完全等于某个已有选项（忽略大小写）
const exactMatch = computed(() => {
  if (!inputValue.value) return false;
  const kw = inputValue.value.toLowerCase();
  return props.options.some(opt => opt.name.toLowerCase() === kw);
});

// --- 核心交互逻辑 ---

const focusInput = () => {
  inputRef.value?.focus();
  isDropdownOpen.value = true;
};

const selectOption = (id: string) => {
  if (!props.modelValue.includes(id)) {
    emit('update:modelValue', [...props.modelValue, id]);
  }
  inputValue.value = '';
  inputRef.value?.focus(); // 选中后保持聚焦，方便继续选
};

const removeOption = (id: string) => {
  emit('update:modelValue', props.modelValue.filter(val => val !== id));
};

const handleEnter = () => {
  if (!inputValue.value) return;

  // 1. 如果输入的内容完美匹配了已有的某个选项，直接选中它
  const matchedOpt = props.options.find(opt => opt.name.toLowerCase() === inputValue.value.toLowerCase());
  if (matchedOpt) {
    selectOption(matchedOpt.id);
    return;
  }

  // 2. 如果不匹配任何现有选项，且允许创建，则抛出创建事件
  if (props.allowCreate) {
    emit('create', inputValue.value);
    inputValue.value = ''; // 清空输入框，等待父组件将新数据塞入 options 并选中
  }
};

const handleBackspace = () => {
  // 如果输入框为空，且按了退格键，则删除最后一个选中的项
  if (inputValue.value === '' && props.modelValue.length > 0) {
    const newValues = [...props.modelValue];
    newValues.pop();
    emit('update:modelValue', newValues);
  }
};

// --- 点击外部关闭下拉菜单 ---
const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>