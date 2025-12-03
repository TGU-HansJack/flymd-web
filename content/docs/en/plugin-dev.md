---
title: Plugin Development
slug: plugin-dev
order: 1
---

# Plugin Development Guide

FlyMD supports extending functionality through plugins.

## Plugin Structure

A standard plugin contains:

```
my-plugin/
├── manifest.json
├── main.js
└── README.md
```

## manifest.json

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "A sample plugin",
  "author": "Your Name",
  "main": "main.js"
}
```

## Plugin API

### Register Menu Item

```javascript
flymd.menu.register({
  id: 'my-action',
  title: 'My Action',
  onClick: () => {
    console.log('Hello from plugin!');
  }
});
```

See the full documentation at [Plugin Docs](https://github.com/flyhunterl/flymd/blob/main/plugin.en.md)
