<template>
  <div class="max-w-2xl mx-auto animate-fade-in pb-10">
    <div class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body">
        <h2 class="card-title text-xl mb-6 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          意见与反馈
        </h2>

        <div class="space-y-6">
          <div class="form-control">
            <label class="label"
              ><span class="label-text font-bold"
                >您对 PromptPark 的整体评价？</span
              ></label
            >
            <div class="rating rating-lg gap-2">
              <input
                v-for="i in 5"
                :key="i"
                type="radio"
                name="rating"
                class="mask mask-star-2 bg-warning"
                v-model="form.rating"
                :value="i"
              />
            </div>
          </div>

          <div class="form-control">
            <label class="label"
              ><span class="label-text font-bold">反馈类型</span></label
            >
            <div class="flex gap-4">
              <label
                class="label cursor-pointer gap-2"
                v-for="type in FEEDBACK_TYPES"
                :key="type"
              >
                <input
                  type="radio"
                  class="radio radio-primary radio-sm"
                  v-model="form.type"
                  :value="type"
                />
                <span class="label-text text-sm">{{ type }}</span>
              </label>
            </div>
          </div>

          <div class="form-control">
            <label class="label"
              ><span class="label-text font-bold">详细描述</span></label
            >
            <textarea
              v-model.trim="form.content"
              class="textarea textarea-bordered h-32 leading-relaxed"
              placeholder="请描述您遇到的问题或建议，我们将尽快改进..."
            ></textarea>
          </div>

          <div class="form-control">
            <label class="label"
              ><span class="label-text font-bold">联系方式 (可选)</span></label
            >
            <input
              v-model.trim="form.contact"
              type="text"
              class="input input-bordered"
              placeholder="邮箱、微信号或 QQ，方便我们回访"
            />
          </div>

          <div class="pt-4">
            <button
              class="btn btn-primary w-full shadow-lg shadow-primary/20"
              :disabled="isSubmitting || !form.content"
              @click="submitFeedback"
            >
              <span v-if="isSubmitting" class="loading loading-spinner"></span>
              {{ isSubmitting ? "正在提交同步至飞书..." : "提交反馈" }}
            </button>
            <p
              class="text-[10px] text-center mt-4 opacity-30 uppercase tracking-widest"
            >
              Powered by Feishu Bitable Sync Engine
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useMessage } from "@/composables/useMessage";
import { FeishuSyncService } from "@/utils/sync/FeishuSyncService";
import { DEVELOPER_FEEDBACK_CONFIG } from "@/config"; // 🌟 引入你的私有配置

const { success, error } = useMessage();
const isSubmitting = ref(false);

const FEEDBACK_TYPES = ["Bug 反馈", "功能建议", "其他"];
const form = ref({
  rating: 5,
  type: "功能建议",
  content: "",
  contact: "",
});

const submitFeedback = async () => {
  if (!form.value.content) return;

  isSubmitting.value = true;
  try {
    // 🌟 核心改动：直接实例化飞书服务，传入你的开发者私有配置
    // 这里不再要求用户配置过飞书，所有用户都能提交
    const feishu = new FeishuSyncService({
      appId: DEVELOPER_FEEDBACK_CONFIG.appId,
      appSecret: DEVELOPER_FEEDBACK_CONFIG.appSecret,
      appToken: DEVELOPER_FEEDBACK_CONFIG.appToken,
      mapping: {} as any, // insertRecord 不需要 mapping 字典
    });

    const recordFields = {
      用户评分: form.value.rating,
      反馈类型: form.value.type,
      反馈内容: form.value.content,
      联系方式: form.value.contact,
      提交时间: Date.now(),
      系统环境: `UA: ${navigator.userAgent}`,
    };

    // 使用你的私有 TableID 写入数据
    await feishu.insertRecord(DEVELOPER_FEEDBACK_CONFIG.tableId, recordFields);

    success("🎉 感谢您的反馈！我们已收到并会尽快处理。");
    form.value = { rating: 5, type: "功能建议", content: "", contact: "" };
  } catch (err: any) {
    console.error("Feedback Error:", err);
    error("提交失败，请稍后重试。");
  } finally {
    isSubmitting.value = false;
  }
};
</script>
