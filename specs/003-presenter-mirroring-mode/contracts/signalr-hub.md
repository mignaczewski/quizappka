# Contract: Presenter SignalR Hub

**Feature**: 003-presenter-mirroring-mode  
**Date**: 2026-03-26  
**Status**: Active  
**Hub endpoint**: `/hubs/presenter`  
**Transport**: WebSocket only (`HttpTransportType.WebSockets` on client; no long polling, no SSE)

---

## Overview

The `PresenterHub` is the single communication channel between the presenter view and all mirror views. It is a server-side SignalR hub exposed at `/hubs/presenter`. Both presenter clients and mirror clients connect to the same hub endpoint. The hub manages:

- Receiving navigation state from the presenter client
- Broadcasting that state to all connected clients (including the presenter itself)
- Delivering the last-known state to any client that connects after the presenter has already navigated

---

## Client → Server (Hub Methods)

### `UpdateState`

Called by the **presenter client** whenever the presenter navigates to a new screen.

**Payload**: `PresenterStateDto`

```json
{
  "screen": "category-list" | "question-list" | "question-detail" | "idle",
  "categoryId": "string | null",
  "questionId": "string | null"
}
```

| Field | Rules |
|-------|-------|
| `screen` | Required. Must be one of the four enum values. Calls with an unknown value are silently dropped by the hub. |
| `categoryId` | Required (non-null, non-empty) when `screen` is `"question-list"` or `"question-detail"`. Ignored for other screens. |
| `questionId` | Required (non-null, non-empty) when `screen` is `"question-detail"`. Ignored for other screens. |

**Side effects**:
1. Updates `IPresenterSessionStore.CurrentState` to the received payload.
2. Broadcasts `StateUpdated` to **all** connected clients (presenter + all mirrors).

**Error behavior**: If validation fails (unknown screen value), the hub drops the message without sending an error back to the caller. The existing store state is not modified.

---

## Server → Client (Hub Events)

### `StateUpdated`

Pushed by the server to **all connected clients** in two cases:
1. Immediately when the presenter calls `UpdateState` (broadcast to all).
2. Immediately when any new client connects, **only to that client** (caller), if a current state exists (late-join delivery).

**Payload**: `PresenterStateDto` (same schema as above)

```json
{
  "screen": "category-list" | "question-list" | "question-detail" | "idle",
  "categoryId": "string | null",
  "questionId": "string | null"
}
```

**Client handling**:
- **Mirror clients**: Subscribe to `StateUpdated` on connect. On each event, update the displayed view to match the new `screen` value. Fetch category/question data from the REST API as needed.
- **Presenter clients**: May subscribe to confirm delivery, but the presenter page drives state — it does not need to react to `StateUpdated` from itself.

---

## Connection Lifecycle

### On Connect (`OnConnectedAsync`)

1. Server checks `IPresenterSessionStore.CurrentState`.
2. If a state exists, server immediately sends `StateUpdated` with that state to the connecting client only (`Clients.Caller`).
3. If no state exists (server just started, no presenter has published), the connecting client receives no message and renders the idle/waiting UI.

### On Disconnect (`OnDisconnectedAsync`)

1. Server removes the connection from the SignalR connection pool (handled automatically by the framework).
2. No state change is written to `IPresenterSessionStore` — the current state is retained.
3. Other connected clients are unaffected.

### Reconnection

Mirror clients use `.withAutomaticReconnect()`. On successful reconnect, the SignalR client re-fires `OnConnectedAsync` server-side, which delivers the current state to the reconnecting client. No manual re-subscribe logic is needed on the client.

---

## REST API — No Changes

The existing REST endpoints are unchanged by this feature. Mirror clients call them independently to load category and question data when `StateUpdated` indicates a new screen.

| Endpoint | Used by mirror? | Notes |
|----------|----------------|-------|
| `GET /api/quiz/categories` | Yes, when `screen = 'category-list'` | Mirror fetches and displays the list |
| `GET /api/quiz/categories/{id}` | Yes, when `screen = 'question-list'` or `'question-detail'` | Mirror fetches category and optionally resolves the current question |

Full REST schema: [../../../specs/002-question-list-navigation/contracts/quiz-api.md](../../../specs/002-question-list-navigation/contracts/quiz-api.md)

---

## Frontend Client Setup

```typescript
// src/QuizAppka/ClientApp/src/services/presenterHub.ts

import { HubConnectionBuilder, HttpTransportType, LogLevel } from '@microsoft/signalr';

// Module-level singleton: one connection shared across all presenter pages
let _connection: ReturnType<HubConnectionBuilder['build']> | null = null;

export function getPresenterHubConnection() {
  if (!_connection) {
    _connection = new HubConnectionBuilder()
      .withUrl('/hubs/presenter', { transport: HttpTransportType.WebSockets })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();
  }
  return _connection;
}
```

---

## Failure Modes

| Scenario | Behavior |
|----------|----------|
| Mirror connects; server has no current state | Mirror renders idle/waiting UI. Waits for the first `StateUpdated` without error. |
| Mirror loses WebSocket connection | `onreconnecting` fires; mirror shows a disconnected banner over the last-known content. Auto-reconnect resumes; on success `onreconnected` fires, server re-delivers current state, banner dismissed. |
| Presenter closes tab without navigating | Server retains the last known state. New mirrors that connect will see that state (stale but not error). Future: consider an explicit `presenter-disconnected` event if required. |
| Hub receives `UpdateState` with invalid `screen` | Hub drops the message silently. Store is not updated. Existing state is preserved. |
| WebSocket upgrade fails (proxy misconfiguration) | Connection fails with a transport error; the error is surfaced to the caller as a rejected `startAsync()` promise. No silent degradation to polling. |

---

## Versioning

This contract is version **1.0** (initial). Breaking changes (renaming methods, removing fields, changing required field semantics) require a version bump and corresponding update to this document.
