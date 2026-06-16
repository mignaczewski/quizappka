# Research: Question Title Field and Universal Presenter Hint

**Branch**: `009-question-title-universal-hint`  
**Date**: 2026-06-16

## Decision 1: Where to add the `title` field — base class vs. per-type

**Decision**: Add `title` as an optional property on the abstract `Question` base class in `Question.cs`.

**Rationale**: All five question types (open, closed, image-rebus, meme, singing-pianos) need the field. Placing it on the base class avoids duplication across five model files and ensures the `QuestionList` frontend component can access it uniformly via the `Question` union type without a type switch. The field is decorated `[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]` so it is absent from serialized JSON when not set, preserving backwards compatibility.

**Alternatives considered**:
- Per-type property on each derived class — rejected; requires five identical declarations and a type switch or extra mapping in the frontend list component with no benefit.
- Separate `title` property only on a new interface — rejected; no interface-based polymorphism is in use; adds unnecessary abstraction.

---

## Decision 2: Fallback display logic in `QuestionList` when `title` is absent

**Decision**: Use the helper order: `question.title` → `question.prompt` → type-label constant. The existing `noWrap` + `textOverflow: 'ellipsis'` CSS in `QuestionList.tsx` already handles visual truncation; no substring slicing is needed.

**Rationale**: Every question type already has a `prompt` field on the base class. Only in the theoretically possible but currently unobserved case of both `title` and `prompt` being empty strings does the type-label fallback apply. CSS ellipsis is the correct truncation mechanism for a list component — it adapts to container width rather than a fixed character count.

**Alternatives considered**:
- Substring to 60 chars in JavaScript — rejected; duplicates what CSS already does and breaks for different screen sizes.
- Always require `title` (no fallback) — rejected; breaks backwards compatibility with all existing JSON data files.

---

## Decision 3: Adding `presenterHint` to `MemeQuestion` and `SingingPianosQuestion`

**Decision**: Apply the identical pattern used for `ClosedQuestion` (feature 005) and `OpenQuestion` (feature 006):
- C# model: `[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public string? PresenterHint { get; init; }`
- Controller `StripPresenterData`: add `when ... .PresenterHint is not null` arms for both new types
- Frontend type: `presenterHint?: string` in the TypeScript interface
- Frontend component: render only when `displayMode !== 'mirror' && question.presenterHint`

**Rationale**: The pattern is proven, consistent, and already understood by the codebase. Reusing it minimizes diff size and test surface. The existing `StripPresenterData` switch already handles similar arms for `ClosedQuestion` and `OpenQuestion` — adding two more arms is low-risk.

**Alternatives considered**:
- A generic `presenterHint` on the `Question` base class instead of per-type — considered; would be simpler, but adds a presenter-only field to `ImageRebusQuestion` which has no hint capability per spec. Adding to only the relevant types is more precise and avoids unnecessary stripping logic for image-rebus.

---

## Decision 4: Preserving `title` when `StripPresenterData` reconstructs instances

**Decision**: When `StripPresenterData` reconstructs a stripped instance (to remove `PresenterHint`), include `Title = <source>.Title` in all object initializers, including the already-existing arms for `ClosedQuestion` and `OpenQuestion`.

**Rationale**: Without this, questions that have both a `title` and a `presenterHint` would lose their title in the public API response. The title is not presenter-only; it must be visible in the question list for all users. Updating the existing arms is a small but critical correctness fix that falls within this feature's scope.

**Alternatives considered**:
- Keep `StripPresenterData` as-is and rely on `[JsonIgnore(WhenWritingNull)]` for the title — rejected; `[JsonIgnore]` is only relevant during serialization of null values. The object reconstructed in `StripPresenterData` uses `init` properties; if `Title` is not copied, it will be null on the stripped instance and never appear in the public response.

---

## Decision 5: `ImageRebusQuestion` — no `presenterHint`

**Decision**: Do not add `presenterHint` to `ImageRebusQuestion`.

**Rationale**: The feature specification states "all kind of questions" in the context of the four types already identified in the question types enhancement (closed, open, meme, singing-pianos). `ImageRebusQuestion` is not listed in the spec's key entities for the hint extension. Adding it speculatively goes beyond scope.

**Alternatives considered**:
- Add `presenterHint` to all five types uniformly — would require updating `StripPresenterData` for `ImageRebusQuestion` too, which is a one-line addition. Deferred to a future spec if needed.

---

## Summary: All NEEDS CLARIFICATION Resolved

| Topic | Resolution |
|-------|------------|
| `title` field location | Base `Question` class — all types |
| Fallback when no title | `question.prompt` → type-label constant |
| Fallback truncation mechanism | CSS `textOverflow: 'ellipsis'` (existing) |
| `presenterHint` scope | Meme + SingingPianos only (not ImageRebus) |
| Strip logic fix | `Title` must be copied in all `StripPresenterData` reconstruction arms |
| Backwards compatibility | Both fields optional; `[JsonIgnore(WhenWritingNull)]` on backend |
