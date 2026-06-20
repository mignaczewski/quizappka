# Contract: SignalR Timer State Synchronization

**Branch**: `010-timed-open-question` | **Date**: 2026-06-20  
**Hub endpoint**: `/hubs/presenter`  
**Methods/events**: `UpdateState` / `StateUpdated`

---

## Summary of Changes

Extend `PresenterStateDto.revealState` with optional `timerState` to synchronize timed-open countdown state between presenter and mirror views.

---

## Payload Shape Extension

### Existing envelope

```json
{
  "screen": "question-detail",
  "categoryId": "cat1",
  "questionId": "q1",
  "revealState": { }
}
```

### Extended `revealState` for timed-open

```json
{
  "screen": "question-detail",
  "categoryId": "cat1",
  "questionId": "q1",
  "revealState": {
    "timerState": {
      "status": "idle | running | paused | ended",
      "initialDurationSeconds": 60,
      "remainingSeconds": 60,
      "lastUpdatedAtUtc": "2026-06-20T10:00:00Z"
    }
  }
}
```

---

## Semantics

- Presenter is the only source allowed to emit timer control transitions.
- Mirror clients treat `timerState` as read-only and render based on received values.
- `start` action maps to:
  - `idle -> running`
  - `paused -> running`
- `pause` action maps to `running -> paused`.
- `reset` action maps any state to `idle` with `remainingSeconds = initialDurationSeconds`.
- Countdown completion maps to `ended` with `remainingSeconds = 0`.

---

## Validation Rules

- `remainingSeconds` MUST be integer and non-negative.
- `remainingSeconds` MUST NOT exceed `initialDurationSeconds`.
- `status = ended` requires `remainingSeconds = 0`.
- `status = idle` requires `remainingSeconds = initialDurationSeconds` immediately after reset.

---

## Failure Behavior

| Scenario | Behavior |
|----------|----------|
| Hub disconnected during control action | Presenter updates local UI state; hub invoke fails silently (existing best-effort behavior); next successful action re-synchronizes mirror. |
| Mirror reconnects after temporary outage | On reconnection, hub sends latest `StateUpdated` payload and mirror replaces stale timer state. |
| Invalid timer state received | Payload is ignored by client-side guards and existing state is preserved; implementation must avoid runtime crashes. |

---

## Backward Compatibility

- `timerState` is optional; non-timed questions continue to send `revealState` without timer data.
- Existing meme/singing-pianos reveal properties remain unchanged.

---

## Required Automated Verification

- Hub integration tests for timer state broadcast and late-join replay.
- Frontend page tests proving presenter actions update emitted `timerState` payload.
- Frontend mirror tests proving `StateUpdated` timer payload is rendered correctly.
- E2E test proving start/pause/reset transitions are observed in mirror within the success criterion budget.
