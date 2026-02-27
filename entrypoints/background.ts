// entrypoints/background.ts
export default defineBackground(() => {
  browser.commands.onCommand.addListener(async (command) => {
    if (command === "collect-prompt") {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab?.id) {
        // 向当前页面发送采集指令
        browser.tabs.sendMessage(tab.id, { action: "COLLECT_SELECTED" });
      }
    }
  });
});
