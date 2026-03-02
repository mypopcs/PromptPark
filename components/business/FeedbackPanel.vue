<template>
  <div class="mx-auto pb-10 animate-fade-in">
    <div class="grid grid-cols-12 gap-8">
      <div class="col-span-12 lg:col-span-6 space-y-6">
        <section class="pb-4 border-b-2 border-base-300">
          <p class="text-sm opacity-80">
            PromptPark是一款助力私有化的AI管理工具，可以便捷的管理和使用AI提示词（长句&提示词）等功能。数据支持飞书表格&GitHub图床/本地同步，适用于使用AI工作的个人或团队创作者，运营者等角色需要统一管理，分享与调用私有词库。
          </p>
          <p class="mt-4 text-sm opacity-80">
            <span class="font-bold">版本 1.0.0</span>
          </p>
        </section>
        <section class="pb-4">
          <h2 class="text-lg font-black mb-3">主要功能</h2>
          <ul
            class="list-disc list-inside space-y-1 text-mx text-gray-700 ml-2"
          >
            <li>
              <b>多库管理：</b>支持创建多个独立的词库并快速切换管理不同场景。
            </li>
            <li><b>分类管理：</b>按库给提示词做分类，便于快速查找和使用。</li>
            <li><b>飞书同步：</b>支持配置私有飞书表格，多设备共享。</li>
            <li><b>GitHub图床：</b>图片保存后自动上传，省去购买费用。</li>
          </ul>
        </section>
        <section class="pb-4">
          <h2 class="text-lg font-black mb-3">支持与交流</h2>
          <p class="text-sm space-y-2 opacity-80 mb-4">
            如果您觉得这个插件对您有帮助，欢迎打赏支持我们的开发工作！
          </p>
          <div class="grid grid-cols-3 gap-4">
            <div
              class="aspect-square bg-white rounded-md border border-border border-gray-200 shadow-sm flex items-center justify-center"
            >
              <div class="text-center text-gray-500">
                <img
                  src="../../assets/wechat-pay.jpg"
                  class="w-32 h-32 mx-auto mb-1"
                />
                <p class="text-xs">欢迎鼓励我继续创作，谢谢！</p>
              </div>
            </div>
            <div
              class="aspect-square bg-white rounded-md border border-border border-gray-200 shadow-sm flex items-center justify-center"
            >
              <div class="text-center text-gray-500">
                <img
                  src="../../assets/wechat-group.jpg"
                  class="w-32 h-32 mx-auto mb-1"
                />
                <p class="text-xs">欢迎加入微信沟通群</p>
              </div>
            </div>
            <div
              class="aspect-square bg-white rounded-md border border-border border-gray-200 shadow-sm flex items-center justify-center"
            >
              <div class="text-center text-gray-500">
                <img
                  src="../../assets/wechat-mp.jpg"
                  class="w-32 h-32 mx-auto mb-1"
                />
                <p class="text-xs">欢迎关注微信公众号</p>
              </div>
            </div>
          </div>
        </section>
        <section class="pb-4">
          <h2 class="text-lg font-black mb-3">更新日志</h2>
          <div class="border-l-2 border-primary pl-4">
            <h4 class="font-semibold text-base mb-1">v1.0.0 (2026-02-19)</h4>
            <ul
              class="list-disc list-inside space-y-1 text-mx text-gray-700 ml-2"
            >
              <li>
                【新增】词库管理功能，用户可以创建、删除、重命名词库，通过快速切换来使用不同场景的提示词；
              </li>
              <li>
                【新增】提示词采集功能，用户可以从网页中采集提示词并保存到指定的词库；
              </li>
              <li>
                【新增】快捷键操作功能，用户可以使用快捷键快速打开界面和采集提示词；
              </li>
              <li>【新增】飞书同步功能，用户可以将词库同步到私有飞书表格；</li>
              <li>
                【新增】GitHub图床支持，用户可以将图片上传到私有GitHub图床并获取图片链接；
              </li>
            </ul>
          </div>
        </section>

        <div
          class="alert alert-info bg-info/10 border-info/20 shadow-sm rounded-2xl"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="stroke-info shrink-0 w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div class="text-xs">
            <h3 class="font-bold">飞书配置帮助</h3>
            <p>
              如何配置飞书和GitHub？<a href="#" class="link link-primary"
                >查看教程</a
              >，或联系作者付费服务 (kim_mikoa)。
            </p>
          </div>
        </div>
      </div>
      <div class="col-span-12 lg:col-span-6">
        <div class="card bg-base-100 shadow-xl border border-base-200 h-full">
          <div class="card-body p-8">
            <section class="space-y-6 mb-8">
              <h2 class="text-lg font-black mb-3">意见反馈</h2>
              <div class="form-control">
                <label class="label"
                  ><span class="label-text font-bold">反馈类型</span></label
                >
                <div class="flex gap-4">
                  <label
                    v-for="t in ['Bug 反馈', '功能建议', '其他']"
                    :key="t"
                    class="label cursor-pointer gap-2"
                  >
                    <input
                      type="radio"
                      class="radio radio-primary radio-sm"
                      v-model="form.type"
                      :value="t"
                    />
                    <span class="label-text">{{ t }}</span>
                  </label>
                </div>
              </div>
              <BaseInput
                v-model.trim="form.content"
                label="反馈内容"
                type="textarea"
                placeholder="欢迎留下您的宝贵意见..."
              />
              <BaseInput
                v-model.trim="form.contact"
                label="联系方式 (可选)"
                type="text"
                placeholder="邮箱或微信号"
              />
              <div class="card-actions mt-4">
                <button
                  class="btn btn-primary"
                  :disabled="isSubmitting || !form.content"
                  @click="submitFeedback"
                >
                  <span
                    v-if="isSubmitting"
                    class="loading loading-spinner"
                  ></span>
                  {{ isSubmitting ? "正在安全提交至飞书..." : "立即提交反馈" }}
                </button>
              </div>
            </section>
            <section class="mb-8">
              <h2 class="text-lg font-black mb-3">联系我们</h2>
              <div class="text-sm space-y-2 opacity-80">
                <p>
                  官网：<a
                    href="https://www.siliconrise.ai"
                    target="_blank"
                    class="link link-primary"
                    >siliconrise.ai</a
                  >
                </p>
                <p>邮箱：contact@siliconrise.ai</p>
              </div>
            </section>
            <section class="mb-8">
              <h2 class="text-lg font-black mb-3">您对插件的整体评分</h2>
              <div class="rating rating-lg gap-2">
                <input
                  v-for="i in 5"
                  :key="i"
                  type="radio"
                  class="mask mask-star-2 bg-warning"
                  v-model="form.rating"
                  :value="i"
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useMessage } from "@/composables/useMessage";
import { FeishuSyncService } from "@/utils/sync/FeishuSyncService"; //
import { DEVELOPER_FEEDBACK_CONFIG } from "@/config"; //
import BaseInput from "../ui/BaseInput.vue";

const { success, error } = useMessage();
const isSubmitting = ref(false);

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
    // 实例化飞书服务，直接使用硬编码的开发者私有配置
    const feishu = new FeishuSyncService({
      appId: DEVELOPER_FEEDBACK_CONFIG.appId,
      appSecret: DEVELOPER_FEEDBACK_CONFIG.appSecret,
      appToken: DEVELOPER_FEEDBACK_CONFIG.appToken,
      mapping: {} as any,
    });

    const fields = {
      用户评分: form.value.rating,
      反馈类型: form.value.type,
      反馈内容: form.value.content,
      联系方式: form.value.contact,
      提交时间: Date.now(),
      系统环境: `UA: ${navigator.userAgent}`,
    };

    // 写入开发者私有的 Table ID
    await feishu.insertRecord(DEVELOPER_FEEDBACK_CONFIG.tableId, fields);

    success("🎉 提交成功！感谢您的反馈。");
    form.value = { rating: 5, type: "功能建议", content: "", contact: "" };
  } catch (err: any) {
    error("提交失败，请稍后重试");
  } finally {
    isSubmitting.value = false;
  }
};
</script>
