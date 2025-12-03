---
title: 安装
slug: installation
order: 2
---

# 安装配置

本文档详细介绍飞速 Markdown 的安装和配置方法。

## 系统要求

- **Windows**: Windows 10 及以上版本
- **macOS**: macOS 10.15 及以上版本
- **Linux**: 支持 AppImage 的发行版

## 安装步骤

### Windows 安装

#### 方法一：使用 winget（推荐）

```bash
winget install flyhunterl.FlyMD
```

#### 方法二：手动安装

1. 下载 `.exe` 安装包
2. 双击运行安装程序
3. 按照向导完成安装

### macOS 安装

1. 下载 `.dmg` 文件
2. 双击打开镜像文件
3. 将应用拖入 Applications 文件夹

### Linux 安装

```bash
# 下载 AppImage
wget https://github.com/flyhunterl/flymd/releases/latest/download/flymd-linux-x64.AppImage

# 添加执行权限
chmod +x flymd-linux-x64.AppImage

# 运行
./flymd-linux-x64.AppImage
```

## 配置

### 便携模式

启用便携模式后，所有配置将保存在应用目录下，方便携带使用。

### 导入导出配置

在菜单中支持一键导出和导入配置，方便在多台设备间迁移。
