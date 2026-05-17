# Implementation Plan: React Refactor — useCallback & Revealed State

**Branch**: `008-usecallback-revealed-state` | **Date**: 2026-05-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-usecallback-revealed-state/spec.md`

## Summary

Replace the positional `boolean[]` revealed-state for Singing Pianos with an identity-based `Array<{ id: string, revealed: boolean }>` so box reveal status is tied to the stable `PianoBox.id` rather than array index. Simultaneously, stabilise all callback props passed to child components via `useCallback` with correct dependency arrays to eliminate unnecessary child re-renders.

## Technical Context

**Language/Version**: TypeScript 5.8.3  
**Primary Dependencies**: React 19.1.0, React Router DOM 7.13, MUI 7.3.9, @microsoft/signalr 10.0.0  
**Storage**: N/A — all state is in-memory React state; no server-side persistence of reveal state  
**Testing**: vitest 4.1.1, @testing-library/react 16.3.2, @testing-library/user-event 14.6.1, jsdom 29  
**Target Platform**: Browser (SPA served by ASP.NET Core, also displayed on a mirror page via SignalR)  
**Project Type**: Web application — frontend SPA (React/Vite) backed by ASP.NET Core, real-time via SignalR  
**Performance Goals**: Zero unnecessary child re-renders on parent state change (verified by render-count tests)  
**Constraints**: Pure frontend refactor; no API version bump; hub payload shape change must be handled in same PR as mirror page consumer; backward compatibility with existing E2E tests  
**Scale/Scope**: 6 source files touched, ~10 test files updated/extended; no new runtime dependencies

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Evaluation

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Shared Domain Contracts | PASS | Hub payload `RevealState` is the only cross-layer boundary. Shape change is contained in a single `types/quiz.ts` edit; both sender (`QuestionDetailPage`) and receiver (`MirrorPage`) are updated in the same PR — no schema drift risk. |
| II. Quality Gates Are Non-Negotiable | PASS | Gates: `tsc --noEmit` (type-check), `eslint .` (lint including `eslint-plugin-react-hooks`), `vitest run` (unit tests). All must pass before merge. No exceptions. |
| III. Test Strategy Before Merge | PASS | Existing `SingingPianos.test.tsx` and `QuestionDisplay.test.tsx` updated for new types; new `onBoxReveal` identity tests in `QuestionDetailPage.test.tsx`; render-count tests for callback stability. No manual-only flows. |
| IV. Frontend-Backend Integration Confidence | PASS | No backend schema changes. The hub payload is frontend-only state. MirrorPage reads the same `RevealState` type — updating the type in `types/quiz.ts` propagates to both sides automatically. TypeScript type-check is the integration gate. |
| V. Maintainability Over Cleverness | PASS | Change introduces a named `PianoBoxReveal` interface with two fields; reveal lookup is a single `.find()` call. No abstraction layers added. |

### Post-Design Re-Evaluation

All Phase 1 artifacts generated. Re-evaluation confirms:

| Principle | Status | Post-Design Notes |
|-----------|--------|-------------------|
| I. Shared Domain Contracts | PASS | `contracts/signalr-reveal-state.md` documents the breaking change and its atomic migration. `StateUpdatedPayload` in `types/mirror.ts` references `RevealState` transitively — compile-time safe. |
| II. Quality Gates Are Non-Negotiable | PASS | `data-model.md` confirmed: 8 files touched, all in the frontend layer, all covered by the existing `vitest` + `tsc` + `eslint` gate stack. |
| III. Test Strategy Before Merge | PASS | Impact matrix in `data-model.md` names every test file that needs updating. Render-count tests are specifically called out for `onBoxReveal`, `onReveal`, and `handleBack`. |
| IV. Frontend-Backend Integration Confidence | PASS | Confirmed: no backend changes, no persisted payloads to migrate. TypeScript is the integration gate. |
| V. Maintainability Over Cleverness | PASS | `PianoBoxReveal` is a two-field interface; lookup is `.find()`. Idempotent early return is one `if` statement. No helper abstractions added. |

## Project Structure

### Documentation (this feature)

```text
specs/008-usecallback-revealed-state/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── signalr-reveal-state.md   # Phase 1 output
└── tasks.md             # Phase 2 output (speckit.tasks — NOT created here)
```

### Source Code

```text
src/QuizAppka/ClientApp/
├── src/
│   ├── types/
│   │   └── quiz.ts                          # PianoBoxReveal type + RevealState.singingPianosBoxesRevealed
│   ├── components/
│   │   ├── SingingPianos.tsx                # revealedBoxes prop type + id-based lookup
│   │   └── __tests__/
│   │       ├── SingingPianos.test.tsx       # updated to PianoBoxReveal[]
│   │       └── QuestionDisplay.test.tsx     # updated test fixture
│   └── pages/
│       ├── QuestionDetailPage.tsx           # useCallback fixes, onBoxReveal signature change
│       └── __tests__/
│           ├── QuestionDetailPage.test.tsx  # new state & callback-stability tests
│           └── MirrorPage.test.tsx          # update fixture if singingPianosBoxesRevealed is used
```

**Structure Decision**: Frontend-only SPA project. No backend files change.

## Complexity Tracking

No constitution violations. No complexity justification required.
