# Arch Linux Troubleshooting

Applies to: Arch/Manjaro/EndeavourOS and other Arch-based distributions.

## Recommended: Install via debtap

### 1. Install debtap

```bash
# Using AUR helper
yay -S debtap
# or
paru -S debtap
```

### 2. Initialize mapping database

Required on first use, occasionally update afterwards:

```bash
sudo debtap -u
```

### 3. Convert deb package

```bash
debtap ./flymd_x.x.x_amd64.deb
```

When prompted "If you want to edit .PKGINFO and .INSTALL files ...":
- Select 2 (nano) or your preferred editor
- In `.PKGINFO` depends section, keep `depends = gtk3`
- If there's old name `gtk`, remove it to avoid conflicts with gtk3
- Save and exit

### 4. Install the generated package

```bash
sudo pacman -U ./flymd-x.x.x-1-x86_64.pkg.tar.zst
```

## Troubleshooting Blank Screen

Symptoms: Window appears blank (all white/no rendering) after launching AppImage.

Try each step in order, restart the app after each to verify.

### 1. Install runtime dependencies

```bash
sudo pacman -S --needed webkit2gtk gtk3
```

### 2. Switch backend / disable render paths

Try each option:

```bash
chmod +x ./flymd_x.x.x_amd64.AppImage

# Try disabling DMA-BUF renderer
WEBKIT_DISABLE_DMABUF_RENDERER=1 ./flymd_x.x.x_amd64.AppImage

# Try disabling compositing mode
WEBKIT_DISABLE_COMPOSITING_MODE=1 ./flymd_x.x.x_amd64.AppImage

# If currently on Wayland, try X11
GDK_BACKEND=x11 ./flymd_x.x.x_amd64.AppImage

# If currently on X11, try Wayland
GDK_BACKEND=wayland ./flymd_x.x.x_amd64.AppImage
```

### 3. Check for missing libraries

```bash
./flymd_x.x.x_amd64.AppImage --appimage-extract
ldd squashfs-root/usr/bin/flymd | grep -E 'webkit|gtk' || true
```

If you see "not found", install the corresponding package with pacman (usually `webkit2gtk` or `gtk3`).

### 4. Other common solutions

- Switch between X11 and Wayland
- Full system update (drivers/WebKitGTK): `sudo pacman -Syu`
- Temporarily disable external monitors or scaling to rule out compositor issues
- Use debtap to convert and install the deb package

## Feedback Information

When reporting issues, please provide:
- "not found" lines from `ldd` output
- Session type (Wayland/X11)
- Desktop environment (GNOME/KDE, etc.)
