// Level 状态配置
const LEVEL_CONFIG = {
  4: {
    level: 4,
    label: '正常推荐',
    shortLabel: '正常',
    icon: '🟢',
    color: '#22c55e',
    description: '笔记正常分发，曝光表现良好'
  },
  2: {
    level: 2,
    label: '基本正常',
    shortLabel: '正常',
    icon: '🟡',
    color: '#eab308',
    description: '有轻微受限，流量一般'
  },
  1: {
    level: 1,
    label: '新帖初始',
    shortLabel: '新帖',
    icon: '⚪',
    color: '#9ca3af',
    description: '刚发布，等待审核推荐'
  },
  '-1': {
    level: -1,
    label: '轻度限流',
    shortLabel: '限流',
    icon: '🔴',
    color: '#ef4444',
    description: '推荐量明显下降，建议优化内容'
  },
  '-5': {
    level: -5,
    label: '中度限流',
    shortLabel: '限流',
    icon: '🔴🔴',
    color: '#dc2626',
    description: '几乎无推荐，请检查内容是否违规'
  },
  '-102': {
    level: -102,
    label: '严重限流',
    shortLabel: '重限',
    icon: '⛔',
    color: '#7f1d1d',
    description: '不可逆，需删除重发'
  }
};

// 获取 Level 配置
function getLevelConfig(level) {
  const key = String(level);
  return LEVEL_CONFIG[key] || LEVEL_CONFIG['-102'];
}

// 导出给全局使用
window.LEVEL_CONFIG = LEVEL_CONFIG;
window.getLevelConfig = getLevelConfig;