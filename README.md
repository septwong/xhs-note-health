# 小红书笔记健康度

## ⚠️ 2026年3月10日更新：小红书官方已移除 level 字段，导致该工具失效，不再维护

一个 Chrome 浏览器扩展，帮助小红书创作者快速查看笔记的推荐状态和限流情况。

## 功能特性

- **自动检测**: 自动拦截小红书创作者后台的 API 响应，获取笔记的健康度数据
- **直观显示**: 在笔记列表中直接显示每个笔记的健康状态标签
- **状态说明**:
  - 🟢 正常推荐 (Level 4): 笔记正常分发，曝光表现良好
  - 🟡 基本正常 (Level 2): 有轻微受限，流量一般
  - ⚪ 新帖初始 (Level 1): 刚发布，等待审核推荐
  - 🔴 轻度限流 (Level -1): 推荐量明显下降，建议优化内容
  - 🔴🔴 中度限流 (Level -5): 几乎无推荐，请检查内容是否违规
  - ⛔ 严重限流 (Level -102): 不可逆，需删除重发

## 安装说明

### 开发者模式安装（推荐）

1. 打开 Chrome 浏览器，访问 `chrome://extensions/`
2. 开启右上角的「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择本项目的 `xhs-note-health-checker` 文件夹
5. 安装完成后，在小红书创作者后台刷新页面即可使用

## 使用方法

1. 登录 [小红书创作者后台](https://creator.xiaohongshu.com/)
2. 进入「笔记管理」页面
3. 扩展会自动检测并显示每篇笔记的健康状态
4. 点击浏览器工具栏的扩展图标，可查看统计数据

## 项目结构

```
xhs-note-health-checker/
├── manifest.json          # 扩展配置文件
├── background/
│   └── service-worker.js  # 后台服务 worker
├── content/
│   ├── content.js         # 内容脚本（拦截 API）
│   └── styles.css         # 样式文件
├── popup/
│   ├── popup.html         # 弹窗页面
│   ├── popup.js           # 弹窗逻辑
│   └── popup.css          # 弹窗样式
└── utils/
    └── level-config.js    # Level 状态配置
```

## 注意事项

- 本扩展通过解析小红书 API 响应获取数据，level 值为非官方数据，仅供参考
- 小红书可能会更新 API 或页面结构，导致功能失效
- 请勿过度依赖此工具，笔记推荐受多种因素影响

## 技术栈

- Chrome Extension (Manifest V3)
- JavaScript (ES6+)
- CSS3

## 许可证

MIT License