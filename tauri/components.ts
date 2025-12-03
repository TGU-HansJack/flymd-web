/**
 * FlyMD Feature Grid 数据
 * 来源: flymd-tauri-index/flymd-main
 * 供 site/app.js 中的 extractExportedArray 解析
 */

export const colorPalettes = [
  { label: '纯白', color: '#ffffff' },
  { label: '羊皮纸', color: '#fbf5e6' },
  { label: '淡蓝', color: '#f7f9fc' },
  { label: '暖灰', color: '#f6f5f1' },
  { label: '雾蓝', color: '#eef3f9' },
  { label: '薄荷', color: '#eef8f1' },
  { label: '象牙', color: '#fffaf0' },
  { label: '深色', color: '#0b0c0e' }
];

export const automationPlugins = [
  { label: 'AI 助手', capability: '润色、改写、段落理解' },
  { label: 'xxtui 待办推送', capability: '多渠道提醒、定时通知' },
  { label: 'Markdown 表格助手', capability: '快速插入表格' }
];

export const sampleMarkdown = `# FlyMD 编辑器

**源码/所见双模式**，自由切换编辑与预览。

## 核心特性

- 毫秒级启动与渲染
- 阅读位置记忆
- 目录大纲支持

\`\`\`javascript
const flymd = new Editor();
flymd.render();
\`\`\`

> 轻量却强大，为效率而生
`;
