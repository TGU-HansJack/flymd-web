---
title: 插件开发
slug: plugin-dev
order: 1
---

# 插件开发指南

飞速 Markdown 支持通过插件扩展功能。本指南将帮助您开发自定义插件。

## 插件结构

一个标准的插件包含以下文件：

```
my-plugin/
├── manifest.json    # 插件清单
├── main.js          # 主入口文件
└── README.md        # 插件说明
```

## manifest.json

```json
{
  "id": "my-plugin",
  "name": "我的插件",
  "version": "1.0.0",
  "description": "这是一个示例插件",
  "author": "Your Name",
  "main": "main.js"
}
```

## 插件 API

### 注册菜单项

```javascript
flymd.menu.register({
  id: 'my-action',
  title: '我的操作',
  onClick: () => {
    console.log('Hello from plugin!');
  }
});
```

### 访问编辑器

```javascript
const content = flymd.editor.getContent();
flymd.editor.setContent('新内容');
```

## 发布插件

1. 将插件代码托管到 GitHub
2. 创建 Release 并上传插件包
3. 提交到插件商店收录

详细开发文档请参考：[插件开发文档](https://github.com/flyhunterl/flymd/blob/main/plugin.md)
