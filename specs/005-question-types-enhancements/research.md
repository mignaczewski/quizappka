# Research: Question Types Enhancements

**Branch**: `005-question-types-enhancements` | **Date**: 2026-04-20

## 1. Presenter-Only Hint: Preventing Transmission to Mirror Views

**Question**: The existing `GET /api/quiz/categories/{id}` endpoint is used by both the presenter page and the mirror page. How do we prevent the presenter hint from being transmitted to the mirror?

**Decision**: Introduce a separate presenter endpoint `GET /api/quiz/presenter/categories/{id}` that returns the full `ClosedQuestion` payload including the optional `presenterHint`. The regular endpoint's `CategoryDetail` response DTO maps `ClosedQuestion` to a projection that excludes the hint. The mirror page and any public route continue using the regular endpoint and never receive hint data.

**Rationale**: The cleanest boundary. No flag parameters (which would be guessable/injectable), no auth coupling, and no shared DTO carrying conditional fields. The presenter frontend simply calls a different service method for question detail pages. This is consistent with the existing codebase pattern of keeping domain model and response DTOs separate (see `CategorySummary` vs `QuizCategory` in `QuizController.cs`).

**Alternatives Considered**:
- **Query parameter `?presenterMode=true`**: Rejected — any URL in a browser is discoverable; the mirror tab could trivially add the param and receive hints. Violates FR-003.
- **SignalR-only hint delivery** (send hint as a separate SignalR event): Rejected — overcomplicated; adds a second data channel for what is simply optional static data. The mirror already listens to SignalR for navigation state, not for question content.
- **Frontend filtering only** (include hint in API, strip in mirror component): Rejected — violates FR-003 ("MUST NOT transmit"). The data must not appear in any network response received by a mirror client.

---

## 2. Reveal State in PresenterStateDto

**Question**: How should the reveal state (meme image revealed / singing pianos boxes revealed) be tracked and broadcast to mirrors?

**Decision**: Extend `PresenterStateDto` with an optional `RevealState` record:

```csharp
public record RevealState(
    bool? MemeImageRevealed = null,
    bool[]? SingingPianosBoxesRevealed = null   // length 5 when present
);

public record PresenterStateDto(
    string Screen,
    string? CategoryId = null,
    string? QuestionId = null,
    RevealState? RevealState = null             // null = no active reveal state
);
```

When the presenter reveals the meme image, the frontend calls the existing `UpdateState` hub method with a new `PresenterStateDto` that includes `RevealState = { MemeImageRevealed: true }`. When the presenter clicks a singing pianos box, the frontend calls `UpdateState` with `RevealState = { SingingPianosBoxesRevealed: [true, false, false, false, false] }` (or the updated boolean array).

**Rationale**: The `PresenterSessionStore` already stores the current `PresenterStateDto` and serves it to late-joining mirrors via `OnConnectedAsync`. By folding reveal state into the DTO rather than adding a separate hub method, late-join support is automatic at no extra cost. The existing `UpdateState` → broadcast → store flow handles all three scenarios (initial display, live reveal, late join) with zero new hub infrastructure.

**Alternatives Considered**:
- **New hub methods `RevealMemeImage` / `RevealPianoBox`**: Rejected — would require the `PresenterSessionStore` to track reveal state separately from the main DTO, adding two new store fields and two new `OnConnectedAsync` conditions. The existing pattern handles this uniformly with one extension.
- **Session state in browser `sessionStorage`**: Rejected — mirrors are in separate browser contexts; `sessionStorage` is not shared across tabs/windows. Cannot propagate to mirrors.
- **Server-side per-question reveal tracking (dictionary keyed by questionId)**: Considered for robustness across navigation, but rejected for this scope: the spec (FR-012) says state resets on navigation away. The simple "current state in DTO" approach matches this requirement exactly and avoids premature persistence logic.

---

## 3. System.Text.Json Polymorphic Deserialization — Adding New Discriminators

**Question**: The project already uses `[JsonPolymorphic]` / `[JsonDerivedType]` on the `Question` base class. How do new question types plug in?

**Decision**: Add two new `[JsonDerivedType]` attributes to `Question.cs`:

```csharp
[JsonDerivedType(typeof(MemeQuestion), "meme")]
[JsonDerivedType(typeof(SingingPianosQuestion), "singing-pianos")]
```

These follow the exact same pattern as the existing `open`, `closed`, and `image-rebus` discriminators. No additional configuration is needed. New types are deserialized automatically from category JSON files and serialized to API responses.

**Rationale**: System.Text.Json polymorphic deserialization in .NET 7+ is production-stable and already in use in this codebase. Adding new derived types is purely additive; existing types continue to deserialize without change. The type discriminator property name `"type"` is already established in the JSON data files.

**Alternatives Considered**:
- **A custom `JsonConverter`**: Rejected — the existing attribute-based approach works and is simpler. Custom converters are only needed when the discriminator location or format is non-standard.
- **Separate question arrays per type in the category JSON**: Rejected — breaks parity with the existing uniform `"questions"` array shape; would require API contract changes that impact the frontend `CategoryDetail` response type.

---

## 4. Question State Reset on Navigation

**Question**: The spec (FR-012) requires meme and singing pianos state to reset when the presenter navigates away. How is this achieved?

**Decision**: The reset is handled on the frontend. When `QuestionDetailPage` unmounts (presenter navigates away), it calls `UpdateState` via the hub with the new screen and `RevealState: null`. This overwrites the stored DTO in the `PresenterSessionStore`, so any mirror that connects after navigation away sees no reveal state for the new screen.

On navigation back to the same question, `QuestionDetailPage` mounts fresh with no local reveal state, and calls `UpdateState` with `RevealState: null`, broadcasting the clean initial state to all connected mirrors.

**Rationale**: The existing `usePresenterSession` hook already fires `UpdateState` on mount for every presenter page. Adding `RevealState: null` to that initial call is a one-line extension. No server-side reset logic is needed.

**Alternatives Considered**:
- **Server-side reset via a separate `ResetRevealState` hub method**: Rejected — adding a hub method just to null a field adds surface area without benefit. The existing `UpdateState` call on mount covers this automatically.
- **Persisting reveal state per question (never reset)**: Rejected — FR-012 explicitly requires reset on navigation away. Persistent state is described as out of scope in the Assumptions.

---

## 5. Singing Pianos — Fixed vs. Variable Box Count

**Question**: Should the model enforce exactly 5 boxes at the type level, or allow a variable count validated at runtime?

**Decision**: The model declares `PianoBox[]` (not a fixed-size type), but validation at deserialization time asserts exactly 5 entries. Missing boxes (fewer than 5, per the edge case in spec) are handled by hiding the missing box slots in the frontend — the frontend renders exactly 5 slots and shows a missing/disabled state for any index beyond the array length.

**Rationale**: The assumption in the spec fixes the count at 5. Using a plain array avoids over-engineering a fixed-size collection type in C#. Validation at deserialization time (or in a validator service) gives a clear error when category JSON is misconfigured. Frontend defensive rendering (show 5, hide extras) ensures no broken UI for partially-defined question data.

**Alternatives Considered**:
- **C# `FixedArray<5>` or struct with five explicit fields**: Rejected — cumbersome for JSON serialization and unnecessary for small array sizes. Array + validation is idiomatic.
- **Throw on fewer than 5 and crash the app**: Rejected — the spec says missing boxes should be hidden, not that loading should fail. The validation warning is logged but the category still loads.
