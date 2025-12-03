# flyMD Collaboration Server (Open Source)

This document explains how to set up a flyMD collaboration server for real-time multi-user editing.

## Features

- WebSocket collaboration interface: `/ws`
- Room-based collaboration spaces with password protection, rooms auto-created on first connection
- Text content maintained in memory (cleared on process restart)
- Simple multi-user collaboration: document broadcast + line/paragraph level locking
- Built-in protections:
  - Single message size limit (default 256KB)
  - Single room content length limit (default 1MB)
  - Per-connection update rate limit (default max 60 `update` messages per 10 seconds)

## Requirements

- Node.js 18 or higher
- `ws` dependency installed

## Starting the Server

Upload the OSserver folder to your server and run:

```bash
npm init -y
npm install ws
node server.js
```

Default port is `3456`, configurable via environment variables:

- `COLLAB_OS_PORT` or `PORT`: HTTP / WebSocket listen port (default `3456`)
- `COLLAB_OS_PASSWORD_SALT`: Room password hash salt (optional, default `flymd-os-collab`)

### Health Check

```
GET /health → { "ok": true }
```

### WebSocket Address

```
ws://127.0.0.1:3456/ws
```

## Reverse Proxy Configuration

### Nginx Configuration Example

```nginx
# Proxy / for HTTP requests (health, etc.)
location / {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_pass http://127.0.0.1:3456/;
}

# WebSocket upgrade for /ws
location /ws {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_pass http://127.0.0.1:3456/ws;
}
```

## Protocol Specification

### Connection Parameters

Clients pass parameters via QueryString:

```
ws://127.0.0.1:3456/ws?room=demo&password=123456&name=fly
```

- `room`: Room ID (collaboration space identifier)
- `password`: Room password
- `name`: Display name (optional)

When a client first connects to a `room + password` combination, the server auto-creates the room; subsequent connections require the same password.

### Message Types (JSON)

#### Client → Server

```json
// Join room (sent on first connection)
{"type":"join","content":"current full text content"}

// Text update
{"type":"update","content":"current full text content"}

// Request lock on a line/paragraph
{"type":"lock","blockId":"b_xxx","label":"heading","color":"#rrggbb"}

// Release lock
{"type":"unlock","blockId":"b_xxx"}

// Heartbeat
{"type":"ping"}
```

#### Server → Client

```json
// Initial snapshot after joining room
{"type":"snapshot","content":"full text content"}

// Updated content from other clients
{"type":"update","content":"full text content"}

// Current lock states
{"type":"locks_state","locks":[{"blockId":"...","name":"...","color":"...","label":"..."}]}

// Current online collaborators
{"type":"peers","peers":["A","B"]}

// Lock failure
{"type":"lock_error","code":"locked_by_other","blockId":"b_xxx","name":"someone"}

// Error message
{"type":"error","code":"bad_request|bad_password|message_too_large|content_too_large|too_many_updates","message":"..."}
```

## Using with Collaboration Plugin

Install the "Collaboration" plugin from the extension marketplace.

In the plugin configuration panel, fill in:

- **Collaboration server address**: e.g., `ws://127.0.0.1:3456/ws`
- **Room ID**: Any string, e.g., `demo`
- **Room password**: Any string, e.g., `123456`
- **Display name**: Nickname shown in collaboration (optional)

Click "Connect" to establish a WebSocket connection with the server and start syncing the current document content.

## Important Notes

- All room information and content is stored in memory only, **everything is lost on process restart**
- No account system, spaces are only distinguished by `room + password`
- Recommend using HTTPS/WSS in production and configure appropriate access controls

## Getting the Server Code

Server code is located in the `OSserver` directory of the flyMD repository:

```bash
git clone https://github.com/flyhunterl/flymd.git
cd flymd/OSserver
npm install ws
node server.js
```
