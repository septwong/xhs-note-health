// 小红书笔记健康度检查器 - 内容脚本
(function() {
  'use strict';

  // 存储笔记数据
  let noteDataCache = new Map();

  // API 响应数据缓存
  let apiResponseData = null;

  // 已渲染的笔记 ID
  const renderedNoteIds = new Set();

  /**
   * 处理 API 响应数据
   * @param {any[]} notes - 笔记数组
   */
  function handleApiResponse(notes) {
    if (!Array.isArray(notes) || notes.length === 0) {
      console.log('[XHS Health] 响应不是笔记数组:', notes);
      return;
    }

    noteDataCache.clear();

    // 构建笔记 ID 到 level 的映射
    notes.forEach(note => {
      const noteId = note.noteId || note.note_id || note.id;
      if (noteId) {
        noteDataCache.set(noteId, note);
      }
    });

    apiResponseData = notes;

    // 保存到存储
    try {
      chrome.storage.local.set({ noteData: notes });
    } catch (e) {}

    // 更新页面上的 badges
    renderAllBadges();

    console.log('[XHS Health] 笔记数据已更新，共', noteDataCache.size, '篇');
  }

  /**
   * 劫持 JSON.parse - 拦截所有 JSON 响应
   */
  function initJsonParseInterceptor() {
    const originalParse = JSON.parse;

    JSON.parse = function(text, reviver) {
      const result = originalParse.call(this, text, reviver);

      // 检查是否是笔记 API 响应
      // 条件：success === true 且 data.notes 是数组
      if (
        result &&
        typeof result === 'object' &&
        result.success === true &&
        result.data &&
        Array.isArray(result.data.notes) &&
        result.data.notes.length > 0
      ) {
        console.log('[XHS Health] 拦截到笔记 API 响应');
        // 延迟处理，避免阻塞
        setTimeout(() => handleApiResponse(result.data.notes), 0);
      }

      return result;
    };

    console.log('[XHS Health] JSON.parse 劫持已启用');
  }

  /**
   * 获取 Level 配置
   */
  function getLevelConfig(level) {
    const configs = {
      4: { label: 'L4正常推荐', color: '#22c55e', icon: '🟢' },
      2: { label: 'L2基本正常', color: '#eab308', icon: '🟡' },
      1: { label: 'L1新帖初始', color: '#9ca3af', icon: '⚪' },
      '-1': { label: 'L-1轻度限流', color: '#ef4444', icon: '🔴' },
      '-5': { label: 'L-5中度限流', color: '#dc2626', icon: '🔴🔴' },
      '-102': { label: 'L-102严重限流', color: '#7f1d1d', icon: '⛔' }
    };

    return configs[String(level)] || configs['-102'];
  }

  /**
   * 查找笔记元素
   */
  function findNoteElement(note) {
    const noteId = note.noteId || note.note_id || note.id;
    if (!noteId) return null;

    // 查找所有笔记卡片 div.note
    const noteCards = document.querySelectorAll('div.note');

    for (const card of noteCards) {
      // 从 data-impression 属性中提取 noteId
      const impression = card.getAttribute('data-impression');
      if (impression) {
        try {
          const data = JSON.parse(impression);
          if (data?.noteTarget?.value?.noteId === noteId) {
            // 找到笔记卡片，返回标题元素
            const titleEl = card.querySelector('.title');
            if (titleEl) return titleEl;
            return card.querySelector('.info .raw .title');
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }

    // 回退：尝试通过 data-note-id 查找
    const dataIdElement = document.querySelector(`[data-note-id="${noteId}"]`);
    if (dataIdElement) return dataIdElement;

    // 回退：通过标题文本查找
    const title = note.display_title || note.title || note.note_title;
    if (title) {
      const titleElements = document.querySelectorAll('div.title');
      for (const el of titleElements) {
        const text = (el.textContent || '').trim();
        if (text === title || text.includes(title)) {
          return el;
        }
      }
    }

    return null;
  }

  /**
   * 注入 Badge
   */
  function renderBadgeForNote(note) {
    const noteId = note.noteId || note.note_id || note.id;
    if (!noteId) return;

    // 跳过已渲染的
    if (renderedNoteIds.has(noteId)) return;
    renderedNoteIds.add(noteId);

    const target = findNoteElement(note);
    if (!target || !target.parentElement) {
      console.log('[XHS Health] 未找到笔记元素:', noteId, '标题:', note.title || note.display_title);
      return;
    }

    // 获取 level（支持多种字段名）
    const level = note.level_ ?? note.level ?? note.distribution_level ?? note.status_level ?? 1;
    const config = getLevelConfig(level);

    // 创建 badge 元素
    const wrapper = document.createElement('span');
    wrapper.className = 'xhs-health-inline';
    wrapper.style.cssText = 'display: inline-flex; align-items: center; gap: 6px; margin-left: 8px; vertical-align: middle;';

    const badge = document.createElement('span');
    badge.className = 'xhs-health-badge';
    badge.style.cssText = `
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      font-size: 12px;
      line-height: 1;
      padding: 4px 8px;
      font-weight: 600;
      border: 1px solid rgba(0,0,0,.08);
      background: ${config.color};
      color: white;
    `;
    badge.textContent = config.label;
    badge.title = `level = ${level}（仅供参考，非官方）`;

    wrapper.appendChild(badge);

    // 插入到目标元素后面
    target.parentElement.insertBefore(wrapper, target.nextSibling);
  }

  /**
   * 渲染所有 Badge
   */
  function renderAllBadges() {
    if (noteDataCache.size === 0) return;

    noteDataCache.forEach((note) => {
      renderBadgeForNote(note);
    });
  }

  /**
   * 初始化样式
   */
  function ensureStyles() {
    if (document.getElementById('xhs-health-style')) return;

    const style = document.createElement('style');
    style.id = 'xhs-health-style';
    style.textContent = `
      .xhs-health-inline { display: inline-flex; align-items: center; gap: 6px; margin-left: 8px; vertical-align: middle; }
      .xhs-health-badge { display: inline-flex; align-items: center; border-radius: 999px; font-size: 12px; line-height: 1; padding: 4px 8px; font-weight: 600; border: 1px solid rgba(0,0,0,.08); }
    `;
    document.documentElement.appendChild(style);
  }

  /**
   * 初始化 MutationObserver
   */
  function initMutationObserver() {
    let debounceTimer = null;

    const observer = new MutationObserver(() => {
      if (noteDataCache.size === 0) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => renderAllBadges(), 500);
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  /**
   * 初始化消息监听
   */
  function initMessageListener() {
    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
        if (request.type === 'GET_NOTE_DATA') {
          sendResponse({ data: apiResponseData });
          return true;
        }
      });
    }
  }

  /**
   * 初始化
   */
  function init() {
    console.log('[XHS Health] 笔记健康度检查器已启动');

    ensureStyles();
    initJsonParseInterceptor();
    initMutationObserver();
    initMessageListener();

    console.log('[XHS Health] 等待拦截 API 响应...');
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();