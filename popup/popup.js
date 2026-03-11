// 小红书笔记健康度检查器 - 弹窗脚本

document.addEventListener('DOMContentLoaded', async () => {
  const statsContent = document.getElementById('xhs-stats-content');

  // 从 chrome.storage.local 获取笔记数据
  try {
    const result = await chrome.storage.local.get(['noteData']);

    if (result.noteData && result.noteData.data && result.noteData.data.items) {
      const items = result.noteData.data.items;
      renderStats(items);
    } else {
      // 尝试从当前活动标签页获取数据
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab?.id) {
        try {
          const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_NOTE_DATA' });
          if (response?.data) {
            renderStats(response.data.data?.items || []);
          } else {
            showEmptyState();
          }
        } catch (e) {
          // 内容脚本可能未加载
          showEmptyState();
        }
      } else {
        showEmptyState();
      }
    }
  } catch (error) {
    console.error('获取笔记数据失败:', error);
    showEmptyState();
  }

  function renderStats(items) {
    if (!items || items.length === 0) {
      showEmptyState();
      return;
    }

    // 统计各 level 数量
    const levelCounts = {};
    items.forEach(item => {
      const level = item.level || 1;
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    });

    // Level 配置
    const levelLabels = {
      '4': '正常',
      '2': '正常',
      '1': '新帖',
      '-1': '限流',
      '-5': '限流',
      '-102': '重限'
    };

    // 按 level 排序显示
    const sortedLevels = Object.keys(levelCounts).sort((a, b) => Number(b) - Number(a));

    const html = sortedLevels.map(level => {
      const label = levelLabels[level] || level;
      const count = levelCounts[level];
      return `<span class="xhs-stat-item level-${level}">${label}: ${count}</span>`;
    }).join('');

    statsContent.innerHTML = html;
  }

  function showEmptyState() {
    statsContent.innerHTML = '<span class="xhs-loading">请先访问笔记管理页面</span>';
  }
});