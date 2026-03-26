# Data Model: Presenter Mirroring Mode

**Feature**: 003-presenter-mirroring-mode  
**Branch**: `003-presenter-mirroring-mode`  
**Phase**: 1 – Design  
**Date**: 2026-03-26

---

## Overview

The mirroring feature introduces a single shared state entity: **PresenterState**. It represents what the presenter is currently showing. This is the sole piece of synchronized information — no quiz question content is transmitted over SignalR. Mirrors independently fetch question/category data from the existing REST API; SignalR only carries navigation coordinates.

---

## Entity: PresenterState

The presenter's current navigation state. Transmitted from the presenter view to the server hub, stored server-side, and pushed to all mirror clients.

### Discriminated Union (TypeScript — canonical definition)

```typescript
// src/QuizAppka/ClientApp/src/types/mirror.ts

export type PresenterScreen =
  | { screen: 'idle' }
  | { screen: 'category-list' }
  | { screen: 'question-list'; categoryId: string }
  | { screen: 'question-detail'; categoryId: string; questionId: string };
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `screen` | `string` enum | Yes | Discriminator: `'idle'`, `'category-list'`, `'question-list'`, `'question-detail'` |
| `categoryId` | `string` | Only for `question-list` and `question-detail` | Identifies the active category by its `CategorySummary.id` value |
| `questionId` | `string` | Only for `question-detail` | Identifies the active question by its `Question.id` value within the category |

### Server-Side DTO (C#)

```csharp
// src/QuizAppka/Models/PresenterStateDto.cs

public record PresenterStateDto(
    string Screen,
    string? CategoryId = null,
    string? QuestionId = null
);
```

Serialized over SignalR as JSON (default camelCase serialization via `System.Text.Json`).

### State Transitions

```
idle ──────────────────────────────────────────────────────► category-list
category-list ────── select category ──────────────────────► question-list
question-list ─────── select question ─────────────────────► question-detail
question-detail ───── back ─────────────────────────────────► question-list
question-list ──────── back ─────────────────────────────────► category-list
```

State never moves backward more than one step at a time through user-driven navigation. The presenter may also navigate directly (e.g., browser back button jumps multiple steps) — the state store always holds the latest published state regardless of how it was reached.

### Validation Rules

- `screen` MUST be one of the four defined values; the hub rejects (ignores) any `UpdateState` call with an unrecognized `screen` value.
- `categoryId` MUST be present and non-empty when `screen` is `question-list` or `question-detail`.
- `questionId` MUST be present and non-empty when `screen` is `question-detail`.
- The hub does NOT validate that `categoryId` or `questionId` correspond to real entities in the quiz data — that responsibility belongs to the presenter page which already validated these values before publishing.

### Idle State (No Active Session)

When the server starts or after a reset, `IPresenterSessionStore.CurrentState` returns `null`. A newly connected mirror client that receives no state on connect renders the idle/waiting screen.

When the presenter navigates to the home page (category list), the presenter emits `{ screen: 'category-list' }`, moving the session from `null` to an active state.

---

## Entity: PresenterSessionStore

Server-side singleton. Holds the last-published `PresenterStateDto` and serves it to late-joining mirror connections.

| Field | Type | Description |
|-------|------|-------------|
| `CurrentState` | `PresenterStateDto?` | The last state published by the presenter; `null` if no state has been published since server start |

**Thread safety**: `CurrentState` is protected by a lock (e.g., `System.Threading.Lock` in .NET 9+, or `object` + `lock` statement in earlier versions) — concurrent reads from multiple mirror `OnConnectedAsync` calls and a presenter write must not race.

---

## Relationship to Existing Data Model

No existing data model entities are changed. `PresenterStateDto` references `categoryId` and `questionId` as opaque string identifiers — the same values already used by `CategorySummary.id` and `Question.id` in the REST API. The mirror page resolves the full category/question data by calling the existing REST API endpoints using these identifiers.

This design intentionally avoids embedding quiz content in SignalR messages — keeping the SignalR payload small and decoupled from category data changes.
