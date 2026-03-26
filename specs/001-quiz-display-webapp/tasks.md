# Tasks: Quiz Display Web Application

**Input**: Design documents from `/specs/001-quiz-display-webapp/`  
**Branch**: `001-quiz-display-webapp`  
**Date**: 2026-03-26  
**Prerequisites used**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/quiz-api.md ✅ | quickstart.md ✅

**Tests**: Required — spec.md defines test evidence expectations for all three user stories.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[US#]**: User story this task belongs to
- Paths relative to repository root

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create the solution structure — .NET solution, projects, and frontend scaffold.

- [X] T001 Create solution file and directory structure: `QuizAppka.sln`, `src/`, `tests/` at repo root
- [X] T002 Create ASP.NET Core 10 web project `src/QuizAppka/QuizAppka.csproj` with SPA proxy properties (`SpaRoot`, `SpaProxyServerUrl`, `SpaProxyLaunchCommand`) targeting `src/QuizAppka/ClientApp/`
- [X] T003 Create .NET Aspire AppHost project `src/QuizAppka.AppHost/QuizAppka.AppHost.csproj` referencing `QuizAppka` web project
- [X] T004 Add both projects and test projects to `QuizAppka.sln`
- [X] T005 [P] Scaffold Vite + React + TypeScript + Material UI frontend in `src/QuizAppka/ClientApp/` using `npm create vite@latest` with react-ts template
- [X] T006 [P] Create xUnit test project `tests/QuizAppka.Tests/QuizAppka.Tests.csproj` with `Microsoft.AspNetCore.Mvc.Testing`, `xunit`, `Microsoft.NET.Test.Sdk` references; add project reference to `QuizAppka`
- [X] T007 [P] Create Playwright E2E test project `tests/QuizAppka.E2E/` with `@playwright/test`; configure `playwright.config.ts` pointing to backend base URL
- [X] T008 [P] Configure `src/QuizAppka/ClientApp/vite.config.ts`: set `outDir: '../wwwroot'`, server proxy `/api` → `https://localhost:7001`, `secure: false`
- [X] T009 [P] Configure ESLint + TypeScript ESLint in `src/QuizAppka/ClientApp/` with `npm run lint` script
- [X] T010 [P] Add `npm run type-check` (`tsc --noEmit`) and `npm run test` (vitest) scripts to `src/QuizAppka/ClientApp/package.json`
- [X] T011 [P] Configure `dotnet format` for `src/QuizAppka/QuizAppka.csproj`; verify `dotnet format --verify-no-changes` passes on empty project

**Checkpoint**: Solution builds (`dotnet build`), frontend installs (`npm install`), all quality gate commands execute without errors on an empty project.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend infrastructure that all user stories depend on — data models, JSON loading service, API skeleton, and `Program.cs` wiring. Must be complete before any user story work starts.

**⚠️ CRITICAL**: No user story tasks can begin until this phase is complete.

- [X] T012 Create directory `src/QuizAppka/Data/categories/` and add a sample `sample-category.json` matching the schema in `data-model.md` (used by all tests)
- [X] T013 Create directory `src/QuizAppka/wwwroot/images/rebus/` and add a placeholder image file for tests
- [X] T014 [P] Implement `src/QuizAppka/Models/Question.cs` — abstract base class with `Id`, `Prompt` and `[JsonPolymorphic]` / `[JsonDerivedType]` attributes for all three subtypes
- [X] T015 [P] Implement `src/QuizAppka/Models/OpenQuestion.cs` extending `Question`
- [X] T016 [P] Implement `src/QuizAppka/Models/ClosedQuestion.cs` extending `Question` with `Options: AnswerOption[]`
- [X] T017 [P] Implement `src/QuizAppka/Models/ImageRebusQuestion.cs` extending `Question` with `ImageRef: string`
- [X] T018 [P] Implement `src/QuizAppka/Models/AnswerOption.cs` with `Id` and `Text`
- [X] T019 [P] Implement `src/QuizAppka/Models/QuizCategory.cs` with `Id`, `Name`, `Questions: IReadOnlyList<Question>`
- [X] T020 Define `src/QuizAppka/Services/IQuizDataService.cs` — interface with `GetCategories()` and `GetCategory(string id)` methods
- [X] T021 Implement `src/QuizAppka/Services/QuizDataService.cs` — singleton, loads all `*.json` files from `Data/categories/` at startup using `System.Text.Json` polymorphic deserialization; validates and excludes invalid questions; logs warnings for skipped items
- [X] T022 Implement `src/QuizAppka/Controllers/QuizController.cs` — `[ApiController]`, `[Route("api/quiz")]`; inject `IQuizDataService`; stub both action methods (will be completed in US1/US2)
- [X] T023 Configure `src/QuizAppka/Program.cs`: register `IQuizDataService` as singleton, add controllers, `app.UseStaticFiles()`, `app.MapControllers()`, `app.MapFallbackToFile("index.html")`
- [X] T024 Configure `src/QuizAppka.AppHost/Program.cs`: `builder.AddProject<Projects.QuizAppka>("quizapp")` and `builder.Build().Run()`
- [X] T025 [P] Add TypeScript type definitions mirroring backend models to `src/QuizAppka/ClientApp/src/types/quiz.ts` (as specified in `contracts/quiz-api.md`)
- [X] T026 [P] Implement `src/QuizAppka/ClientApp/src/services/quizApi.ts` — `fetchCategories()` and `fetchCategory(id)` fetch wrappers with typed return values
- [X] T027 [P] Scaffold `src/QuizAppka/ClientApp/src/App.tsx` with React Router setup: `/` → `HomePage`, `/quiz/:categoryId` → `QuizPage`; install `react-router-dom`

**Checkpoint**: `dotnet build` succeeds; `npm run type-check` passes; `GET /api/quiz/categories` returns `200 []`; `GET /api/quiz/categories/unknown` returns `404`.

---

## Phase 3: User Story 1 — Start a Quiz Category (Priority: P1) 🎯 MVP

**Goal**: Presenter opens the app, sees a list of available categories, selects one, and the first question is displayed with category context.

**Independent Test**: Load the app with sample data containing multiple categories. Verify the category list renders. Select one category, confirm the first question for that category appears. Confirm a category with no valid questions cannot be started (FR-011).

### Tests for User Story 1 ⚠️

- [X] T028 [P] [US1] Backend unit test `tests/QuizAppka.Tests/Services/QuizDataServiceTests.cs`: verify `QuizDataService` loads valid categories, excludes categories with zero valid questions, and logs warnings for skipped items
- [X] T029 [P] [US1] Backend integration test `tests/QuizAppka.Tests/Controllers/QuizControllerTests.cs` — `GET /api/quiz/categories` returns `200` with correct `CategorySummary[]` for loaded data; empty-category case returns `[]`
- [X] T030 [P] [US1] Frontend component test `src/QuizAppka/ClientApp/src/components/__tests__/CategoryList.test.tsx`: renders list of categories from props; each item is clickable; empty state shows "no categories" message
- [X] T031 [P] [US1] Frontend component test `src/QuizAppka/ClientApp/src/pages/__tests__/HomePage.test.tsx`: fetches categories on mount; shows loading state; shows error state on fetch failure
- [X] T032 [P] [US1] Playwright E2E test `tests/QuizAppka.E2E/tests/category-selection.spec.ts`: open app → categories visible → click category → first question displayed

### Implementation for User Story 1

- [X] T033 [US1] Implement `GET /api/quiz/categories` in `src/QuizAppka/Controllers/QuizController.cs` — return `IEnumerable<CategorySummary>` (id + name only); exclude categories with no valid questions (FR-011)
- [X] T034 [US1] Implement `src/QuizAppka/ClientApp/src/components/CategoryList.tsx` — MUI `List` rendering `CategorySummary[]`; each item navigates to `/quiz/:categoryId` on click; shows empty-state message when list is empty (FR-002, FR-011)
- [X] T035 [US1] Implement `src/QuizAppka/ClientApp/src/pages/HomePage.tsx` — calls `fetchCategories()`, renders `CategoryList`, handles loading and error states (FR-002, SC-001)
- [X] T036 [US1] Implement `GET /api/quiz/categories/{id}` in `src/QuizAppka/Controllers/QuizController.cs` — return `CategoryDetail` with ordered question list; return `404` with problem details if not found (FR-003, FR-004, FR-011)
- [X] T037 [US1] Implement `src/QuizAppka/ClientApp/src/pages/QuizPage.tsx` — fetches `CategoryDetail` by `categoryId` from route params; initialises `questionIndex = 0`; renders first question via `QuestionDisplay`; shows category name as context (FR-003, SC-001)

**Checkpoint**: Presenter can open the app, see categories, select one, and see the first question. Invalid categories are not listed.

---

## Phase 4: User Story 2 — Display Different Question Types (Priority: P2)

**Goal**: Each question type (open, closed, image rebus) is rendered in the format appropriate to its type — correct fields shown, no irrelevant fields visible.

**Independent Test**: With a category containing one question of each type, confirm that: open shows prompt only (no options), closed shows prompt + options, image-rebus shows image + prompt. Unsupported type does not crash the app.

### Tests for User Story 2 ⚠️

- [X] T038 [P] [US2] Frontend component test `src/QuizAppka/ClientApp/src/components/__tests__/OpenQuestion.test.tsx`: renders prompt; does not render options or image
- [X] T039 [P] [US2] Frontend component test `src/QuizAppka/ClientApp/src/components/__tests__/ClosedQuestion.test.tsx`: renders prompt and all options; option count matches input; no image rendered
- [X] T040 [P] [US2] Frontend component test `src/QuizAppka/ClientApp/src/components/__tests__/ImageRebusQuestion.test.tsx`: renders image with correct `src` built from `imageRef`; renders prompt; shows error placeholder when image fails to load
- [X] T041 [P] [US2] Frontend component test `src/QuizAppka/ClientApp/src/components/__tests__/QuestionDisplay.test.tsx`: dispatches to correct component per `type`; renders fallback for unknown type
- [X] T042 [P] [US2] Backend unit test: validate that `QuizDataService` excludes closed questions with < 2 options and image-rebus questions with empty `imageRef`; verify warning is logged

### Implementation for User Story 2

- [X] T043 [P] [US2] Implement `src/QuizAppka/ClientApp/src/components/OpenQuestion.tsx` — MUI `Typography` for prompt; no options or image (FR-006)
- [X] T044 [P] [US2] Implement `src/QuizAppka/ClientApp/src/components/ClosedQuestion.tsx` — MUI `Typography` for prompt + MUI `List` for `options`; each option rendered as `ListItem` (FR-007)
- [X] T045 [P] [US2] Implement `src/QuizAppka/ClientApp/src/components/ImageRebusQuestion.tsx` — `<img src={/images/${question.imageRef}}>`; error handler shows placeholder; renders prompt (FR-008)
- [X] T046 [US2] Implement `src/QuizAppka/ClientApp/src/components/QuestionDisplay.tsx` — switch/discriminated union on `question.type`; dispatches to `OpenQuestion`, `ClosedQuestion`, or `ImageRebusQuestion`; renders error message for unknown type (FR-005, FR-012, FR-015)
- [X] T047 [US2] Wire `QuestionDisplay` into `QuizPage.tsx` — replace stub with real component using current `questions[questionIndex]` (FR-015)

**Checkpoint**: All three question types render correctly. Unknown type shows graceful error. No question type leaks fields from another type.

---

## Phase 5: User Story 3 — Move Through the Question Set (Priority: P3)

**Goal**: Presenter can navigate forward and backward through questions in order. Navigation is blocked at the first and last question. End-of-category is clearly communicated.

**Independent Test**: Start a category with 3 questions. Verify: next advances index, previous reverses it, at question 1 previous is disabled/absent, at last question next triggers the end-of-category state, question order in UI matches source data order.

### Tests for User Story 3 ⚠️

- [X] T048 [P] [US3] Frontend component test `src/QuizAppka/ClientApp/src/components/__tests__/NavigationBar.test.tsx`: previous disabled at index 0; next disabled/replaced at last index; callbacks fire on click
- [X] T049 [P] [US3] Frontend page test `src/QuizAppka/ClientApp/src/pages/__tests__/QuizPage.test.tsx`: index increments on next; index decrements on previous; end-of-category state shown at last question; question order matches source array order
- [X] T050 [P] [US3] Playwright E2E test `tests/QuizAppka.E2E/tests/navigation.spec.ts`: full flow — select category → advance through all questions → verify end-of-category message → verify no further navigation possible; verify back navigation returns correct question

### Implementation for User Story 3

- [X] T051 [US3] Implement `src/QuizAppka/ClientApp/src/components/NavigationBar.tsx` — MUI `Button` for Previous and Next; Previous disabled when `index === 0`; Next replaced with "End of Category" indicator when `index === questions.length - 1`; callbacks `onPrevious` / `onNext` passed as props (FR-009, FR-010)
- [X] T052 [US3] Add navigation state management to `src/QuizAppka/ClientApp/src/pages/QuizPage.tsx`: `questionIndex` state; `handleNext` / `handlePrevious` handlers clamped to `[0, questions.length - 1]`; pass handlers to `NavigationBar`; render end-of-category `Alert` when at last question (FR-009, FR-010, SC-003)

**Checkpoint**: Complete presenter flow works end-to-end: select category → navigate all questions in order → reach end-of-category → cannot advance further.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Hardening, consistency, and quality gates across all stories.

- [X] T053 [P] Run accessibility audit on `CategoryList`, `QuestionDisplay`, `NavigationBar` — verify MUI components have correct ARIA roles; add `aria-label` where missing (SC-004)
- [X] T054 [P] Add `alt` text strategy to `ImageRebusQuestion.tsx` — use `question.prompt` as `alt` attribute value (SC-004)
- [X] T055 [P] Add `appsettings.json` configuration for `DataDirectory` path override; update `QuizDataService` to read path from `IConfiguration` with default fallback to `Data/categories/`
- [X] T056 [P] Add structured logging (`ILogger<QuizDataService>`) for startup data load: count of categories loaded, count of questions skipped, names of excluded categories
- [X] T057 [P] Add `.editorconfig` to repo root with consistent C# and TypeScript formatting rules aligned with `dotnet format` and ESLint config
- [X] T058 Validate `quickstart.md` is accurate: run `dotnet run` from `src/QuizAppka/`, confirm SPA proxy starts Vite, confirm `GET /api/quiz/categories` returns data, confirm category selection flow works
- [X] T059 Run full quality gate suite and confirm all pass: `dotnet format --verify-no-changes`, `dotnet test`, `npm run lint`, `npm run type-check`, `npm run test`, `npx playwright test`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Requires Phase 1 completion — **blocks all user story phases**
- **Phase 3 (US1)**: Requires Phase 2 — no dependency on US2 or US3
- **Phase 4 (US2)**: Requires Phase 2 — no dependency on US3; UI components in T043–T045 can be built in parallel with Phase 3
- **Phase 5 (US3)**: Requires Phase 2 — depends on `QuizPage` structure from US1 (T037) for navigation state wiring
- **Phase 6 (Polish)**: Requires all prior phases complete

### User Story Dependencies

| Story | Blocking Dependency | Can Start Independently? |
|-------|--------------------|-----------------------|
| US1 (P1) | Phase 2 complete | ✅ Yes |
| US2 (P2) | Phase 2 complete; US2 component tests [T038–T041] are fully independent | ✅ Yes (components) — T046/T047 need US1's `QuizPage` scaffold |
| US3 (P3) | Phase 2 + T037 (`QuizPage` scaffold from US1) | Partial — T048/T049 tests and T051 `NavigationBar` can start after Phase 2 |

### Parallel Opportunities Per Story

**US1 parallel**: T028, T029, T030, T031 (all tests) can run simultaneously; T032 E2E after T033–T037.

**US2 parallel**: T038–T042 (all tests) and T043–T045 (renderers) fully parallel; T046 needs T043–T045; T047 needs T046.

**US3 parallel**: T048, T049 (tests) and T051 (`NavigationBar`) fully parallel; T052 needs T051 and T037.

### Within Each User Story

1. Tests identified first (write before implementation where practical — they should fail before coding)
2. Models / types before services
3. Services before controllers
4. Backend before frontend wiring
5. Story marked complete only when all its tests pass

---

## Implementation Strategy

**MVP scope**: Phase 1 + Phase 2 + Phase 3 (US1) — delivers a working app that loads categories and displays the first question. All other stories incrementally extend this base.

**Recommended sequence** (single developer):
1. Phase 1 (setup) → Phase 2 (foundation) → Phase 3 US1 → Phase 4 US2 → Phase 5 US3 → Phase 6 polish
2. Frontend component work for US2 (T043–T045 renderers) can be done in parallel with US1 backend integration work if desired

**All 59 tasks must pass their quality gates before the feature branch is merged.**
