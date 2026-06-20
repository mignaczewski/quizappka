# API Contract: Quiz API - Timed Open Question

**Branch**: `010-timed-open-question` | **Date**: 2026-06-20  
**Affected routes**: `GET /api/quiz/categories/{id}`, `GET /api/quiz/presenter/categories/{id}`

---

## Summary of Changes

Add a new polymorphic question shape with discriminator `timed-open` to category payloads returned by both public and presenter routes.

---

## Question Object: Timed Open

### New payload shape

```json
{
  "type": "timed-open",
  "id": "string",
  "prompt": "string",
  "initialDurationSeconds": 60
}
```

### Field rules

- `type` MUST equal `timed-open`.
- `id` MUST be a non-empty string unique within category scope.
- `prompt` MUST be a non-empty string.
- `initialDurationSeconds` MUST be an integer greater than 0.

---

## Public route: `GET /api/quiz/categories/{id}`

Timed-open questions are returned with full timer configuration so mirror/audience clients can render timer context when receiving live state updates.

Failure behavior:
- If a category contains an invalid timed-open question (`initialDurationSeconds <= 0`), that question is excluded by data validation and logged similarly to existing invalid-question filtering.

---

## Presenter route: `GET /api/quiz/presenter/categories/{id}`

Presenter response includes the same timed-open question payload shape as public route.

Notes:
- No additional presenter-only fields are required for timed-open baseline behavior.
- Existing presenter-only stripping logic for hint fields on other question types remains unchanged.

---

## Backward Compatibility

- Existing question types (`open`, `closed`, `image-rebus`, `meme`, `singing-pianos`) are unchanged.
- Clients that do not understand `timed-open` will hit the existing unsupported-question fallback path; updated frontend must include explicit rendering support before feature release.

---

## Validation Coverage

Minimum automated coverage required:
- Serialization/deserialization of `timed-open` model in backend model tests.
- Controller route tests proving timed-open payload appears in both public and presenter endpoints.
- Data validation tests proving invalid `initialDurationSeconds` values are rejected.
