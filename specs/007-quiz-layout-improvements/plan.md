# Implementation Plan: Quiz Layout Improvements

**Branch**: `007-quiz-layout-improvements` | **Date**: 2026-04-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-quiz-layout-improvements/spec.md`

## Summary

Improve the visual layout of the QuizAppka frontend so that question content is clearly readable on a projector or large display. The primary change is replacing the current ad-hoc `Container`/`Box`/`Stack` layout with MUI v7 `Grid` providing a 10-of-12-column centred content area (1-column margin each side). Question prompts will be scaled up to dominant heading typography. Answer options for closed and meme questions will be rendered as visually separated card-like blocks. Images (image-rebus and meme) will fill the available viewport height. The singing-pianos boxes will use a `Grid` sub-layout for uniform box sizing. The mirror view will render questions without presenter-only controls and with display-mode typography scaling. All changes are frontend-only — no backend or API contract changes.

## Technical Context

**Language/Version**: TypeScript 5.8 / React 19.1  
**Primary Dependencies**: MUI v7.3.9 (`@mui/material`), React Router DOM v7, Vite 6, Vitest 4  
**Storage**: N/A — frontend-only layout change  
**Testing**: Vitest + @testing-library/react  
**Target Platform**: Web browser (widescreen 1280×720+, Chrome/Firefox/Edge)  
**Project Type**: Web application (frontend-only feature)  
**Performance Goals**: No additional render cost; layout changes are CSS/MUI `sx`-level only  
**Constraints**: Must not break existing tests; MUI v7 Grid (Grid2 API) — no new dependencies  
**Scale/Scope**: 7 frontend components + 3 pages modified; ~10 component tests updated/added

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Contract scope**: Frontend-only. No API contracts, request/response schemas, or backend endpoints are affected. No shared contracts file needed.
- **Quality gates**: `npm run lint` (ESLint), `npm run type-check` (tsc --noEmit), `npm run test` (vitest run) — all must pass before merge.
- **Test strategy**: Component rendering tests for every modified component confirming layout structure; page-level rendering tests confirming Grid wrapper presence; existing tests must continue passing with updated selectors where necessary. Manual visual verification required for projector-distance readability (not automatable).
- **Cross-layer changes**: None — frontend layout only. Constitution Principle IV (Frontend-Backend Integration Confidence) does not apply.
- **Exceptions**: None. All constitution principles satisfied.

**Post-Phase-1 re-check**: ✅ No violations introduced. No API surfaces changed. No new dependencies. `DisplayMode` prop added to `QuestionDisplay` follows Principle V (Maintainability Over Cleverness) — a single string union prop, no abstraction overhead.

## Project Structure

### Documentation (this feature)

```text
specs/007-quiz-layout-improvements/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks — not created here)
```

### Source Code (repository root)

```text
src/QuizAppka/ClientApp/
├── src/
│   ├── components/
│   │   ├── ClosedQuestion.tsx         ← modified: block-style options, displayMode prop
│   │   ├── ImageRebusQuestion.tsx     ← modified: viewport-fill image layout
│   │   ├── MemeQuestion.tsx           ← modified: viewport-fill image, block-style options
│   │   ├── OpenQuestion.tsx           ← modified: displayMode-driven typography
│   │   ├── QuestionDisplay.tsx        ← modified: displayMode prop forwarded
│   │   └── SingingPianos.tsx          ← modified: Grid-based box layout
│   ├── pages/
│   │   ├── HomePage.tsx               ← modified: Grid 10-col wrapper
│   │   ├── MirrorPage.tsx             ← modified: Grid 10-col wrapper, displayMode='mirror'
│   │   ├── QuestionDetailPage.tsx     ← modified: Grid 10-col wrapper
│   │   └── QuestionListPage.tsx       ← modified: Grid 10-col wrapper
│   └── types/
│       └── quiz.ts                    ← no changes needed
└── src/
    ├── components/__tests__/
    │   ├── ClosedQuestion.test.tsx    ← updated: new layout assertions
    │   ├── ImageRebusQuestion.test.tsx← updated: image container assertions
    │   ├── MemeQuestion.test.tsx      ← updated: image/option layout assertions
    │   ├── OpenQuestion.test.tsx      ← updated: typography scale assertions
    │   ├── QuestionDisplay.test.tsx   ← updated: displayMode forwarding
    │   └── SingingPianos.test.tsx     ← updated: Grid layout assertions
    └── pages/__tests__/
        ├── HomePage.test.tsx          ← updated: Grid wrapper assertions
        ├── MirrorPage.test.tsx        ← updated: displayMode='mirror' + no presenter controls
        ├── QuestionDetailPage.test.tsx← updated: Grid wrapper assertions
        └── QuestionListPage.test.tsx  ← no changes expected
```

**Structure Decision**: Single web application, frontend-only. All changes are within `src/QuizAppka/ClientApp/src/`. No new files required — all modifications are to existing components and their tests.

## Complexity Tracking

> No constitution violations. No complexity deviations required.
