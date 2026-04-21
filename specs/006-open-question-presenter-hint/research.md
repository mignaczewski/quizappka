# Research: Open Question Presenter Hint

**Branch**: `006-open-question-presenter-hint` | **Date**: 2026-04-21

## Overview

All research questions for this feature were resolved by inspecting the existing
implementation for the closed question presenter hint (feature 005), which is
already in production and provides an exact template.

---

## Decision 1: Mechanism for excluding `presenterHint` from the public API response

**Decision**: Extend the `StripPresenterData` method in `QuizController` to handle `OpenQuestion` in addition to `ClosedQuestion`. The null-replacement approach returns a new model instance with `PresenterHint = null`, which combined with `[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]` on the field means the property is absent from the serialized JSON entirely.

**Rationale**: This is the identical pattern used for `ClosedQuestion`. No new abstraction or middleware is needed. The field is never serialized when null, so it cannot leak through caching, logging, or indirect serialization paths.

**Alternatives considered**:
- A dedicated public DTO that omits `PresenterHint` — rejected because it would require new mapping code and a parallel type hierarchy for a one-field difference, adding maintenance burden without benefit over the existing null-stripping approach.
- A separate serialization policy or view — rejected as over-engineering for a single optional field.

---

## Decision 2: Frontend rendering of `presenterHint` on open questions

**Decision**: Update `OpenQuestion.tsx` to render `presenterHint` using the same conditional block already present in `ClosedQuestion.tsx`: plain text is rendered as a `<Typography>` element; a value starting with `https://` or `http://` is rendered as a `<Link>` with `target="_blank" rel="noopener noreferrer"`. The `data-testid="presenter-hint"` attribute is used so tests can assert presence/absence.

**Rationale**: This is the identical rendering pattern from `ClosedQuestion.tsx`. Using the same UI pattern ensures the hint is visually and behaviourally indistinguishable between question types, fulfilling SC-002.

**Alternatives considered**:
- A shared `PresenterHint` component extracted from `ClosedQuestion.tsx` — this would be the ideal refactor if a third question type needed the same rendering, but introducing a shared component for only two consumers is premature abstraction. The feature request asks for parity, not a new abstraction layer.

---

## Decision 3: TypeScript type definition

**Decision**: Add `presenterHint?: string` to the `OpenQuestion` interface in `quiz.ts`, mirroring the `presenterHint?: string` field on `ClosedQuestion`.

**Rationale**: The field is optional on the wire (may be absent when not configured in the JSON data file). The TypeScript type must reflect that. The mirror view loads questions from the public `/api/quiz/categories/{id}` endpoint, which never returns the field, so the mirror component (`QuestionDisplay` → `OpenQuestion`) will never receive a `presenterHint` value in practice.

**Alternatives considered**: None — a non-optional field would require every caller to provide the value, which is incorrect.

---

## Decision 4: Mirror view isolation

**Decision**: No changes are needed to the mirror view or `MirrorPage.tsx`. The mirror fetches question data from the **public** API route (`/api/quiz/categories/{id}`), which strips presenter hints. `QuestionDisplay` passes the `question` object directly to `OpenQuestion`; since the public API never includes `presenterHint`, the field is `undefined` in the mirror context, and the conditional rendering block never fires.

**Rationale**: The isolation is architectural — it is enforced at the API layer, not the UI layer. This avoids the risk of a future UI refactor accidentally re-introducing the hint in the mirror.

**Alternatives considered**: An explicit `showPresenterHint` prop on the component — rejected because the API-layer guarantee is sufficient and adding a UI-level toggle introduces an extra contract to maintain.

---

## Resolved Unknowns

| Unknown | Resolution |
|---------|-----------|
| How is `presenterHint` hidden from public API? | `StripPresenterData` in `QuizController` sets the field to null; `JsonIgnore(WhenWritingNull)` prevents serialization. Same mechanism as ClosedQuestion. |
| How should the frontend render a URL vs plain text? | Identical `isUrl()` helper and conditional `<Link>` block already in `ClosedQuestion.tsx`. |
| Does the mirror view need any changes? | No. Mirror loads from the public endpoint that strips the field. |
| Does `OpenQuestion` need a new JSON discriminator? | No. The `type: "open"` discriminator is unchanged; only a new field is added. |
