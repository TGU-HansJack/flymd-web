# flyMD Android Build Guide

## Overview

This document explains how to build the Android version of flyMD. The Android branch contains all necessary platform adaptation code, supporting:

- SAF (Storage Access Framework) file access
- Mobile UI (FAB, drawer-style file library)
- Virtual keyboard adaptation
- Cross-platform file operations (desktop/Android auto-adaptation)

## Method 1: GitHub Actions Auto Build (Recommended)

### 1. Trigger Build

On the GitHub repository page:

1. Go to the **Actions** tab
2. Select **Android Build** workflow
3. Click **Run workflow**
4. Select build type:
   - `debug` - Debug version (no signing required, default)
   - `release` - Release version (requires signing configuration)
5. Click **Run workflow** to start the build

### 2. Download APK

After the build completes:

1. Go to the workflow run details page
2. Download from the **Artifacts** section:
   - `flymd-android-debug.zip` (debug version)
   - `flymd-android-release.zip` (release version)
3. Extract and install the APK on your Android device

### 3. Configure Release Signing (Optional)

Add the following Secrets in GitHub repository settings:

**Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Description |
|------------|-------------|
| `ANDROID_KEYSTORE_PATH` | Keystore file path |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias |
| `ANDROID_KEY_PASSWORD` | Key password |

**Generate Keystore:**

```bash
keytool -genkey -v -keystore flymd.keystore \
  -alias flymd \
  -keyalg RSA -keysize 2048 -validity 10000
```

## Method 2: Local Build

### Prerequisites

#### 1. Install Java 17

```bash
# Ubuntu/Debian
sudo apt install openjdk-17-jdk

# macOS
brew install openjdk@17

# Windows
# Download from: https://adoptium.net/temurin/releases/?version=17
```

#### 2. Install Android Studio and SDK

1. Download Android Studio: https://developer.android.com/studio
2. After installation, open **SDK Manager** (Tools → SDK Manager)
3. Ensure you install:
   - Android SDK Platform 34 (API Level 34)
   - Android SDK Build-Tools 34.0.0
   - Android SDK Command-line Tools
   - NDK (Side by side) - version 26.1.10909125

#### 3. Configure Environment Variables

```bash
# Linux/macOS (~/.bashrc or ~/.zshrc)
export ANDROID_HOME="$HOME/Android/Sdk"
export NDK_HOME="$ANDROID_HOME/ndk/26.1.10909125"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$PATH"

# Windows (PowerShell)
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:NDK_HOME = "$env:ANDROID_HOME\ndk\26.1.10909125"
$env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
```

#### 4. Install Rust Android Toolchains

```bash
rustup target add aarch64-linux-android
rustup target add armv7-linux-androideabi
rustup target add x86_64-linux-android
rustup target add i686-linux-android
```

#### 5. Install Node.js and Dependencies

```bash
# Node.js 20+
node -v  # Verify version

# Install project dependencies
npm install

# Install Tauri CLI
npm install -g @tauri-apps/cli
```

### Build Steps

#### 1. Initialize Android Project (First Time Only)

```bash
cd flymd
npx tauri android init
```

#### 2. Build Frontend

```bash
npm run build
```

#### 3. Build Android APK

**Debug version:**

```bash
npx tauri android build --debug
```

**Release version:**

```bash
npx tauri android build --release
```

#### 4. Locate Generated APK

```
src-tauri/gen/android/app/build/outputs/apk/
├── debug/
│   └── app-debug.apk
└── release/
    └── app-release.apk
```

### Install on Device

#### Using USB Connection

```bash
# Connect device and enable USB debugging
adb install src-tauri/gen/android/app/build/outputs/apk/debug/app-debug.apk
```

#### Using Android Emulator

```bash
npx tauri android dev
```

## Troubleshooting

### JAVA_HOME Not Set

```bash
# Find Java installation path
which java       # Linux/macOS
where java       # Windows

# Set JAVA_HOME
export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"  # Linux
export JAVA_HOME="/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home"  # macOS
```

### NDK Not Found

1. Open Android Studio → SDK Manager → SDK Tools
2. Check **NDK (Side by side)**
3. Install version 26.1.10909125
4. Set environment variable: `export NDK_HOME="$ANDROID_HOME/ndk/26.1.10909125"`

### Dependency Download Timeout (China Users)

Edit `src-tauri/gen/android/build.gradle`, add Aliyun mirrors:

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

### Rust Compilation Error

```bash
# Ensure Rust Android toolchains are installed
rustup target list --installed | grep android

# If missing, reinstall
rustup target add aarch64-linux-android armv7-linux-androideabi
```

## Android Features

### File Access

- **Desktop version**: Direct path access (`/path/to/file.md`)
- **Android version**: SAF URI mode (`content://com.android.providers...`)

### Mobile UI

- **FAB (Floating Action Button)**: New, open, save files, toggle preview
- **Drawer-style file library**: Slides out from left, shows recent files and WebDAV synced files
- **Virtual keyboard adaptation**: Editor auto-adjusts height

### Feature Limitations

- No auto-update (update via Google Play or manual installation)
- No drag-and-drop file opening
- No window state management
- WebDAV sync, S3 image upload, extension system fully compatible

## Reference Resources

- [Tauri Android Documentation](https://beta.tauri.app/develop/android/)
- [JNI Examples](https://github.com/jni-rs/jni-rs)
