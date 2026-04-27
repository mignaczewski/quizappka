# Tasks: Quiz Layout Improvements

**Input**: Design documents from `/specs/007-quiz-layout-improvements/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Required — behavior changes in all modified components and pages must have structural rendering assertions before implementation where practical.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to ([US1], [US2], [US3])
- All paths are relative to `src/QuizAppka/ClientApp/`

---

## Phase 1: Setup

**Purpose**: Verify baseline passes and confirm tooling before any layout changes.

- [ ] T001 Run `npm run lint`, `npm run type-check`, and `npm run test` in `src/QuizAppka/ClientApp/` to confirm all checks pass before changes begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Introduce the `DisplayMode` type and wire it through `QuestionDisplay`. All user story component work depends on this.

**⚠️ CRITICAL**: No user story component work can begin until T002 and T003 are complete.

- [ ] T002 Add `export type DisplayMode = 'presenter' | 'mirror';` to `src/types/quiz.ts`
- [ ] T003 Update `src/components/QuestionDisplay.tsx`: add `displayMode?: DisplayMode` to the `Props` interface and forward the prop to `OpenQuestion`, `ClosedQuestion`, `ImageRebusQuestion`, `MemeQuestion`, and `SingingPianos` child renders

**Checkpoint**: `DisplayMode` type exported and `QuestionDisplay` forwarding prop — component story work can now begin in parallel.

---

## Phase 3: User Story 1 - Audience Sees Questions on a Large Display (Priority: P1) 🎯 MVP

**Goal**: Mirror view renders all question types with large display-mode typography (`h2` prompts, `h4` options), viewport-filling images (`80vh`), Piano boxes in a Grid, and no presenter-only controls visible.

**Independent Test**: Open `/mirror`, navigate through each question type from the presenter view, and confirm each renders with large headings, block-style options, and full-height images.

### Tests for User Story 1 ⚠️

> Write these tests before implementing. Run `npm run test` after adding them — they should fail for the correct structural reason before the implementation tasks are done.

- [ ] T004 [P] [US1] Update `src/components/__tests__/OpenQuestion.test.tsx`: add tests asserting that `displayMode='mirror'` renders prompt as `h2` element and hides presenter hint, and that default (presenter) renders prompt as `h4` with hint visible
- [ ] T005 [P] [US1] Update `src/components/__tests__/ClosedQuestion.test.tsx`: add tests asserting that options render as `Paper` cards (not `listitem` roles) in both modes, prompt is `h2` in mirror and `h4` in presenter, and hint is hidden in mirror mode
- [ ] T006 [P] [US1] Update `src/components/__tests__/ImageRebusQuestion.test.tsx`: add tests asserting that the image container has `maxHeight` of `80vh` when `displayMode='mirror'` and `70vh` in presenter mode, and prompt scales accordingly
- [ ] T007 [P] [US1] Update `src/components/__tests__/MemeQuestion.test.tsx`: add tests asserting image container `maxHeight` scales with `displayMode`, options render as `Paper` cards in both modes, and reveal button is not rendered when `onReveal` is absent
- [ ] T008 [P] [US1] Update `src/components/__tests__/SingingPianos.test.tsx`: add tests asserting that boxes are rendered inside a MUI Grid structure (each box `Button` has `fullWidth` and scaled `minHeight` per `displayMode`) and that prompt uses `h2` in mirror and `h4` in presenter
- [ ] T009 [P] [US1] Update `src/pages/__tests__/MirrorPage.test.tsx`: add tests asserting that the question-detail render path passes `displayMode='mirror'` to `QuestionDisplay` and that the page root uses a `Grid` wrapper instead of `Container`

### Implementation for User Story 1

- [ ] T010 [P] [US1] Update `src/components/OpenQuestion.tsx`: add `displayMode?: DisplayMode` prop; render prompt with `variant={displayMode === 'mirror' ? 'h2' : 'h4'}`; hide presenter hint when `displayMode === 'mirror'`
- [ ] T011 [P] [US1] Update `src/components/ClosedQuestion.tsx`: add `displayMode?: DisplayMode` prop; replace `List`/`ListItem`/`ListItemText` options with `Stack` of `Paper elevation={1}` cards; prompt variant `h2`/`h4`; option text variant `h4`/`h5`; hide hint in mirror
- [ ] T012 [P] [US1] Update `src/components/ImageRebusQuestion.tsx`: add `displayMode?: DisplayMode` prop; wrap `img` in `Box` with `sx={{ width: '100%', maxHeight: displayMode === 'mirror' ? '80vh' : '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}`; set `style={{ maxWidth: '100%', maxHeight: 'inherit', objectFit: 'contain' }}` on `img`; prompt variant `h2`/`h4`
- [ ] T013 [P] [US1] Update `src/components/MemeQuestion.tsx`: add `displayMode?: DisplayMode` prop; apply same `vh`-based image container as T012; replace `List`/`ListItem` options with `Stack` of `Paper` cards; prompt variant `h2`/`h4`; option text variant `h4`/`h5`
- [ ] T014 [P] [US1] Update `src/components/SingingPianos.tsx`: add `displayMode?: DisplayMode` prop; replace `Box` flex-wrap with `Grid container columns={4} spacing={2}`; render each box as `Grid size={1}` containing a `fullWidth` `Button`; set `minHeight` to `140px`/`100px` and `fontSize` to `'2rem'`/`'1.5rem'` per `displayMode`; prompt variant `h2`/`h4`
- [ ] T015 [US1] Update `src/pages/MirrorPage.tsx`: replace all `<Container>` usages with `<Box sx={{ width: '100%', minHeight: '100vh', pt: 4 }}><Grid container columns={12}><Grid size={10} offset={1}>…</Grid></Grid></Box>`; pass `displayMode='mirror'` to `<QuestionDisplay>` in the question-detail render path (depends on T003, T010–T014)

**Checkpoint**: User Story 1 fully functional — mirror view shows all question types with large text, block options, and full-height images. All T004–T009 tests pass.

---

## Phase 4: User Story 2 - Question Display Uses Screen Space Effectively (Priority: P2)

**Goal**: Presenter question-detail page uses the 10-of-12-column Grid wrapper and renders all question types with the updated component layouts (block options, scaled images) in presenter typography mode.

**Independent Test**: Open any question on `/quiz/:categoryId/:questionId` and confirm the layout uses the Grid column structure, prompts are `h4`-scale, options are Paper cards, and images fill proportional space.

### Tests for User Story 2 ⚠️

- [ ] T016 [P] [US2] Update `src/pages/__tests__/QuestionDetailPage.test.tsx`: add test asserting that the page renders a `Grid` wrapper (not a `Container`) and that `QuestionDisplay` receives no `displayMode` prop (or receives `undefined`/`'presenter'`), confirming back navigation buttons remain visible

### Implementation for User Story 2

- [ ] T017 [US2] Update `src/pages/QuestionDetailPage.tsx`: replace `<Container maxWidth="lg">` with `<Box sx={{ width: '100%', minHeight: '100vh', pt: 4 }}><Grid container columns={12}><Grid size={10} offset={1}>…</Grid></Grid></Box>`; do not pass `displayMode` to `<QuestionDisplay>` (presenter default applies automatically via T003 updates)

**Checkpoint**: User Story 2 complete — presenter question-detail page uses Grid layout and inherits all component layout improvements from Phase 3. All T016 tests pass.

---

## Phase 5: User Story 3 - Presenter Navigation Is Clean and Efficient (Priority: P3)

**Goal**: Home page and question list page use the 10-of-12-column Grid wrapper, providing consistent margins and clear separation across all presenter navigation screens.

**Independent Test**: Open `/` and `/quiz/:categoryId` and confirm each uses the Grid column wrapper, categories/questions are clearly spaced, and back navigation is visible without scrolling.

### Tests for User Story 3 ⚠️

- [ ] T018 [P] [US3] Update `src/pages/__tests__/HomePage.test.tsx`: add test asserting the page renders a `Grid` wrapper structure (not a `Container` at root level)
- [ ] T019 [P] [US3] Update `src/pages/__tests__/QuestionListPage.test.tsx`: add test asserting the page renders a `Grid` wrapper structure

### Implementation for User Story 3

- [ ] T020 [P] [US3] Update `src/pages/HomePage.tsx`: replace `<Container sx={{ mt: 4 }}>` with `<Box sx={{ width: '100%', minHeight: '100vh', pt: 4 }}><Grid container columns={12}><Grid size={10} offset={1}>…</Grid></Grid></Box>`
- [ ] T021 [P] [US3] Update `src/pages/QuestionListPage.tsx`: replace `<Container maxWidth="lg" sx={{ mt: 4 }}>` with the same `Box`+`Grid` wrapper pattern as T020

**Checkpoint**: All three user stories independently functional. Full layout consistent across all presenter navigation and mirror view. All T018–T019 tests pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gate and validation.

- [ ] T022 Run full quality gate in `src/QuizAppka/ClientApp/`: `npm run lint && npm run type-check && npm run test` — all must exit with code 0
- [ ] T023 [P] Verify `specs/007-quiz-layout-improvements/quickstart.md` manual checklist against the running application (mirror view + presenter view + navigation pages)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **blocks all component and page work**
- **User Story 1 (Phase 3)**: Depends on Foundational (T002+T003) — component tests and implementations can proceed in parallel once T003 is complete
- **User Story 2 (Phase 4)**: Depends on Foundational (T002+T003) and benefits from Phase 3 component changes already being merged
- **User Story 3 (Phase 5)**: Depends on Foundational (T002) only — page Grid changes are independent of component changes
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Requires T002+T003 (Foundational). No dependency on US2 or US3.
- **User Story 2 (P2)**: Requires T002+T003. Component improvements come automatically from US1 component changes.
- **User Story 3 (P3)**: Requires T002 only (no component prop changes). T020 and T021 are fully independent of US1 and US2.

### Within User Story 1

- T004–T009 (tests) can be written in parallel — each is a different file
- T010–T014 (component implementations) can be done in parallel — each is a different file
- T015 (MirrorPage.tsx) depends on T003 and T010–T014 all being complete

### Parallel Opportunities

- All of T004–T009 can run in parallel with each other
- All of T010–T014 can run in parallel with each other
- T004–T009 tests can be written before or concurrently with T010–T014 implementations
- T018–T019 and T020–T021 within US3 are parallel pairs
- T016 (US2 test) and T017 (US2 impl) can proceed in parallel with US3 work (T018–T021)

---

## Parallel Example: User Story 1 Component Work

```
# All component tests can be written in parallel (different files):
T004 — src/components/__tests__/OpenQuestion.test.tsx
T005 — src/components/__tests__/ClosedQuestion.test.tsx
T006 — src/components/__tests__/ImageRebusQuestion.test.tsx
T007 — src/components/__tests__/MemeQuestion.test.tsx
T008 — src/components/__tests__/SingingPianos.test.tsx
T009 — src/pages/__tests__/MirrorPage.test.tsx

# All component implementations can proceed in parallel after T003:
T010 — src/components/OpenQuestion.tsx
T011 — src/components/ClosedQuestion.tsx
T012 — src/components/ImageRebusQuestion.tsx
T013 — src/components/MemeQuestion.tsx
T014 — src/components/SingingPianos.tsx

# Then integrate:
T015 — src/pages/MirrorPage.tsx  (requires T003 + T010–T014)
```

---

## Implementation Strategy

**MVP Scope (User Story 1 alone)**: Implementing Phase 2 + Phase 3 delivers the highest-value outcome — a projector-ready mirror view with all question types readable at distance. This is independently demonstrable without US2 or US3.

**Incremental Delivery**:
1. Phase 2 (Foundational) → enables everything
2. Phase 3 (US1) → MVP value delivered; mirror view fully readable
3. Phase 4 (US2) → Presenter view consistency; quick win after US1 since component work is already done
4. Phase 5 (US3) → Navigation page polish; smallest change, can be delivered last
