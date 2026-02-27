export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    // 这里的代码会在用户访问的网页环境中运行
    console.log("PromptPark Content Script 注入成功");
  },
});
