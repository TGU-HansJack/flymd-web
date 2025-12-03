# Arch Linux 故障排除

适用于：Arch/Manjaro/EndeavourOS 等基于 Arch 的发行版。

## 推荐方案：使用 debtap 转换 deb 安装

### 1. 安装 debtap

```bash
# 使用 AUR 助手安装
yay -S debtap
# 或
paru -S debtap
```

### 2. 初始化映射数据库

首次使用必做，之后偶尔更新：

```bash
sudo debtap -u
```

### 3. 转换 deb 包

```bash
debtap ./flymd_x.x.x_amd64.deb
```

出现提示 "If you want to edit .PKGINFO and .INSTALL files ..." 时：
- 选择 2（nano）或你熟悉的编辑器
- 在 `.PKGINFO` 的 depends 段，保留 `depends = gtk3`
- 若有旧名 `gtk`，请删除，避免与 gtk3 冲突
- 保存并退出

### 4. 安装生成的包

```bash
sudo pacman -U ./flymd-x.x.x-1-x86_64.pkg.tar.zst
```

## 排除空白屏幕问题

症状：启动 AppImage 后窗口空白（全白/无渲染）。

按顺序尝试，每步后重启应用验证。

### 1. 安装运行时依赖

```bash
sudo pacman -S --needed webkit2gtk gtk3
```

### 2. 切换后端/禁用部分渲染路径

逐项尝试：

```bash
chmod +x ./flymd_x.x.x_amd64.AppImage

# 尝试禁用 DMA-BUF 渲染器
WEBKIT_DISABLE_DMABUF_RENDERER=1 ./flymd_x.x.x_amd64.AppImage

# 尝试禁用合成模式
WEBKIT_DISABLE_COMPOSITING_MODE=1 ./flymd_x.x.x_amd64.AppImage

# 当前是 Wayland 时优先试
GDK_BACKEND=x11 ./flymd_x.x.x_amd64.AppImage

# 当前是 X11 时可尝试
GDK_BACKEND=wayland ./flymd_x.x.x_amd64.AppImage
```

### 3. 检查缺库

```bash
./flymd_x.x.x_amd64.AppImage --appimage-extract
ldd squashfs-root/usr/bin/flymd | grep -E 'webkit|gtk' || true
```

若看到 "not found"，用 pacman 安装对应包（通常是 `webkit2gtk` 或 `gtk3`）。

### 4. 其他常见方向

- 切换到 X11 或 Wayland 再试
- 全量更新（驱动/WebKitGTK）：`sudo pacman -Syu`
- 临时关闭外接显示器或缩放，排除合成器问题
- 使用 debtap 转换 deb 并安装

## 反馈信息

提交问题时请提供：
- `ldd` 输出中的 "not found" 行
- 会话类型（Wayland/X11）
- 桌面环境（GNOME/KDE 等）
