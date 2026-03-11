// 小红书笔记健康度检查器 - Service Worker

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_NOTE_DATA') {
    // 从存储中获取缓存的 API 响应
    chrome.storage.local.get(['noteData'], (result) => {
      sendResponse({ data: result.noteData });
    });
    return true; // 异步响应
  }

  if (request.type === 'SAVE_NOTE_DATA') {
    // 保存笔记数据到存储
    chrome.storage.local.set({ noteData: request.data }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// 监听扩展安装或更新
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[XHS Health] 扩展已安装/更新:', details.reason);
});