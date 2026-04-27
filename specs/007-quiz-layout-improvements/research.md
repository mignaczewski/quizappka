# Research: Quiz Layout Improvements

**Branch**: `007-quiz-layout-improvements`  
**Phase**: 0 — Unknowns resolved before Phase 1 design

---

## Decision 1: MUI v7 Grid API

**Decision**: Use `Grid` from `@mui/material` with the v7 (Grid2) API — `size` and `offset` props, `columns={12}` on the container. No import from a separate `Grid2` path needed; in MUI v7, the default `Grid` export is the Grid2 API.

**Rationale**: The project uses `@mui/material: ^7.3.9`. In MUI v7, the original Grid (v1) was removed and Grid2 became the default `Grid`. The v7 syntax uses `size` instead of `xs`/`sm`/`md` and supports the `offset` prop directly on `<Grid>` items, eliminating the need for empty spacer items.

**Usage pattern for 10-of-12-column centred layout**:
```tsx
import Grid from '@mui/material/Grid';

<Grid container columns={12}>
  <Grid size={10} offset={1}>
    {/* content occupies 10 of 12 columns, 1-column margin each side */}
  </Grid>
</Grid>
```

**Alternatives considered**:
- MUI v5/v6 `Grid xs={10}` syntax — rejected: incompatible with the installed v7
- CSS custom grid — rejected: adds non-MUI styling divergence; MUI Grid is already available
- `Container maxWidth="lg"` with explicit padding — rejected: fixed pixel-based approach; Grid-based approach is more consistent with the MUI system

---

## Decision 2: Typography Scale for Question Prompts

**Decision**:
- **Mirror (display) mode**: `variant="h2"` for question prompts — large enough to be readable at ≥5 meters from a 1280×720 projector.
- **Presenter mode**: `variant="h4"` for question prompts — clearly dominant over body text, practical for a laptop screen.
- Presenter hint: `variant="body2"` (unchanged) — remains below prompt in visual hierarchy.

**Rationale**: MUI default theme sizes: `h2` = 3.75rem (~60px), `h4` = 2.125rem (~34px), `body2` = 0.875rem (~14px). The spec requires a minimum of two levels above body text. `h4` is already three levels above `body2`. `h2` is five levels above body text — suitable for projection.

**Propagation mechanism**: Add `displayMode?: 'presenter' | 'mirror'` prop to `QuestionDisplay`, and propagate to each question-type component as a `displayMode` prop. Page components pass `displayMode='mirror'` in `MirrorPage` and omit it (defaulting to `'presenter'`) elsewhere.

**Alternatives considered**:
- Global CSS override — rejected: would affect all pages; we need mode-specific scaling
- Separate MirrorOpenQuestion / MirrorClosedQuestion components — rejected: code duplication violates Principle V (Maintainability Over Cleverness)
- MUI theme override on mirror page via `ThemeProvider` — rejected: heavier solution; a single prop is sufficient

---

## Decision 3: Viewport-filling Images (image-rebus, meme)

**Decision**: Replace the fixed `maxHeight: 400` inline style on images with a CSS-based approach that fills available viewport height dynamically:
```tsx
// Image container Box
sx={{ width: '100%', maxHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}

// img element
style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
```
On the mirror view, the container can use `80vh` since there is no presenter navigation competing for space.

**Rationale**: Using `vh` units allows images to scale with whatever display is in use. `objectFit: 'contain'` preserves aspect ratio without cropping. A cap of 70–80vh prevents the image from consuming all visible space and leaving no room for the prompt text or action buttons.

**Alternatives considered**:
- `maxHeight: 400` (existing) — rejected: fixed pixel size appears tiny on a 1080p projection screen
- `height: 100%` relative to parent — rejected: parent height is not constrained, producing unbounded growth
- CSS `aspect-ratio` property — rejected: only works when width is known; images have unknown dimensions

---

## Decision 4: Block-style Closed/Meme Answer Options

**Decision**: Replace MUI `List`/`ListItem`/`ListItemText` for answer options with a vertical stack of MUI `Paper` (elevation=1) components containing `Typography`. Each option is a distinct visual card.

**Pattern**:
```tsx
<Stack spacing={1.5} sx={{ mt: 2 }}>
  {question.options.map((option) => (
    <Paper key={option.id} elevation={1} sx={{ px: 3, py: 2 }}>
      <Typography variant="h5">{option.text}</Typography>
    </Paper>
  ))}
</Stack>
```

In mirror mode, option typography scales to `variant="h4"`.

**Rationale**: `Paper` gives each option a visible boundary and breathing room — making the list scannable from a distance. Stack spacing provides consistent separation. `Typography variant="h5"` (~1.5rem / 24px) is legible on a projector while not overwhelming the prompt.

**Alternatives considered**:
- MUI `Card` — rejected: more complex, adds CardContent nesting; `Paper` is simpler
- Custom CSS borders/backgrounds — rejected: diverges from MUI theme; `Paper` elevation uses theme shadows
- MUI `Chip` list — rejected: chips are compact interaction elements, not readable multi-word display content

---

## Decision 5: Singing Pianos Grid Layout

**Decision**: Replace the `Box` with `display: 'flex', flexWrap: 'wrap'` with a nested MUI `Grid` layout:
```tsx
<Grid container columns={4} spacing={2} sx={{ mt: 2 }}>
  {question.boxes.map((box, index) => (
    <Grid size={1} key={box.id}>
      <Button
        fullWidth
        variant={isRevealed ? 'contained' : 'outlined'}
        sx={{ minHeight: 100, fontSize: '1.5rem' }}
      >
        {isRevealed ? box.hiddenText : '?'}
      </Button>
    </Grid>
  ))}
</Grid>
```

A `columns={4}` container ensures up to 4 boxes per row. Each box occupies exactly 1 column. The `fullWidth` prop makes each Button stretch to fill the Grid cell.

**Rationale**: A Grid layout guarantees uniform box sizing regardless of text length. The existing flex-wrap approach caused boxes to vary in width based on content. Questions typically have 4–8 boxes.

**Alternatives considered**:
- CSS grid with `grid-template-columns: repeat(4, 1fr)` — rejected: bypasses MUI Grid system; mixing two layout systems is inconsistent
- Keeping flexbox but adding `width: calc(25% - 16px)` — rejected: fragile pixel arithmetic

---

## Decision 6: Page-level Grid Wrapper (10 of 12 columns)

**Decision**: In each page component (`HomePage`, `QuestionListPage`, `QuestionDetailPage`, `MirrorPage`), replace the existing `<Container maxWidth="lg">` (or `<Container>`) with a full-width `<Box>` containing a `<Grid container columns={12}>` and a single `<Grid size={10} offset={1}>` child that holds all page content.

```tsx
<Box sx={{ width: '100%', minHeight: '100vh', pt: 4 }}>
  <Grid container columns={12}>
    <Grid size={10} offset={1}>
      {/* page content */}
    </Grid>
  </Grid>
</Box>
```

**Rationale**: Using the MUI Grid at page level gives consistent centred 10-column layout across all pages. Replacing `Container` with `Box` at the root removes the built-in max-width constraint from `Container`, which can be too narrow on large displays.

**Alternatives considered**:
- Keep `Container maxWidth="xl"` and add padding — rejected: `Container` adds its own responsive padding that conflicts with the explicit column system
- Apply grid only to the question detail page — rejected: spec requires consistent layout across category list and question pages

---

## All NEEDS CLARIFICATION items resolved

All technical unknowns identified during Technical Context fill have been resolved by the decisions above. No items remain for clarification.
