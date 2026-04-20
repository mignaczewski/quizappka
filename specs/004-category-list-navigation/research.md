# Research: Category List Navigation Access

**Feature**: 004-category-list-navigation  
**Date**: 2026-04-20

---

## Decision 1: Button vs Other Navigation Pattern (Breadcrumb, Link, etc.)

**Decision**: Use a MUI `Button` with `variant="text"` in each page, consistent with the existing "← Back to questions" button that is already present in `QuestionDetailPage`.

**Rationale**: `QuestionDetailPage` already uses a MUI `Button variant="text"` for back navigation. Matching that pattern for the category back button is the simplest, most maintainable choice and requires zero new dependencies or components. A breadcrumb trail or a persistent navigation bar would require a shared layout wrapper, new component, and more invasive changes — disproportionate effort for two buttons.

**Alternatives considered**:
- **MUI `Breadcrumbs`**: Semantically richer but requires a shared layout component or repetition in multiple pages, and does not match the current single-button pattern.
- **React Router `<Link>`**: Works but lacks the visual consistency provided by MUI `Button`; the existing detail page already uses a button so consistency favors `Button`.
- **Persistent top navigation bar**: Would require a layout wrapper wrapping all presenter routes, restructuring `App.tsx`, and is beyond the scope of "simple navigation buttons."

---

## Decision 2: Placement of "Back to Categories" in QuestionDetailPage (Alongside or Replacing the Existing "Back to Questions")

**Decision**: Keep the existing "← Back to questions" button and add a second "← Back to categories" button above it in `QuestionDetailPage`. Both navigation options are available simultaneously.

**Rationale**: The spec says navigating to categories from the question view should be possible but does not remove the intermediate step (question → question list). Preserving the existing "Back to questions" button avoids a regression for the User Story covered by feature 002 (navigating back from a question to its list). Adding a second button above it places the broader navigation shortcut in the more prominent position, consistent with the layout hierarchy (categories are higher in the hierarchy than question list).

**Alternatives considered**:
- **Replace "Back to questions" with "Back to categories"**: Would break the previously specified and tested flow of returning from a question to the question list (feature 002 regression). Rejected.
- **Dropdown/menu combining both**: Adds complexity and an extra user step; a simple two-button row is more direct.

---

## Decision 3: React Router Navigation Method (navigate('/') vs Link)

**Decision**: Use the `navigate('/')` call from `useNavigate()` (already imported in both pages) for the button `onClick`, matching the pattern used by `handleBack` in `QuestionDetailPage`.

**Rationale**: Both page files already import `useNavigate` from `react-router-dom`. Adding `onClick={() => navigate('/')}` to a new button incurs zero new imports. A `<Link>` component would require an import change and diverge from the existing imperative style of the file.

**Alternatives considered**:
- **`<Link to="/">`**: Equivalent outcome, equally valid, but deviates from the existing `navigate()` pattern used in the file by `handleBack`. Consistency within the file favors `navigate`.
- **`window.location.href = '/'`**: Hard navigation; reloads the SPA and loses React state. Not acceptable.

---

## Decision 4: Test Approach — New Tests vs Extending Existing Tests

**Decision**: Add new `it(...)` cases to the existing `describe('QuestionListPage', ...)` and `describe('QuestionDetailPage', ...)` blocks in the respective test files. No new test file is created.

**Rationale**: The existing test files cover the full lifecycle of each page (loading, error, content). Adding cases for "button is present" and "button navigates to /" within the same `describe` block maintains locality and avoids duplicating mock setup. The existing `vi.mock` and `renderPage` helper are shared by all tests in each file.

**Alternatives considered**:
- **New test files per feature**: Creates artificial fragmentation; the button is part of the same component, not a new component.
- **E2E tests only**: The spec calls for automated test coverage before merge; component-level tests are faster and more deterministic than E2E for asserting that a specific button exists and triggers a route change.

---

## Resolved Unknowns Summary

| Was Unknown | Resolved To |
|---|---|
| Navigation UI pattern | MUI `Button variant="text"` (matches existing page conventions) |
| QuestionDetailPage: alongside or replace existing button | Add alongside — keep existing "Back to questions" |
| Navigation call style | `navigate('/')` via `useNavigate` (already imported) |
| Test approach | New `it(...)` cases in existing test `describe` blocks |
