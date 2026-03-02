<template>
  <ul
    class="menu p-4 w-60 min-h-full bg-base-200 text-base-content flex flex-col gap-1"
  >
    <li class="mb-4">
      <h2
        class="text-xl font-bold text-primary flex items-center gap-2 cursor-default pointer-events-none px-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        PromptPark
      </h2>
    </li>

    <li>
      <router-link to="/prompts" active-class="active"
        >✨ 提示词管理</router-link
      >
    </li>
    <li>
      <router-link to="/dictionaries" active-class="active"
        >📚 词典管理</router-link
      >
    </li>

    <div class="divider my-2"></div>

    <li>
      <router-link to="/settings" active-class="active"
        >⚙️ 插件与同步设置</router-link
      >
    </li>
    <li>
      <router-link to="/tags" active-class="active">🏷️ 标签管理</router-link>
    </li>
    <li>
      <router-link to="/platforms" active-class="active"
        >🌐 平台管理</router-link
      >
    </li>
  </ul>
</template>
