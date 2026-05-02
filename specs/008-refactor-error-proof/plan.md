# Implementation Plan: Code Refactoring for Predictability and Error Safety

**Branch**: `008-refactor-error-proof` | **Date**: 2026-05-02 | **Spec**: [spec.md](spec.md)

## Summary

Fix eight identified fragile patterns across the frontend and backend: a stale-closure state bug in `QuestionDetailPage.onBoxReveal`, a side effect inside a state updater, infinite spinners from missing URL parameters, silent error swallowing in `MirrorPage`, invalid SignalR broadcasts on empty params, a misleading `disabled` prop on piano buttons, missing backend validation for `SingingPianosQuestion` and `MemeQuestion`, and duplicated `isUrl` helpers. Additionally: add `useCallback` to all callbacks passed to child components to prevent unnecessary rerenders, and upgrade the piano box reveal state from a positional `boolean[]` to a named `RevealedBox[]` keyed by box `id`.

Additional requirements from plan arguments: `useCallback` on all component callbacks; `singingPianosBoxesRevealed` refactored to `RevealedBox[]` with `{ id: string, revealed: boolean }` shape.

## Technical Context

**Language/Version**: TypeScript 5.8 (frontend) / C# .NET 10 (backend)  
**Primary Dependencies**: React 19, MUI 7, React Router 7, @microsoft/signalr 10 (frontend) | ASP.NET Core 10, System.Text.Json (backend)  
**Storage**: JSON files on disk — read-only at runtime  
**Testing**: Vitest 4 + @testing-library/react 16 + jsdom (frontend) | xUnit 2.9 + WebApplicationFactory + real SignalR WebSocket (backend)  
**Target Platform**: Web application — Vite SPA served by ASP.NET Core  
**Project Type**: Full-stack web application (SPA + REST API + SignalR hub)  
**Performance Goals**: None — correctness and predictability are the goals  
**Constraints**: `RevealState.singingPianosBoxesRevealed` type change is a breaking SignalR wire-format change; frontend and backend must be updated atomically in the same PR  
**Scale/Scope**: Single-instance presenter-to-audience mirroring; ~14 source files changed, ~6 test files added/updated

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

- **Contract scope**: `RevealState` is shared between frontend and backend over SignalR — explicitly versioned in [contracts/api-and-hub.md](contracts/api-and-hub.md). The REST category response gains a new optional `validationError` field — contract documented in the same file. Both contracts are designed before implementation.
- **Quality gates**:
  - Frontend: `npx tsc --noEmit` (type check), `npm run lint`, `npx vitest run`
  - Backend: `dotnet build`, `dotnet test`
- **Test strategy**:
  - Component tests (`SingingPianos.test.tsx`): revealed-by-ID lookup, `disabled` state, onBoxReveal signature change
  - Unit tests (`QuestionDetailPage.test.tsx`): state updater correctness (no stale closure), hub effect fires after state change, hub not called on empty params
  - Unit tests (`QuizDataServiceTests.cs`): `FilterValidQuestions` for empty piano boxes and empty meme entryImage
  - Serialization tests (`QuestionSerializationTests.cs`): updated for `RevealedBox[]` wire format
  - Hub integration tests (`PresenterHubTests.cs`): updated for new `RevealedBox[]` wire format
- **Cross-layer validation**: `PresenterHubTests.cs` connects a real `HubConnection` against an in-memory `WebApplicationFactory` server and deserializes the `RevealState` payload — this validates the wire format end-to-end without mocks.
- **No constitution exceptions required**.

## Project Structure

### Documentation (this feature)

```text
specs/008-refactor-error-proof/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── api-and-hub.md   ← Phase 1 output
└── tasks.md             ← Phase 2 output (not yet created)
```

### Source Code (affected files)

```text
src/QuizAppka/
├── Models/
│   ├── Question.cs                          ← add ValidationError property
│   ├── RevealState.cs                       ← bool[]? → RevealedBox[]?
│   └── RevealedBox.cs                       ← NEW record
└── Services/
    └── QuizDataService.cs                   ← FilterValidQuestions: piano + meme cases

src/QuizAppka/ClientApp/src/
├── types/
│   └── quiz.ts                              ← RevealedBox type, RevealState update, validationError
├── utils/
│   └── url.ts                               ← NEW shared isUrl helper
├── components/
│   ├── SingingPianos.tsx                    ← new prop types, by-ID lookup, fix disabled
│   ├── ClosedQuestion.tsx                   ← use shared isUrl
│   └── OpenQuestion.tsx                     ← use shared isUrl
├── hooks/
│   └── usePresenterSession.ts               ← guard empty params
└── pages/
    ├── QuestionDetailPage.tsx               ← stale closure fix, useCallback, hub useEffect
    ├── QuestionListPage.tsx                 ← missing-param guard, useCallback
    └── MirrorPage.tsx                       ← error state on connection failure

tests/QuizAppka.Tests/
├── Models/
│   └── QuestionSerializationTests.cs        ← update RevealedBox[] test
└── Services/
    └── QuizDataServiceTests.cs              ← new piano + meme validation tests
```

**Structure Decision**: Existing web application layout. No new projects or layers. One new utility file (`utils/url.ts`) and one new model file (`RevealedBox.cs`) added; all other changes are modifications to existing files.

## Complexity Tracking

> No constitution violations — no tracking required.

---

## Implementation Notes (per story)

### Story 1 — Reliable State Updates (stale closure + side effect)

**Root cause**: `onBoxReveal` spreads `revealState` (outer scope closure) instead of `currentReveal` (updater arg). Hub invoke runs inside the updater.

**Fix strategy**:
1. Change spread: `...revealState` → `...currentReveal` (inside `setRevealState(currentReveal => ...)`)
2. Remove hub invoke from inside the updater
3. Add a dedicated `useEffect([revealState, categoryId, questionId])` that broadcasts state to hub after every committed change
4. Wrap `onBoxReveal` in `useCallback([question])` — `revealState` no longer needed as dep
5. Change `onBoxReveal` signature: `(index: number)` → `(id: string)` (aligns with RevealedBox model)
6. Fix `onReveal` (meme): also use functional updater `setRevealState(current => ({ ...current, memeImageRevealed: true }))`, wrap in `useCallback([])`
7. Wrap `handleBack` in `useCallback([navigate, categoryId])`

### Story 2 — Infinite Spinner Fix

**Fix strategy**:
- `QuestionDetailPage` useEffect: add guard `if (!categoryId) { setError('Missing category'); setLoading(false); return; }`
- `QuestionListPage` useEffect: same guard
- `MirrorPage`: add `error` state; replace `.catch(() => {})` on `startPresenterHub()` with `.catch(err => setError(err.message ?? 'Connection failed'))`; render `<Alert severity="error">` when error is set

### Story 3 — Guard Empty Broadcasts

**Fix strategy**:
- In `usePresenterSession.ts`: add guard — if `categoryId` is an empty string (not null — we distinguish "not applicable" from "missing"), skip the hub invoke
- In `QuestionDetailPage`: keep the `usePresenterSession` call but pass `categoryId ?? ''` / `questionId ?? ''` as before — the hook-level guard handles it

### Story 4 — Piano Button disabled

**Fix**: Change `disabled={isRevealed && !onBoxReveal}` → `disabled={isRevealed}`

### Story 5 — Backend Validation + Error Indicator

**Fix strategy**:
- Add `ValidationError { get; set; }` to `Question.cs`
- In `FilterValidQuestions`, for `SingingPianosQuestion` with empty `Boxes`: `question.ValidationError = "No boxes defined"; valid.Add(question);`
- For `MemeQuestion` with empty `EntryImage`: `question.ValidationError = "Missing entry image"; valid.Add(question);`
- Frontend `QuestionList.tsx`: render a warning indicator (e.g., MUI `<Chip label="Invalid" color="error" size="small">`) when `question.validationError` is set

### Story — useCallback (additional requirement)

**Scope**: All callbacks passed as props to child components must be wrapped in `useCallback`.

| Component | Callback | `useCallback` deps |
|-----------|----------|--------------------|
| `QuestionDetailPage` | `onBoxReveal` | `[question]` |
| `QuestionDetailPage` | `onReveal` | `[]` |
| `QuestionDetailPage` | `handleBack` | `[navigate, categoryId]` |
| `QuestionListPage` | `onSelectQuestion` | `[navigate, categoryId]` |

### Story — Shared isUrl

**Fix**: Create `src/utils/url.ts` with `export function isUrl(value: string): boolean`. Both `ClosedQuestion.tsx` and `OpenQuestion.tsx` import from this path and remove their local definitions.
