# Data Model: Quiz Layout Improvements

**Branch**: `007-quiz-layout-improvements`  
**Phase**: 1 — Design  
**Note**: This feature is frontend-layout-only. No new domain entities, no database changes, no API changes. This document captures the component interface changes (prop contracts) that are the equivalent of a "data model" for a frontend-only feature.

---

## New Type: `DisplayMode`

A discriminated string union added to the frontend type system to control typography scale and control visibility per rendering context.

```ts
// src/QuizAppka/ClientApp/src/types/quiz.ts  (or inline in QuestionDisplay.tsx)
export type DisplayMode = 'presenter' | 'mirror';
```

| Value | Context | Typography scale | Presenter controls |
|-------|---------|------------------|--------------------|
| `'presenter'` | `QuestionDetailPage` | `h4` prompt, `h5` options | Shown |
| `'mirror'` | `MirrorPage` question-detail | `h2` prompt, `h4` options | Hidden |

**Default**: `'presenter'` (prop is optional; absence implies presenter context).

---

## Updated Component Interfaces

### `QuestionDisplay`

```ts
interface Props {
  question: Question;
  revealState?: RevealState | null;
  onReveal?: () => void;
  onBoxReveal?: (index: number) => void;
  displayMode?: DisplayMode;          // NEW — forwarded to all question-type children
}
```

### `OpenQuestion`

```ts
interface Props {
  question: OpenQuestionType;
  displayMode?: DisplayMode;          // NEW — controls prompt variant
}
```

**Rendering rules**:
- `displayMode === 'mirror'`: prompt uses `variant="h2"`; presenter hint hidden
- default (`'presenter'`): prompt uses `variant="h4"`; presenter hint shown as `variant="body2"`

### `ClosedQuestion`

```ts
interface Props {
  question: ClosedQuestionType;
  displayMode?: DisplayMode;          // NEW — controls prompt + option typography
}
```

**Rendering rules**:
- Prompt: `variant="h2"` (mirror) / `variant="h4"` (presenter)
- Options: rendered as `Paper` cards with `variant="h4"` (mirror) / `variant="h5"` (presenter)
- Presenter hint: shown only in presenter mode

### `ImageRebusQuestion`

```ts
interface Props {
  question: ImageRebusQuestionType;
  displayMode?: DisplayMode;          // NEW — controls image height and prompt typography
}
```

**Rendering rules**:
- Image container `maxHeight`: `'80vh'` (mirror) / `'70vh'` (presenter)
- Prompt: `variant="h2"` (mirror) / `variant="h4"` (presenter)

### `MemeQuestion`

```ts
interface Props {
  question: MemeQuestionType;
  revealImage?: boolean | null;
  onReveal?: () => void;
  displayMode?: DisplayMode;          // NEW — controls image height, prompt, and option typography
}
```

**Rendering rules**:
- Image container `maxHeight`: `'80vh'` (mirror) / `'70vh'` (presenter)
- Prompt: `variant="h2"` (mirror) / `variant="h4"` (presenter)
- Options: `Paper` cards with `variant="h4"` (mirror) / `variant="h5"` (presenter)
- Reveal button: hidden in mirror mode (no `onReveal` callback passed from `MirrorPage`)

### `SingingPianos`

```ts
interface Props {
  question: SingingPianosQuestionType;
  revealedBoxes?: boolean[] | null;
  onBoxReveal?: (index: number) => void;
  displayMode?: DisplayMode;          // NEW — controls prompt typography and box size
}
```

**Rendering rules**:
- Prompt: `variant="h2"` (mirror) / `variant="h4"` (presenter)
- Box button `minHeight`: `140px` (mirror) / `100px` (presenter)
- Box button `fontSize`: `2rem` (mirror) / `1.5rem` (presenter)
- Layout: MUI `Grid container columns={4}` with `Grid size={1}` per box (both modes)

---

## Page Layout Structure

### All Pages — Grid Wrapper

Each page wraps its content in:
```tsx
<Box sx={{ width: '100%', minHeight: '100vh', pt: 4 }}>
  <Grid container columns={12}>
    <Grid size={10} offset={1}>
      {/* page content */}
    </Grid>
  </Grid>
</Box>
```

The `Container` component is removed from all affected pages. The `Grid` container at root level provides the 1-column margin on each side.

### `MirrorPage` — Question Detail Screen

In addition to the Grid wrapper, the `question-detail` screen render path:
- Passes `displayMode='mirror'` to `<QuestionDisplay>`
- Removes the `<Typography variant="h4" gutterBottom>{category.name}</Typography>` category header (redundant in mirror view during a question)
- All other mirror screens (idle, category-list, question-list) remain unchanged except for the Grid wrapper

### `QuestionDetailPage` — Presenter View

- Passes no `displayMode` prop to `<QuestionDisplay>` (defaults to `'presenter'`)
- Retains existing Back navigation buttons
- Grid wrapper replaces `Container maxWidth="lg"`

---

## Validation Rules

| Rule | Applies To | Behavior |
|------|-----------|---------|
| `displayMode` missing | All question components | Default to `'presenter'` silently |
| Image load error | `ImageRebusQuestion`, `MemeQuestion` | Show fallback placeholder Box; unchanged behavior |
| 0 options in `ClosedQuestion`/`MemeQuestion` | Both | Render empty `Stack`; no crash |
| `boxes.length > 4` in `SingingPianos` | Grid container | Boxes wrap to next row; Grid handles this automatically via `columns={4}` |

---

## State Transitions

No new state is introduced. `displayMode` is a stateless render prop — it does not change during a session.

The existing `RevealState` type is unchanged.
