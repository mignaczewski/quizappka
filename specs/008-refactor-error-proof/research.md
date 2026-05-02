# Research: Code Refactoring for Predictability and Error Safety

**Branch**: `008-refactor-error-proof` | **Date**: 2026-05-02

---

## 1. useCallback with Functional State Updaters

**Question**: When using `setRevealState(current => ...)` inside a `useCallback`, which dependencies are required?

**Decision**: When the entire body of the callback uses a functional state updater (`setState(current => ...)`), the only deps needed in `useCallback` are values used *outside* the updater function — such as stable identifiers passed to side effects (e.g., `categoryId`, `questionId` for a hub invoke), or values used to compute the initial state when the current state is null (e.g., `question` for bootstrapping the initial `boxes` array). `revealState` itself is never needed as a dep when using the functional updater pattern.

**Rationale**: React guarantees `setState(updater)` calls the updater with the latest committed state value, so including state in the dep array is redundant and would trigger unnecessary callback re-creation.

**Pattern adopted**:
```tsx
// onBoxReveal: only `question` needed (for init fallback)
const onBoxReveal = useCallback((id: string) => {
  setRevealState(current => {
    const boxes = current?.singingPianosBoxesRevealed
      ?? (question as SingingPianosQuestion)?.boxes.map(b => ({ id: b.id, revealed: false }))
      ?? [];
    return {
      ...current,
      singingPianosBoxesRevealed: boxes.map(b => b.id === id ? { ...b, revealed: true } : b),
    };
  });
}, [question]);

// onReveal (meme): no deps — purely derived from current state
const onReveal = useCallback(() => {
  setRevealState(current => ({ ...current, memeImageRevealed: true }));
}, []);

// handleBack: depends on navigate (stable ref) and categoryId
const handleBack = useCallback(() => {
  navigate(`/quiz/${categoryId}`);
}, [navigate, categoryId]);
```

**Alternatives considered**: Keeping `revealState` in the deps array (current code) — rejected because it causes the callback to be recreated on every state change, defeating the purpose of `useCallback` and potentially introducing timing bugs.

---

## 2. Moving Hub Invocation Outside State Updaters

**Question**: What is the correct pattern for making a side effect (hub invoke) after a state update without putting it inside the updater?

**Decision**: Use a dedicated `useEffect` that watches `revealState` and broadcasts it to the hub whenever it changes and when valid params are present. This cleanly separates the state mutation (pure) from the side effect (hub invoke).

**Pattern adopted**:
```tsx
// Broadcast revealState to hub whenever it changes
useEffect(() => {
  if (!revealState || !categoryId || !questionId) return;
  getPresenterHubConnection()
    .invoke('UpdateState', {
      screen: 'question-detail',
      categoryId,
      questionId,
      revealState,
    })
    .catch(() => { /* hub not connected */ });
}, [revealState, categoryId, questionId]);
```

**Rationale**: React Strict Mode (and concurrent features) may call state updaters more than once. Side effects inside updaters can therefore fire multiple times per user action. A `useEffect` fires exactly once per committed state change.

**Alternatives considered**: Extracting `nextReveal` before `setRevealState` and calling both the setter and the hub invoke sequentially — rejected because this reintroduces the stale-closure problem for `onReveal` (meme) if `revealState` is used in the same render cycle.

---

## 3. RevealedBox Type Design — Cross-Layer Alignment

**Question**: What type should `RevealedBox` use for `id` to be consistent between TypeScript and C#?

**Decision**: `string` on both sides. `PianoBox.Id` is already `string` in C# (`public string Id { get; init; } = string.Empty`). The TypeScript frontend will use `{ id: string; revealed: boolean }`.

**C# model**:
```csharp
public record RevealedBox(string Id, bool Revealed);
```

**TypeScript type**:
```ts
export interface RevealedBox {
  id: string;
  revealed: boolean;
}
```

**Wire format** (camelCase, System.Text.Json defaults):
```json
{ "id": "box-1", "revealed": true }
```

**Rationale**: Using the box's stable `id` rather than array index means revealed state is independent of box ordering, resilient to partial data, and unambiguous when building lookups. The old `boolean[]` depended on position — if boxes were reordered or the array was shorter than expected, reveals would point to the wrong box.

**Alternatives considered**: Using `number` index — rejected per user requirement. Using a `Map<string, boolean>` — rejected because it does not serialize cleanly to JSON over SignalR.

---

## 4. ValidationError Field Design

**Question**: How should the backend communicate structural errors on questions to the frontend?

**Decision**: Add an optional `ValidationError` property (`string?`) to the base `Question` abstract class with a regular `set` accessor (not `init`) so `FilterValidQuestions` can set it on deserialized instances before returning them. The property is `null` for valid questions and a human-readable message for invalid ones.

**C# change**:
```csharp
public abstract class Question
{
    public string Id { get; init; } = string.Empty;
    public string Prompt { get; init; } = string.Empty;
    public string? ValidationError { get; set; }    // ← new
}
```

**TypeScript change** (in `BaseQuestion` / union):
```ts
// added to all question types via the base interface
validationError?: string | null;
```

**Rationale**: Using `set` (not `init`) allows `FilterValidQuestions` to tag questions after JSON deserialization without needing to construct new objects or use reflection. The JSON serializer will include `validationError` in the response only when it has a value (with `DefaultIgnoreCondition = WhenWritingNull`). The frontend `QuestionList` component reads this field to render an error indicator.

**Alternatives considered**: A wrapper `ValidatedQuestion<T>` type — rejected as too invasive, breaking the existing `Question[]` API surface. Returning a separate validation-result map alongside the category — rejected as more complex and requiring frontend changes to correlation logic.

**Note**: Existing invalid question types (`ClosedQuestion` with <2 options, `ImageRebusQuestion` with empty `imageRef`) continue to be excluded (not included with an error marker). The new behavior applies only to `SingingPianosQuestion` (empty boxes) and `MemeQuestion` (empty `entryImage`), per the feature spec. These are softer structural failures where the question may still be intentionally present but partially configured.

---

## 5. usePresenterSession Empty-Param Guard

**Question**: Where should the guard against empty-string `categoryId`/`questionId` live?

**Decision**: In `usePresenterSession` itself. When the active screen is `question-detail` and either `categoryId` or `questionId` is empty/null, the hook skips the hub invoke entirely. This makes the protection centralised rather than relying on every call site to pass correct values.

**Pattern adopted**:
```ts
useEffect(() => {
  // Guard: for screens requiring IDs, skip if any ID is missing
  if (categoryId !== null && !categoryId) return;
  if (questionId !== null && !questionId) return;

  startPresenterHub()
    .then(() => connection.invoke('UpdateState', { screen, categoryId, questionId }))
    .catch(() => {});
}, [screen, categoryId, questionId]);
```

---

## 6. System.Text.Json + SignalR Serialization of RevealedBox

**Question**: Will System.Text.Json automatically serialize/deserialize `RevealedBox[]` through SignalR without configuration?

**Decision**: Yes. SignalR uses System.Text.Json by default in .NET 10. A simple `record RevealedBox(string Id, bool Revealed)` with no custom converters will serialize to `[{"id":"...","revealed":true}]` and deserialize back correctly. The existing `JsonSerializerOptions` on the hub (default) support this out of the box.

**Validated by**: The existing `PresenterHubTests.cs` end-to-end hub test approach — the updated test will send a `RevealState` with `RevealedBox[]` and verify the deserialized payload matches.

---

## 7. isUrl Shared Utility

**Question**: Where should the shared `isUrl` helper live?

**Decision**: `src/QuizAppka/ClientApp/src/utils/url.ts` — a single exported function `isUrl(value: string): boolean`. Both `ClosedQuestion.tsx` and `OpenQuestion.tsx` import from this location.

**Rationale**: Utilities belong in `utils/`, not in component files. Co-located duplication is a divergence risk — if one copy is updated and the other isn't, the components behave differently for the same input.
