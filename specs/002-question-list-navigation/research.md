# Research: Question List Navigation

**Feature**: 002-question-list-navigation  
**Date**: 2026-03-26

---

## Decision 1: React Router URL Structure for Two-Level Navigation

**Decision**: Use two flat React Router routes:
- `/quiz/:categoryId` → `QuestionListPage` (question list)
- `/quiz/:categoryId/:questionId` → `QuestionDetailPage` (individual question)

**Rationale**: The current codebase uses flat routes in `App.tsx` (`/` and `/quiz/:categoryId`). Adding a second flat route at `/quiz/:categoryId/:questionId` is the minimal, consistent extension that aligns with the existing pattern, enables deep linking to individual questions (edge case in spec), and avoids introducing React Router Outlet/nested-route mechanics that would require restructuring the existing `App.tsx` layout.

**Alternatives considered**:
- **React Router nested routes** (`/quiz/:categoryId/` with Outlet): Provides co-location of layout logic but requires restructuring `App.tsx` layout wrapper and is more complex than the present feature warrants (constitution principle V: maintainability over cleverness).
- **Query parameter approach** (`/quiz/:categoryId?q=id`): Non-standard, breaks browser back button semantics, harder to deep-link.
- **Preserving `/quiz/:categoryId` route for list — redirect approach**: Unnecessary redirection step; cleaner to give QuestionListPage ownership of that exact route.

---

## Decision 2: Question Identifier in URL (ID vs Index)

**Decision**: Use the question's `id` field (string from JSON data) in the URL: `/quiz/:categoryId/:questionId`.

**Rationale**: The `Question` model already exposes a stable `id` field validated by `QuizDataService` (non-empty required). Using the semantic id provides stable deep links independent of question ordering. The `QuestionDetailPage` fetches the category via `fetchCategory(categoryId)` (already available) and then finds the question by `id` from the returned list — no new API call or endpoint needed.

**Alternatives considered**:
- **Array index in URL** (`/quiz/:categoryId/0`): Brittle if category data order changes; index has no intrinsic meaning to the presenter.
- **New backend endpoint** `GET /api/quiz/categories/:catId/questions/:qId`: Unnecessary given the category payload already includes all questions; contradicts the spec assumption that no backend changes are required.

---

## Decision 3: Desktop Layout Approach with MUI

**Decision**: Apply a desktop-first layout using MUI's `Container` component with a `maxWidth="lg"` (1200px) width, and set a minimum content width of 960px in the global CSS. Replace the mobile-centric padding and stacked single-column layout with a centered, appropriately-sized content area. Apply consistent `Typography` sizing appropriate for a projected/large-screen display.

**Rationale**: The current `index.css` sets box-sizing and base font but does not constrain layout for desktop viewports. The existing pages use `Container` without explicit `maxWidth`, which defaults to a responsive breakpoint that looks narrow on desktop. Since the target use case is a presenter sharing their screen with an audience, content should occupy a comfortable width on a desktop display (1080p or larger) without excessive whitespace or small touch-sized targets.

**Alternatives considered**:
- **Tailwind CSS migration**: Out of scope; introduces a new dependency and requires rewriting all existing MUI-styled components — disproportionate effort for a layout improvement.
- **Responsive breakpoint overhaul** (mobile + desktop both): Out of scope. The spec assumption states the primary user is a presenter on a desktop; mobile support is not a stated requirement.
- **Custom themed MUI breakpoints**: More configuration overhead than a `maxWidth` prop and global min-width; prefer the simpler solution (constitution principle V).

---

## Decision 4: Aspire Host Version Upgrade (9.* → 13.*)

**Decision**: Change `<PackageReference Include="Aspire.Hosting.AppHost" Version="9.*" />` to `Version="13.*"` in `src/QuizAppka.AppHost/QuizAppka.AppHost.csproj`.

**Rationale**: The user explicitly requested upgrading to Aspire 13. The `AppHost` project solely orchestrates the QuizAppka service for local development against Aspire's dashboard; no production infrastructure depends on this version. The change is a package version bump with no code changes required — `Program.cs` in the AppHost uses only the standard `AddProject` / `Build` / `Run` pattern that is stable across Aspire versions.

**Alternatives considered**:
- **Upgrading to a specific patch (e.g., `13.0.0`)**: Using `13.*` is consistent with the existing `9.*` floating-minor pattern, allowing patch updates to flow in automatically.
- **Leaving at version 9**: Contradicts the explicit user instruction.

---

## Decision 5: NavigationBar Removal Strategy

**Decision**: Delete `NavigationBar.tsx` and remove all imports of it. The `QuizPage.tsx` file is deleted entirely and replaced by `QuestionListPage.tsx` and `QuestionDetailPage.tsx`.

**Rationale**: The spec explicitly states (FR-007) that the previous/next controls must be removed as part of this change. `NavigationBar` has no other consumers — it is only used in `QuizPage`. Deleting the file avoids dead code. `QuizPage` is not extended/refactored to avoid accumulating dual responsibilities (list + detail); two separate, single-purpose page components are cleaner and independently testable.

**Alternatives considered**:
- **Repurposing QuizPage to show the list first**: Adds complexity to a single component; state management for "are we in list mode or question mode?" would be implicit — harder to test and understand.
- **Keeping NavigationBar for potential reuse**: YAGNI; the spec explicitly removes the next/previous flow. If it is needed in future it can be reintroduced.

---

## Resolved Unknowns Summary

| Was Unknown | Resolved To |
|---|---|
| URL structure for question detail | `/quiz/:categoryId/:questionId` (question `id` field) |
| Routing pattern (nested vs flat) | Flat routes in `App.tsx` |
| Desktop layout mechanism | MUI `Container maxWidth="lg"` + global min-width CSS |
| Aspire upgrade approach | Version wildcard `13.*` in AppHost csproj |
| NavigationBar fate | Deleted; `QuizPage` replaced by two new page components |
</content>
</invoke>