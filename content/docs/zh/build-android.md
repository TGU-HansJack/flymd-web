# flyMD Android 构建指南

## 概述

本文档说明如何构建 flyMD 的 Android 版本。Android 分支包含了所有必要的平台适配代码，支持：

- SAF（Storage Access Framework）文件访问
- 移动端 UI（FAB、抽屉式文件库）
- 虚拟键盘适配
- 跨平台文件操作（桌面/Android 自动适配）

## 方法一：GitHub Actions 自动构建（推荐）

### 1. 触发构建

在 GitHub 仓库页面：

1. 进入 **Actions** 标签页
2. 选择 **Android Build** workflow
3. 点击 **Run workflow**
4. 选择构建类型：
   - `debug` - 调试版本（无需签名，默认选项）
   - `release` - 发布版本（需要配置签名）
5. 点击 **Run workflow** 开始构建

### 2. 下载 APK

构建完成后：

1. 进入 workflow 运行详情页
2. 在 **Artifacts** 部分下载：
   - `flymd-android-debug.zip` (调试版)
   - `flymd-android-release.zip` (发布版)
3. 解压后将 APK 安装到 Android 设备

### 3. 配置 Release 签名（可选）

在 GitHub 仓库设置中添加以下 Secrets：

**Settings → Secrets and variables → Actions → New repository secret**

| Secret 名称 | 说明 |
|------------|------|
| `ANDROID_KEYSTORE_PATH` | Keystore 文件路径 |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore 密码 |
| `ANDROID_KEY_ALIAS` | Key 别名 |
| `ANDROID_KEY_PASSWORD` | Key 密码 |

**生成 Keystore：**

```bash
keytool -genkey -v -keystore flymd.keystore \
  -alias flymd \
  -keyalg RSA -keysize 2048 -validity 10000
```

## 方法二：本地构建

### 前置要求

#### 1. 安装 Java 17

```bash
# Ubuntu/Debian
sudo apt install openjdk-17-jdk

# macOS
brew install openjdk@17

# Windows
# 下载安装：https://adoptium.net/temurin/releases/?version=17
```

#### 2. 安装 Android Studio 和 SDK

1. 下载 Android Studio：https://developer.android.com/studio
2. 安装后，打开 **SDK Manager**（Tools → SDK Manager）
3. 确保安装：
   - Android SDK Platform 34（API Level 34）
   - Android SDK Build-Tools 34.0.0
   - Android SDK Command-line Tools
   - NDK (Side by side) - 版本 26.1.10909125

#### 3. 配置环境变量

```bash
# Linux/macOS (~/.bashrc 或 ~/.zshrc)
export ANDROID_HOME="$HOME/Android/Sdk"
export NDK_HOME="$ANDROID_HOME/ndk/26.1.10909125"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$PATH"

# Windows (PowerShell)
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:NDK_HOME = "$env:ANDROID_HOME\ndk\26.1.10909125"
$env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
```

#### 4. 安装 Rust Android 工具链

```bash
rustup target add aarch64-linux-android
rustup target add armv7-linux-androideabi
rustup target add x86_64-linux-android
rustup target add i686-linux-android
```

#### 5. 安装 Node.js 和依赖

```bash
# Node.js 20+
node -v  # 确认版本

# 安装项目依赖
npm install

# 安装 Tauri CLI
npm install -g @tauri-apps/cli
```

### 构建步骤

#### 1. 初始化 Android 项目（仅首次）

```bash
cd flymd
npx tauri android init
```

#### 2. 构建前端

```bash
npm run build
```

#### 3. 构建 Android APK

**调试版：**

```bash
npx tauri android build --debug
```

**发布版：**

```bash
npx tauri android build --release
```

#### 4. 查找生成的 APK

```
src-tauri/gen/android/app/build/outputs/apk/
├── debug/
│   └── app-debug.apk
└── release/
    └── app-release.apk
```

### 安装到设备

#### 使用 USB 连接

```bash
# 连接设备并启用 USB 调试
adb install src-tauri/gen/android/app/build/outputs/apk/debug/app-debug.apk
```

#### 使用 Android 模拟器

```bash
npx tauri android dev
```

## 故障排查

### JAVA_HOME 未设置

```bash
# 查找 Java 安装路径
which java       # Linux/macOS
where java       # Windows

# 设置 JAVA_HOME
export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"  # Linux
export JAVA_HOME="/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home"  # macOS
```

### NDK 找不到

1. 打开 Android Studio → SDK Manager → SDK Tools
2. 勾选 **NDK (Side by side)**
3. 安装版本 26.1.10909125
4. 设置环境变量：`export NDK_HOME="$ANDROID_HOME/ndk/26.1.10909125"`

### 依赖下载超时（国内用户）

编辑 `src-tauri/gen/android/build.gradle`，添加阿里云镜像：

```gradle
allprojects {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/central' }
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
        google()
        mavenCentral()
    }
}
```

### Rust 编译错误

```bash
# 确保安装了 Rust Android 工具链
rustup target list --installed | grep android

# 如果缺少，重新安装
rustup target add aarch64-linux-android armv7-linux-androideabi
```

## Android 特性说明

### 文件访问

- **桌面版**：直接路径访问 (`/path/to/file.md`)
- **Android 版**：SAF URI 模式 (`content://com.android.providers...`)

### 移动端 UI

- **FAB（浮动操作按钮）**：新建、打开、保存文件，切换预览
- **抽屉式文件库**：从左侧滑出，显示最近文件和 WebDAV 同步文件
- **虚拟键盘适配**：编辑器自动调整高度

### 功能限制

- 无自动更新（通过 Google Play 或手动安装更新）
- 无拖拽打开文件
- 无窗口状态管理
- WebDAV 同步、S3 图片上传、扩展系统完全兼容

## 参考资源

- [Tauri Android 文档](https://beta.tauri.app/develop/android/)
- [JNI 示例](https://github.com/jni-rs/jni-rs)
