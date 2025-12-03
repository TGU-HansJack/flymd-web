
# flyMD 扩展开发文档

> 本文档介绍如何为 flyMD 开发扩展插件

## 目录

- [概述](#概述)
- [快速开始](#快速开始)
- [插件结构](#插件结构)
- [插件API](#插件api)
- [生命周期](#生命周期)
- [示例插件](#示例插件)
- [发布插件](#发布插件)
- [主题扩展](#主题扩展theme)

## 概述

flyMD 提供了灵活的扩展系统，允许开发者通过编写插件来扩展编辑器的功能。插件可以：

- 添加自定义菜单项
- 访问和修改编辑器内容
- 调用 Tauri 后端命令
- 使用 HTTP 客户端进行网络请求
- 存储插件专属的配置数据
- 显示通知和确认对话框

### 内置扩展

flyMD 已内置以下扩展：

1. **图床 (S3/R2)** - 支持将图片上传到 S3/R2 对象存储
2. **WebDAV 同步** - 支持通过 WebDAV 协议同步文档
3. **Typecho 发布器** - 将文章发布到 Typecho 博客平台（可选安装）

## 快速开始

### 1. 创建插件项目

创建一个新的目录，并添加以下文件：

```
my-plugin/
├── manifest.json    # 插件清单文件
└── main.js          # 插件主文件
```

### 2. 编写 manifest.json

```json
{
  "id": "my-plugin",
  "name": "我的插件",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "插件功能描述",
  "main": "main.js"
}
```

**字段说明：**
- `id`（必需）：插件唯一标识符，建议使用小写字母和连字符
- `name`（必需）：插件显示名称
- `version`（必需）：插件版本号，建议使用语义化版本
- `author`（可选）：作者信息
- `description`（可选）：插件功能描述
- `main`（必需）：插件入口文件，默认为 `main.js`
- `minHostVersion`（可选）：插件要求的 flyMD 最低版本号

### 3. 编写 main.js

```javascript
// main.js
export function activate(context) {
  // 插件激活时执行
  context.ui.notice('我的插件已激活！', 'ok', 2000);

  // 添加菜单项
  context.addMenuItem({
    label: '我的插件',
    title: '点击执行插件功能',
    onClick: async () => {
      const content = context.getEditorValue();
      context.ui.notice('当前内容长度：' + content.length, 'ok');
    }
  });
}

export function deactivate() {
  // 插件停用时执行（可选）
  console.log('插件已停用');
}

export function openSettings(context) {
  // 打开插件设置界面（可选）
  context.ui.notice('打开设置界面', 'ok');
}
```

### 4. 发布到 GitHub

1. 在 GitHub 创建仓库
2. 将 `manifest.json` 和 `main.js` 推送到仓库
3. 用户可通过 `username/repo` 或 `username/repo@branch` 格式安装

### 5. 安装插件

在 flyMD 中：
1. 点击菜单栏"扩展"按钮
2. 在安装扩展输入框中输入：
   - GitHub 仓库：`username/repository` 或 `username/repository@branch`
   - HTTP URL：`https://example.com/path/to/manifest.json`
3. 点击"安装"按钮

## 插件结构

### 基本结构

```
my-plugin/
├── manifest.json       # 插件清单（必需）
├── main.js            # 插件主文件（必需）
├── README.md          # 说明文档（推荐）
└── assets/            # 资源文件（可选）
    └── icon.png
```

### manifest.json 详解

```json
{
  "id": "example-plugin",
  "name": "示例插件",
  "version": "1.0.0",
  "author": "Your Name <email@example.com>",
  "description": "这是一个示例插件，展示如何开发 flyMD 扩展",
  "main": "main.js",
  "minHostVersion": "0.3.0",
  "homepage": "https://github.com/username/example-plugin",
  "repository": "https://github.com/username/example-plugin"
}
```

## 插件API

插件通过 `context` 对象访问 flyMD 的功能。

### context.http

HTTP 客户端，用于网络请求。

```javascript
// GET 请求
const response = await context.http.fetch('https://api.example.com/data', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});
const data = await response.json();

// POST 请求
const response = await context.http.fetch('https://api.example.com/post', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ key: 'value' })
});
```

### context.htmlToMarkdown

使用 flyMD 内置的 HTML → Markdown 转换器。

```javascript
// 基本用法
const md = await context.htmlToMarkdown('<h1>标题</h1><p>一段<b>粗体</b>文字</p>');
// md: "# 标题\n\n一段**粗体**文字"

// 带 baseUrl 的用法
const html = '<p><a href="/post/123">查看详情</a></p>';
const md2 = await context.htmlToMarkdown(html, {
  baseUrl: 'https://example.com'
});
// md2: "[查看详情](https://example.com/post/123)"
```

### context.getFrontMatterRaw / context.getDocMeta / context.getDocBody

读取当前文档头部的 YAML Front Matter 以及解析后的元数据。

```javascript
// 1. 原始 Front Matter 文本
const raw = context.getFrontMatterRaw();

// 2. 解析后的元数据对象
const meta = context.getDocMeta();
// { title: "This is the title", keywords: ["markdown", "hexo"] }

// 3. 正文部分（剥离 Front Matter 后的 Markdown）
const body = context.getDocBody();
```

### context.invoke

调用 Tauri 后端命令。

```javascript
try {
  const result = await context.invoke('command_name', {
    param1: 'value1',
    param2: 'value2'
  });
  console.log('命令执行结果：', result);
} catch (error) {
  console.error('命令执行失败：', error);
}
```

### context.storage

插件专属的存储空间。

```javascript
// 保存数据
await context.storage.set('key', { name: 'value', count: 42 });

// 读取数据
const data = await context.storage.get('key');
console.log(data); // { name: 'value', count: 42 }

// 删除数据
await context.storage.set('key', null);
```

### context.addMenuItem

在菜单栏添加自定义菜单项，支持简单菜单项和下拉菜单。

#### 简单菜单项

```javascript
const removeMenuItem = context.addMenuItem({
  label: '菜单文本',
  title: '鼠标悬停提示',
  onClick: () => {
    context.ui.notice('菜单被点击了！');
  }
});
```

#### 下拉菜单

```javascript
context.addMenuItem({
  label: '我的工具',
  title: '工具菜单',
  children: [
    {
      label: '选项 1',
      onClick: () => {
        context.ui.notice('选项 1 被点击');
      }
    },
    {
      label: '选项 2',
      onClick: () => {
        context.ui.notice('选项 2 被点击');
      }
    }
  ]
});
```

#### 带分组和分隔线的下拉菜单

```javascript
context.addMenuItem({
  label: '待办',
  children: [
    { type: 'group', label: '推送' },
    { label: '全部', note: '含已完成/未完成', onClick: () => pushAll() },
    { label: '已完成', onClick: () => pushDone() },
    { type: 'divider' },
    { type: 'group', label: '提醒' },
    { label: '创建提醒', note: '@时间', onClick: () => createReminder() },
    { label: '高级功能', disabled: true, note: '敬请期待' }
  ]
});
```

### context.addContextMenuItem

在编辑器中注册右键菜单项。

```javascript
context.addContextMenuItem({
  label: '转换为大写',
  icon: '🔤',
  condition: (ctx) => ctx.selectedText.length > 0,
  onClick: (ctx) => {
    const upperText = ctx.selectedText.toUpperCase();
    context.replaceRange(
      context.getSelection().start,
      context.getSelection().end,
      upperText
    );
    context.ui.notice('已转换为大写', 'ok');
  }
});
```

#### 上下文对象

```javascript
{
  selectedText: string,        // 当前选中的文本
  cursorPosition: number,      // 光标位置
  mode: 'edit' | 'preview' | 'wysiwyg',  // 当前编辑模式
  filePath: string | null      // 当前文件路径
}
```

### context.ui.notice

显示通知消息。

```javascript
// 显示成功通知
context.ui.notice('操作成功！', 'ok', 2000);

// 显示错误通知
context.ui.notice('操作失败！', 'err', 3000);
```

### context.ui.confirm

显示确认对话框。

```javascript
const confirmed = await context.ui.confirm('确定要执行此操作吗？');
if (confirmed) {
  context.ui.notice('用户确认了操作');
}
```

### context.ui.showNotification

显示通知气泡（右下角）。

```javascript
const id = context.ui.showNotification('操作成功！', {
  type: 'success',  // 'success' | 'error' | 'info'
  duration: 2000
});

// 手动关闭
context.ui.hideNotification(id);
```

### context.layout.registerPanel

注册一个由宿主统一管理布局的插件 Panel。

```javascript
const panel = context.layout.registerPanel('main', {
  side: 'left',      // 'left' | 'right' | 'bottom'
  size: 320,         // 像素值
  visible: true
});

panel.setVisible(false);
panel.setSize(420);
panel.dispose();
```

### context.getEditorValue / context.setEditorValue

获取/设置编辑器当前内容。

```javascript
const content = context.getEditorValue();
context.setEditorValue('# 新内容\n\n这是新的内容');
```

### context.getSelection / context.getSelectedMarkdown

获取当前选区信息。

```javascript
const sel = context.getSelection();
console.log(sel.start, sel.end, sel.text);

const md = context.getSelectedMarkdown();
```

### context.pickDocFiles / context.openFileByPath

文件选择和打开。

```javascript
const files = await context.pickDocFiles({ multiple: true });
await context.openFileByPath('C:/docs/note.md');
```

### context.createStickyNote

创建便签窗口。

```javascript
await context.createStickyNote('C:/notes/todo.md');
```

### context.exportCurrentToPdf

将当前文档导出为 PDF。

```javascript
await context.exportCurrentToPdf('C:/docs/note.pdf');
```

### context.registerAPI / context.getPluginAPI

插件间通信 API。

```javascript
// 注册 API
context.registerAPI('my-utils', {
  formatDate: (date) => date.toISOString().split('T')[0],
  chunk: (array, size) => { /* ... */ }
});

// 获取其他插件的 API
const utils = context.getPluginAPI('my-utils');
if (utils) {
  const today = utils.formatDate(new Date());
}
```

### AI 助手共享 API

AI 助手插件暴露的 API：

```javascript
const ai = context.getPluginAPI('ai-assistant');
if (ai && await ai.isConfigured()) {
  const result = await ai.quickAction(content, '续写');
  const translated = await ai.translate(text);
  const todos = await ai.generateTodos(content);
}
```

## 主题扩展（Theme）

### 全局对象

```javascript
// 颜色调色板
flymdTheme.registerPalette('薰衣草', '#ede9fe')

// 排版风格
flymdTheme.registerTypography('reading', '阅读', `
  .container.typo-reading .preview-body { line-height: 2.0; }
`)

// Markdown 风格
flymdTheme.registerMdStyle('docs', 'Docs', `
  .container.md-docs { --c-key:#1f4eff; }
`)

// 主题偏好
const prefs = flymdTheme.loadThemePrefs()
flymdTheme.saveThemePrefs(prefs)
flymdTheme.applyThemePrefs(prefs)

// 监听主题变更
window.addEventListener('flymd:theme:changed', (e) => {
  console.log('Theme changed:', e.detail.prefs)
})
```

## 生命周期

### activate(context)

插件激活时调用（必需）。

```javascript
export function activate(context) {
  console.log('插件已激活');
  // 初始化插件...
}
```

### deactivate()

插件停用时调用（可选）。

```javascript
export function deactivate() {
  console.log('插件已停用');
  // 清理资源...
}
```

### openSettings(context)

打开插件设置界面（可选）。

```javascript
export function openSettings(context) {
  // 显示设置界面...
}
```

## 示例插件

### 字数统计插件

```javascript
export function activate(context) {
  context.addMenuItem({
    label: '字数统计',
    onClick: () => {
      const content = context.getEditorValue();
      const chars = content.length;
      const words = content.split(/\s+/).filter(w => w.length > 0).length;
      const lines = content.split('\n').length;
      context.ui.notice(`字符: ${chars} | 词数: ${words} | 行数: ${lines}`, 'ok', 3000);
    }
  });
}
```

### HTTP 请求插件

```javascript
export function activate(context) {
  context.addMenuItem({
    label: '获取 IP',
    onClick: async () => {
      try {
        const response = await context.http.fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        context.ui.notice(`您的 IP: ${data.ip}`, 'ok', 3000);
      } catch (error) {
        context.ui.notice('获取失败: ' + error.message, 'err');
      }
    }
  });
}
```

## 发布插件

### 方式一：GitHub 发布（推荐）

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/my-plugin.git
git push -u origin main
```

用户通过 `username/my-plugin` 安装。

### 方式二：HTTP 发布

部署到 Web 服务器，确保允许跨域访问：
```
Access-Control-Allow-Origin: *
```

用户通过完整 URL 安装：`https://example.com/plugins/my-plugin/manifest.json`

## 提交插件到应用内市场

将插件地址及说明发送到 fly@llingfei.com 或提交 issue。

## 最佳实践

1. **错误处理**：始终使用 try-catch 处理可能的错误
2. **用户反馈**：及时给用户反馈操作状态
3. **数据验证**：在操作前验证数据的有效性
4. **配置管理**：为插件提供合理的默认配置
5. **作用域隔离**：优先使用 `context.storage` 和模块作用域

## 参考资源

- [Typecho Publisher 插件](https://github.com/TGU-HansJack/typecho-publisher-flymd)
- [flyMD GitHub 仓库](https://github.com/flyhunterl/flymd)
- [Tauri 文档](https://tauri.app/)
