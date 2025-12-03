---
title: Plugin Development
slug: plugin-dev
order: 1
---

# flyMD Plugin Development Documentation

> This document describes how to develop plugins for flyMD

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Plugin Structure](#plugin-structure)
- [Plugin API](#plugin-api)
- [Lifecycle](#lifecycle)
- [Example Plugins](#example-plugins)
- [Publishing Plugins](#publishing-plugins)
- [Theme Extensions](#theme-extensions)

## Overview

flyMD provides a flexible plugin system that allows developers to extend the editor's functionality. Plugins can:

- Add custom menu items
- Access and modify editor content
- Call Tauri backend commands
- Use HTTP client for network requests
- Store plugin-specific configuration data
- Display notifications and confirmation dialogs

### Built-in Extensions

flyMD includes the following built-in extensions:

1. **Image Hosting (S3/R2)** - Upload images to S3/R2 object storage
2. **WebDAV Sync** - Sync documents via WebDAV protocol
3. **Typecho Publisher** - Publish articles to Typecho blog platform (optional)

## Quick Start

### 1. Create Plugin Project

Create a new directory with the following files:

```
my-plugin/
├── manifest.json    # Plugin manifest file
└── main.js          # Plugin main file
```

### 2. Write manifest.json

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "Plugin functionality description",
  "main": "main.js"
}
```

**Field Descriptions:**
- `id` (required): Unique plugin identifier, use lowercase letters and hyphens
- `name` (required): Plugin display name
- `version` (required): Plugin version number, semantic versioning recommended
- `author` (optional): Author information
- `description` (optional): Plugin functionality description
- `main` (required): Plugin entry file, defaults to `main.js`
- `minHostVersion` (optional): Minimum required flyMD version

### 3. Write main.js

```javascript
// main.js
export function activate(context) {
  // Executed when plugin is activated
  context.ui.notice('My plugin activated!', 'ok', 2000);

  // Add menu item
  context.addMenuItem({
    label: 'My Plugin',
    title: 'Click to execute plugin functionality',
    onClick: async () => {
      const content = context.getEditorValue();
      context.ui.notice('Current content length: ' + content.length, 'ok');
    }
  });
}

export function deactivate() {
  // Executed when plugin is deactivated (optional)
  console.log('Plugin deactivated');
}

export function openSettings(context) {
  // Open plugin settings interface (optional)
  context.ui.notice('Open settings interface', 'ok');
}
```

### 4. Publish to GitHub

1. Create a GitHub repository
2. Push `manifest.json` and `main.js` to the repository
3. Users can install via `username/repo` or `username/repo@branch` format

### 5. Install Plugin

In flyMD:
1. Click the "Extensions" button in the menu bar
2. Enter in the extension installation input box:
   - GitHub repository: `username/repository` or `username/repository@branch`
   - HTTP URL: `https://example.com/path/to/manifest.json`
3. Click the "Install" button

## Plugin Structure

### Basic Structure

```
my-plugin/
├── manifest.json       # Plugin manifest (required)
├── main.js            # Plugin main file (required)
├── README.md          # Documentation (recommended)
└── assets/            # Resource files (optional)
    └── icon.png
```

### manifest.json Details

```json
{
  "id": "example-plugin",
  "name": "Example Plugin",
  "version": "1.0.0",
  "author": "Your Name <email@example.com>",
  "description": "This is an example plugin demonstrating flyMD extension development",
  "main": "main.js",
  "minHostVersion": "0.3.0",
  "homepage": "https://github.com/username/example-plugin",
  "repository": "https://github.com/username/example-plugin"
}
```

## Plugin API

Plugins access flyMD functionality through the `context` object.

### context.http

HTTP client for network requests.

```javascript
// GET request
const response = await context.http.fetch('https://api.example.com/data', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});
const data = await response.json();

// POST request
const response = await context.http.fetch('https://api.example.com/post', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ key: 'value' })
});
```

### context.htmlToMarkdown

Built-in HTML to Markdown converter.

```javascript
// Basic usage
const md = await context.htmlToMarkdown('<h1>Title</h1><p>Some <b>bold</b> text</p>');
// md: "# Title\n\nSome **bold** text"

// With baseUrl
const html = '<p><a href="/post/123">View details</a></p>';
const md2 = await context.htmlToMarkdown(html, {
  baseUrl: 'https://example.com'
});
// md2: "[View details](https://example.com/post/123)"
```

### context.getFrontMatterRaw / context.getDocMeta / context.getDocBody

Read YAML Front Matter and parsed metadata from the current document.

```javascript
// 1. Raw Front Matter text
const raw = context.getFrontMatterRaw();

// 2. Parsed metadata object
const meta = context.getDocMeta();
// { title: "This is the title", keywords: ["markdown", "hexo"] }

// 3. Body part (Markdown without Front Matter)
const body = context.getDocBody();
```

### context.invoke

Call Tauri backend commands.

```javascript
try {
  const result = await context.invoke('command_name', {
    param1: 'value1',
    param2: 'value2'
  });
  console.log('Command result:', result);
} catch (error) {
  console.error('Command failed:', error);
}
```

### context.storage

Plugin-specific storage space.

```javascript
// Save data
await context.storage.set('key', { name: 'value', count: 42 });

// Read data
const data = await context.storage.get('key');
console.log(data); // { name: 'value', count: 42 }

// Delete data
await context.storage.set('key', null);
```

### context.addMenuItem

Add custom menu items to the menu bar, supporting simple items and dropdown menus.

#### Simple Menu Item

```javascript
const removeMenuItem = context.addMenuItem({
  label: 'Menu Text',
  title: 'Mouse hover tooltip',
  onClick: () => {
    context.ui.notice('Menu clicked!');
  }
});
```

#### Dropdown Menu

```javascript
context.addMenuItem({
  label: 'My Tools',
  title: 'Tools menu',
  children: [
    {
      label: 'Option 1',
      onClick: () => {
        context.ui.notice('Option 1 clicked');
      }
    },
    {
      label: 'Option 2',
      onClick: () => {
        context.ui.notice('Option 2 clicked');
      }
    }
  ]
});
```

#### Dropdown with Groups and Dividers

```javascript
context.addMenuItem({
  label: 'To-Do',
  children: [
    { type: 'group', label: 'Push' },
    { label: 'All', note: 'Completed/Incomplete', onClick: () => pushAll() },
    { label: 'Completed', onClick: () => pushDone() },
    { type: 'divider' },
    { type: 'group', label: 'Reminders' },
    { label: 'Create Reminder', note: '@time', onClick: () => createReminder() },
    { label: 'Advanced Features', disabled: true, note: 'Coming soon' }
  ]
});
```

### context.addContextMenuItem

Register context menu items in the editor.

```javascript
context.addContextMenuItem({
  label: 'Convert to Uppercase',
  icon: '🔤',
  condition: (ctx) => ctx.selectedText.length > 0,
  onClick: (ctx) => {
    const upperText = ctx.selectedText.toUpperCase();
    context.replaceRange(
      context.getSelection().start,
      context.getSelection().end,
      upperText
    );
    context.ui.notice('Converted to uppercase', 'ok');
  }
});
```

#### Context Object

```javascript
{
  selectedText: string,        // Currently selected text
  cursorPosition: number,      // Cursor position
  mode: 'edit' | 'preview' | 'wysiwyg',  // Current editing mode
  filePath: string | null      // Current file path
}
```

### context.ui.notice

Display notification messages.

```javascript
// Show success notification
context.ui.notice('Operation successful!', 'ok', 2000);

// Show error notification
context.ui.notice('Operation failed!', 'err', 3000);
```

### context.ui.confirm

Display confirmation dialog.

```javascript
const confirmed = await context.ui.confirm('Are you sure?');
if (confirmed) {
  context.ui.notice('User confirmed');
}
```

### context.ui.showNotification

Display notification bubble (bottom right).

```javascript
const id = context.ui.showNotification('Operation successful!', {
  type: 'success',  // 'success' | 'error' | 'info'
  duration: 2000
});

// Manually close
context.ui.hideNotification(id);
```

### context.layout.registerPanel

Register a plugin panel managed by the host.

```javascript
const panel = context.layout.registerPanel('main', {
  side: 'left',      // 'left' | 'right' | 'bottom'
  size: 320,         // pixels
  visible: true
});

panel.setVisible(false);
panel.setSize(420);
panel.dispose();
```

### context.getEditorValue / context.setEditorValue

Get/set current editor content.

```javascript
const content = context.getEditorValue();
context.setEditorValue('# New Content\n\nThis is new content');
```

### context.getSelection / context.getSelectedMarkdown

Get current selection info.

```javascript
const sel = context.getSelection();
console.log(sel.start, sel.end, sel.text);

const md = context.getSelectedMarkdown();
```

### context.pickDocFiles / context.openFileByPath

File selection and opening.

```javascript
const files = await context.pickDocFiles({ multiple: true });
await context.openFileByPath('C:/docs/note.md');
```

### context.createStickyNote

Create sticky note window.

```javascript
await context.createStickyNote('C:/notes/todo.md');
```

### context.exportCurrentToPdf

Export current document to PDF.

```javascript
await context.exportCurrentToPdf('C:/docs/note.pdf');
```

### context.registerAPI / context.getPluginAPI

Inter-plugin communication API.

```javascript
// Register API
context.registerAPI('my-utils', {
  formatDate: (date) => date.toISOString().split('T')[0],
  chunk: (array, size) => { /* ... */ }
});

// Get another plugin's API
const utils = context.getPluginAPI('my-utils');
if (utils) {
  const today = utils.formatDate(new Date());
}
```

### AI Assistant Shared API

API exposed by the AI Assistant plugin:

```javascript
const ai = context.getPluginAPI('ai-assistant');
if (ai && await ai.isConfigured()) {
  const result = await ai.quickAction(content, 'Continue');
  const translated = await ai.translate(text);
  const todos = await ai.generateTodos(content);
}
```

## Theme Extensions

### Global Object

```javascript
// Color palette
flymdTheme.registerPalette('Lavender', '#ede9fe')

// Typography style
flymdTheme.registerTypography('reading', 'Reading', `
  .container.typo-reading .preview-body { line-height: 2.0; }
`)

// Markdown style
flymdTheme.registerMdStyle('docs', 'Docs', `
  .container.md-docs { --c-key:#1f4eff; }
`)

// Theme preferences
const prefs = flymdTheme.loadThemePrefs()
flymdTheme.saveThemePrefs(prefs)
flymdTheme.applyThemePrefs(prefs)

// Listen to theme changes
window.addEventListener('flymd:theme:changed', (e) => {
  console.log('Theme changed:', e.detail.prefs)
})
```

## Lifecycle

### activate(context)

Called when plugin is activated (required).

```javascript
export function activate(context) {
  console.log('Plugin activated');
  // Initialize plugin...
}
```

### deactivate()

Called when plugin is deactivated (optional).

```javascript
export function deactivate() {
  console.log('Plugin deactivated');
  // Clean up resources...
}
```

### openSettings(context)

Open plugin settings interface (optional).

```javascript
export function openSettings(context) {
  // Display settings interface...
}
```

## Example Plugins

### Word Count Plugin

```javascript
export function activate(context) {
  context.addMenuItem({
    label: 'Word Count',
    onClick: () => {
      const content = context.getEditorValue();
      const chars = content.length;
      const words = content.split(/\s+/).filter(w => w.length > 0).length;
      const lines = content.split('\n').length;
      context.ui.notice(`Chars: ${chars} | Words: ${words} | Lines: ${lines}`, 'ok', 3000);
    }
  });
}
```

### HTTP Request Plugin

```javascript
export function activate(context) {
  context.addMenuItem({
    label: 'Get IP',
    onClick: async () => {
      try {
        const response = await context.http.fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        context.ui.notice(`Your IP: ${data.ip}`, 'ok', 3000);
      } catch (error) {
        context.ui.notice('Failed: ' + error.message, 'err');
      }
    }
  });
}
```

## Publishing Plugins

### Method 1: GitHub Publishing (Recommended)

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/my-plugin.git
git push -u origin main
```

Users install via `username/my-plugin`.

### Method 2: HTTP Publishing

Deploy to web server with CORS enabled:
```
Access-Control-Allow-Origin: *
```

Users install via full URL: `https://example.com/plugins/my-plugin/manifest.json`

## Submit Plugin to In-App Marketplace

Send plugin address and description to fly@llingfei.com or submit an issue.

## Best Practices

1. **Error Handling**: Always use try-catch to handle potential errors
2. **User Feedback**: Provide timely feedback on operation status
3. **Data Validation**: Validate data before operations
4. **Configuration Management**: Provide reasonable default configurations
5. **Scope Isolation**: Prefer `context.storage` and module scope

## Reference Resources

- [Typecho Publisher Plugin](https://github.com/TGU-HansJack/typecho-publisher-flymd)
- [flyMD GitHub Repository](https://github.com/flyhunterl/flymd)
- [Tauri Documentation](https://tauri.app/)
