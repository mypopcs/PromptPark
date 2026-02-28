// entrypoints/content.ts
import { createApp } from "vue";
import Drawer from "@/components/Drawer.vue";
import CollectModal from "@/components/CollectModal.vue";
import "@/assets/tailwind.css";

interface CollectModalExpose {
  /** 打开采集弹窗并写入默认文本 */
  show: (selectedText: string) => void;
}

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",
  async main(ctx) {
    let collectModalUi: Awaited<ReturnType<typeof createShadowRootUi>> | null = null;
    let collectModalInstance: CollectModalExpose | null = null;

    const ui = await createShadowRootUi(ctx, {
      name: "prompt-park-ui",
      position: "inline",
      anchor: "body",
      append: "last",
      onMount: (container) => {
        container.setAttribute("data-theme", "dark");
        const app = createApp(Drawer);
        app.mount(container);
        return app;
      },
      onRemove: (app) => {
        app?.unmount();
      },
    });

    ui.mount();

    const showCollectModal = async (selectedText: string) => {
      console.log("📥 showCollectModal 被调用，选中文本:", selectedText);
      try {
        if (!collectModalUi) {
          console.log("📥 创建新的 CollectModal UI");
          collectModalUi = await createShadowRootUi(ctx, {
            name: "prompt-park-collect-modal",
            position: "inline",
            anchor: "body",
            append: "last",
            onMount: (container) => {
              container.setAttribute("data-theme", "dark");
              const app = createApp(CollectModal);
              collectModalInstance = app.mount(container) as unknown as CollectModalExpose;
              console.log(
                "📥 CollectModal 实例创建完成:",
                collectModalInstance,
              );
              return app;
            },
            onRemove: (app) => {
              app?.unmount();
            },
          });
          collectModalUi.mount();
        }

        setTimeout(() => {
          console.log("📥 调用 collectModalInstance.show");
          if (collectModalInstance && collectModalInstance.show) {
            collectModalInstance.show(selectedText);
          } else {
            console.error("📥 collectModalInstance.show 方法不存在");
          }
        }, 100);
      } catch (error) {
        console.error("📥 showCollectModal 出错:", error);
      }
    };

    window.addEventListener("keydown", (e) => {
      if (e.altKey && e.key === "s") {
        e.preventDefault();
        const selection = window.getSelection()?.toString().trim() || "";
        if (selection) {
          showCollectModal(selection);
        }
      }
    });

    browser.runtime.onMessage.addListener((message) => {
      if (message.action === "COLLECT_SELECTED") {
        const selection = window.getSelection()?.toString().trim() || "";
        if (selection) {
          showCollectModal(selection);
        }
      }
    });

    let floatingButton: HTMLElement | null = null;
    let hideButtonTimeout: ReturnType<typeof setTimeout> | null = null;

    console.log("🎯 Content script 已加载，开始监听 mouseup 事件");

    document.addEventListener("mouseup", (e) => {
      console.log("🎯 mouseup 事件触发", e.target);

      if ((e.target as HTMLElement).id === "prompt-park-collect-btn") {
        console.log("🎯 点击的是采集按钮，忽略");
        return;
      }

      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      console.log("🎯 选中文本:", selectedText, "长度:", selectedText?.length);

      if (selectedText && selectedText.length > 0) {
        console.log("🎯 有选中文本，准备创建按钮");

        if (floatingButton) {
          console.log("🎯 移除旧按钮");
          floatingButton.remove();
        }

        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        console.log("🎯 选区位置:", rect);

        if (rect) {
          console.log("🎯 创建新按钮");

          floatingButton = document.createElement("button");
          floatingButton.id = "prompt-park-collect-btn";
          floatingButton.innerHTML = "📥 采集";
          floatingButton.style.cssText = `
            position: fixed !important;
            z-index: 2147483647 !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            border: none !important;
            border-radius: 8px !important;
            padding: 8px 16px !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
            transition: all 0.2s ease !important;
            left: ${rect.left + rect.width / 2}px !important;
            top: ${rect.bottom + 8 + window.scrollY}px !important;
            transform: translateX(-50%) !important;
            pointer-events: auto !important;
          `;

          floatingButton.onmouseenter = () => {
            console.log("🎯 按钮 mouseenter");
            if (hideButtonTimeout) {
              clearTimeout(hideButtonTimeout);
              hideButtonTimeout = null;
            }
          };

          floatingButton.onmouseleave = () => {
            console.log("🎯 按钮 mouseleave");
            hideButtonTimeout = setTimeout(() => {
              if (floatingButton) {
                floatingButton.style.opacity = "0";
                floatingButton.style.transform =
                  "translateX(-50%) translateY(10px)";
                setTimeout(() => {
                  if (floatingButton) {
                    floatingButton.remove();
                    floatingButton = null;
                  }
                }, 200);
              }
            }, 2000);
          };

          floatingButton.onmousedown = (e) => {
            console.log("🎯 按钮 mousedown");
            e.stopPropagation();
          };

          floatingButton.onclick = (e) => {
            console.log("🎯 按钮 onclick 触发");
            e.stopPropagation();
            e.preventDefault();
            console.log("🎯 调用 showCollectModal");
            showCollectModal(selectedText);
            if (floatingButton) {
              floatingButton.remove();
              floatingButton = null;
            }
          };

          console.log("🎯 将按钮添加到 body");
          document.body.appendChild(floatingButton);
          console.log("🎯 按钮已添加到 DOM，id:", floatingButton.id);

          if (hideButtonTimeout) {
            clearTimeout(hideButtonTimeout);
          }

          hideButtonTimeout = setTimeout(() => {
            console.log("🎯 按钮自动隐藏");
            if (floatingButton) {
              floatingButton.style.opacity = "0";
              floatingButton.style.transform =
                "translateX(-50%) translateY(10px)";
              setTimeout(() => {
                if (floatingButton) {
                  floatingButton.remove();
                  floatingButton = null;
                }
              }, 200);
            }
          }, 3000);
        }
      } else {
        console.log("🎯 没有选中文本");
        if (floatingButton) {
          floatingButton.remove();
          floatingButton = null;
        }
        if (hideButtonTimeout) {
          clearTimeout(hideButtonTimeout);
          hideButtonTimeout = null;
        }
      }
    });
  },
});
