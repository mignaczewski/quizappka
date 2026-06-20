# Data Model: Timed Open Question

**Date**: 2026-06-20  
**Feature branch**: `010-timed-open-question`

---

## Entities

### TimedOpenQuestion *(new)*

A quiz question that preserves open-question semantics and includes required timer configuration.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Question identifier unique within a category. |
| `type` | `'timed-open'` | Discriminator for polymorphic serialization and frontend rendering. |
| `prompt` | `string` | Question text shown in presenter and mirror views. |
| `initialDurationSeconds` | `number` | Required countdown start value used by timer controls and reset behavior. |

**Validation rules**:
- `id` and `prompt` must be non-empty.
- `initialDurationSeconds` must be an integer greater than 0.

---

### TimerRuntimeState *(new, nested in RevealState)*

Live timer status shared between presenter and mirror during an active timed-open question.

| Field | Type | Description |
|-------|------|-------------|
| `status` | `'idle' \| 'running' \| 'paused' \| 'ended'` | Current state of timer lifecycle. |
| `remainingSeconds` | `number` | Remaining countdown value, non-negative integer. |
| `initialDurationSeconds` | `number` | Original configured duration copied from question for reset/reference. |
| `lastUpdatedAtUtc` | `string \| null` | Optional ISO timestamp for synchronization and stale-update handling. |

**Validation rules**:
- `remainingSeconds` must be between `0` and `initialDurationSeconds`.
- `status = 'ended'` implies `remainingSeconds = 0`.
- `status = 'idle'` implies `remainingSeconds = initialDurationSeconds` immediately after reset.

---

### RevealState *(modified)*

Existing runtime state envelope broadcast via SignalR `PresenterStateDto`.

| Field | Type | Before | After |
|-------|------|--------|-------|
| `memeImageRevealed` | `bool?` / `boolean \| null` | unchanged | unchanged |
| `singingPianosBoxesRevealed` | `PianoBoxReveal[]?` | unchanged | unchanged |
| `timerState` | `TimerRuntimeState?` | not present | present for timed-open questions |

**Constraints**:
- `timerState` is null/absent for non-timed question types.
- `timerState` is carried in `PresenterStateDto.RevealState` and mirrored to clients over `StateUpdated`.

---

## State Transitions

### Timer lifecycle

```text
idle --start--> running
running --pause--> paused
paused --start--> running
running --reach zero--> ended
idle|running|paused|ended --reset--> idle
```

Transition invariants:
- `reset` always restores `remainingSeconds` to `initialDurationSeconds`.
- `pause` freezes `remainingSeconds`.
- `start` from paused resumes from paused `remainingSeconds`.
- Countdown never goes below zero.

---

## Contract Surface Changes

### Backend models

- Add `TimedOpenQuestion` model and discriminator mapping in `Question` polymorphism.
- Extend `RevealState` with optional `TimerRuntimeState`.

### Frontend types

- Add `TimedOpenQuestion` to `Question` union.
- Add `TimerRuntimeState` and extend `RevealState` shape.

---

## Impact Matrix

| File | Change |
|------|--------|
| `src/QuizAppka/Models/Question.cs` | Add `JsonDerivedType` for `timed-open`. |
| `src/QuizAppka/Models/TimedOpenQuestion.cs` | New model with required timer config. |
| `src/QuizAppka/Models/RevealState.cs` | Add timer runtime state field. |
| `src/QuizAppka/Models/PresenterStateDto.cs` | No shape break; timer carried via extended `RevealState`. |
| `src/QuizAppka/Services/QuizDataService.cs` | Add validity checks for timed-open duration. |
| `src/QuizAppka/Controllers/QuizController.cs` | Ensure public/presenter responses include timed-open config and preserve presenter-data stripping logic. |
| `src/QuizAppka/ClientApp/src/types/quiz.ts` | Add timed-open and timer state TS types. |
| `src/QuizAppka/ClientApp/src/components/QuestionDisplay.tsx` | Render timed-open branch. |
| `src/QuizAppka/ClientApp/src/pages/QuestionDetailPage.tsx` | Presenter controls and UpdateState emission for timer transitions. |
| `src/QuizAppka/ClientApp/src/pages/MirrorPage.tsx` | Render synchronized timer in mirror mode. |
| `tests/QuizAppka.Tests/Models/QuestionSerializationTests.cs` | Add timed-open and timer state serialization tests. |
| `tests/QuizAppka.Tests/Controllers/QuizControllerTests.cs` | Add payload coverage for timed-open route responses. |
| `tests/QuizAppka.Tests/Hubs/PresenterHubTests.cs` | Add timer state broadcast and late-join replay tests. |
| `src/QuizAppka/ClientApp/src/pages/__tests__/QuestionDetailPage.test.tsx` | Add timer control behavior tests. |
| `src/QuizAppka/ClientApp/src/pages/__tests__/MirrorPage.test.tsx` | Add timer rendering/sync tests. |
| `tests/QuizAppka.E2E/tests/question-types.spec.ts` | Add timed-open presenter interactions. |
| `tests/QuizAppka.E2E/tests/mirroring.spec.ts` | Add timed-open mirror synchronization assertions. |
