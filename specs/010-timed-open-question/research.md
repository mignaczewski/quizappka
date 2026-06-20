# Research: Timed Open Question

**Date**: 2026-06-20  
**Feature branch**: `010-timed-open-question`

All decisions are based on existing repository patterns in current frontend, backend, and SignalR flows.

---

## Decision 1: Introduce a new discriminator instead of extending `open`

**Decision**: Add a dedicated `timed-open` question type in both backend and frontend polymorphic unions.

**Rationale**: The requirement asks for a new question type while preserving current open-question behavior. A new discriminator prevents accidental timer UI leakage into existing `open` questions.

**Alternatives considered**:
- Extend existing `open` with optional timer fields: rejected because it increases regression risk for current open questions and weakens explicit type intent.

---

## Decision 2: Keep timer configuration in question definition and timer runtime state in live presenter state

**Decision**: Store initial timer duration on the `timed-open` question object; keep mutable timer runtime state inside `RevealState` sent via SignalR.

**Rationale**: This matches existing architecture where static question content comes from quiz API and live presenter interactions are synchronized through `UpdateState`/`StateUpdated` payloads.

**Alternatives considered**:
- Keep all timer data only in question payload: rejected because start/pause/reset runtime transitions must be synchronized live.
- Add a separate timer-specific hub endpoint/event: rejected as unnecessary protocol expansion.

---

## Decision 3: Presenter remains source of truth for timer actions

**Decision**: Presenter actions (start, pause/resume, reset) update local timer runtime state and immediately broadcast via existing `UpdateState`.

**Rationale**: This follows current reveal-state behavior (meme and singing-pianos), keeps ownership of actions in presenter view, and avoids backend scheduler complexity.

**Alternatives considered**:
- Server-authoritative ticking timer service: rejected for this scope because current architecture uses state relay, not server-managed timing loops.

---

## Decision 4: Represent timer runtime with explicit status and remaining time

**Decision**: Define timer runtime fields with explicit status (`idle`, `running`, `paused`, `ended`) and remaining duration.

**Rationale**: Explicit state machine semantics make start/pause/reset behavior testable and deterministic for both presenter and mirror.

**Alternatives considered**:
- Infer state from nullable timestamps alone: rejected because it complicates edge-case handling and test assertions.

---

## Decision 5: Validation rule for configured duration

**Decision**: Enforce configured timer duration to be strictly greater than zero at data-load/serialization boundaries.

**Rationale**: The feature must prevent unusable timed questions and provide clear failure behavior. Existing `QuizDataService` already filters invalid question payloads and logs warnings.

**Alternatives considered**:
- Allow zero duration and auto-end immediately: rejected because it does not provide meaningful timed interaction.

---

## Decision 6: Preserve current mirror behavior model

**Decision**: Mirror remains read-only and derives its timer rendering from `StateUpdated` payloads without action controls.

**Rationale**: This aligns with existing mirror constraints in architecture and tests; only presenter can initiate interactive controls.

**Alternatives considered**:
- Add mirror controls with role-based restrictions: rejected because it contradicts current mirror purpose and user request.

---

## Decision 7: Contract coverage across both REST and SignalR is mandatory

**Decision**: Produce two contracts in Phase 1: `quiz-api.md` for new question payload shape and `signalr-timer-state.md` for timer runtime sync semantics.

**Rationale**: Timer feature spans static question schema and live synchronization paths; both are cross-layer boundaries required by constitution principle I.

**Alternatives considered**:
- Single merged contract: rejected to keep static content schema and live state protocol independently versionable and reviewable.

---

## Decision 8: Reuse existing test pyramid and extend targeted suites

**Decision**: Extend existing backend serialization/controller/hub tests, frontend component/page tests, and E2E mirroring/question-type tests.

**Rationale**: Current test suite already validates similar patterns for hints and reveal-state synchronization; extending it minimizes new framework complexity.

**Alternatives considered**:
- Add new standalone test project: rejected as unnecessary for feature scope.

---

## No Unknowns Remaining

All technical clarifications required for planning are resolved.
