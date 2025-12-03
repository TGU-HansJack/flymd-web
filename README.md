# FlyMD 官方网站

<p align="center">
  <img src="Flymdnew.png" alt="FlyMD Logo" width="120">
</p>

<p align="center">
  <strong>飞速Markdown - 轻量、极速的Markdown编辑器官方网站</strong>
</p>

<p align="center">
  <a href="https://flymd.llingfei.com">在线访问</a> •
  <a href="#功能特性">功能特性</a> •
  <a href="#本地运行">本地运行</a> •
  <a href="#项目结构">项目结构</a> •
  <a href="#贡献指南">贡献指南</a>
</p>

---

## 简介

这是 [FlyMD](https://flymd.llingfei.com) Markdown 编辑器的官方网站项目。网站展示了 FlyMD 应用的核心功能、文档、博客和下载信息。

FlyMD 是一款极致轻量、性能卓越的 Markdown 编辑器和 PDF 阅读器，主要特点包括：

- **超轻量**：安装包仅 7-10MB，运行内存占用 <50MB
- **毫秒级性能**：冷启动 <300ms，预览切换 <16ms
- **AI 赋能**：智能写作助手、润色、校对、续写功能
- **智能待办**：从笔记中智能提取待办，支持微信/短信/邮件等多渠道提醒
- **跨平台**：支持 Windows、Linux、macOS（Android 即将上线）

## 功能特性

### 网站特性

- 🌐 **国际化支持**：中英双语，自动检测浏览器语言
- 🌓 **主题切换**：支持亮色/暗色主题
- 📱 **响应式设计**：适配桌面端和移动端
- ⚡ **纯静态**：无需构建工具，直接部署
- 🧩 **组件化**：可复用的 HTML 组件系统

### 页面内容

| 页面 | 描述 |
|------|------|
| `index.html` | 首页 - 产品展示与下载 |
| `docs.html` | 文档中心 |
| `blog.html` | 博客列表 |
| `plugins.html` | 插件市场 |
| `updates.html` | 更新日志 |
| `about.html` | 关于页面 |
| `demo.html` | 演示页面 |

## 技术栈

- **HTML5** - 语义化结构
- **CSS3** - CSS 变量、Grid、Flexbox、动画
- **Vanilla JavaScript** - 原生 JS，无框架依赖
- **Font Awesome** - 图标库

## 项目结构

```
flymd-web/
├── index.html              # 首页
├── docs.html               # 文档页
├── blog.html               # 博客列表页
├── blog-post.html          # 博客文章页
├── plugins.html            # 插件页
├── updates.html            # 更新日志页
├── about.html              # 关于页
├── demo.html               # 演示页
├── 404.html                # 404 页面
├── styles.css              # 主样式表
├── app.js                  # 主脚本
├── i18n.js                 # 国际化模块
├── components/             # 可复用组件
│   ├── header.html         # 页头组件
│   ├── footer.html         # 页脚组件
│   ├── feature-grid.html   # 功能展示组件
│   ├── bg-effects.html     # 背景特效
│   └── includes.js         # 组件加载器
├── i18n/                   # 国际化资源
│   ├── en.json             # 英文翻译
│   └── zh.json             # 中文翻译
├── content/                # 内容数据
│   ├── blog/               # 博客内容
│   ├── docs/               # 文档内容
│   ├── contributors.json   # 贡献者信息
│   └── nav-links.json      # 导航配置
├── fonts/                  # 字体资源
└── tauri/                  # Tauri 应用相关
```

## 本地运行

由于本项目是纯静态网站，你可以使用任意静态服务器运行：

### 方式一：使用 VS Code Live Server

1. 安装 VS Code 插件 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. 右键点击 `index.html`，选择 "Open with Live Server"

### 方式二：使用 Python

```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

### 方式三：使用 Node.js

```bash
# 使用 npx（无需安装）
npx serve

# 或使用 http-server
npm install -g http-server
http-server
```

然后在浏览器中访问 `http://localhost:8080`

## 贡献指南

欢迎为 FlyMD 网站项目贡献代码！

### 如何贡献

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

### 贡献者

感谢所有为 FlyMD 做出贡献的开发者们！贡献者信息详见 [contributors.json](content/contributors.json)。

## 相关链接

- 🌐 [FlyMD 官网](hhttps://flymd.llingfei.com)
- 📦 [下载 FlyMD](https://github.com/flyhunterl/flymd)
- 📖 [项目路线图](ROADMAP.md)

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/TGU-HansJack">TGU-HansJack</a>
</p>
