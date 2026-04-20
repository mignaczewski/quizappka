# Data Model: Category List Navigation Access

**Feature**: 004-category-list-navigation  
**Date**: 2026-04-20

## Summary

This feature introduces no changes to the data model. It adds navigation buttons to two existing frontend page components. No entities, fields, relationships, validation rules, or state transitions are added, removed, or modified.

## Existing Entities (unchanged, for reference)

The following entities already exist and are unaffected by this feature:

- **QuizCategory** (`id`, `name`): Represents a quiz category summary. No change.
- **CategoryDetail** (`id`, `name`, `questions[]`): Full category payload returned by `GET /api/quiz/categories/{id}`. No change.
- **Question** (union of `OpenQuestion`, `ClosedQuestion`, `ImageRebusQuestion`): Individual quiz question. No change.
- **Presenter Navigation State** (frontend memory state managed by `usePresenterSession`): Screen identifier and context IDs. No structural change — `navigate('/')` transitions the presenter to `screen: 'category-list'` which is already the registered state type in this hook.

## Validation Rules

No new validation rules. The `/` route is pre-existing and always valid.

## State Transitions

No new state transitions are introduced in the data model. The existing presenter navigation state machine gains two new allowed transitions:

| From | To | Trigger |
|------|----|---------|
| `question-list` | `category-list` | User clicks "Back to categories" on `QuestionListPage` |
| `question-detail` | `category-list` | User clicks "Back to categories" on `QuestionDetailPage` |

These transitions are already implied by the existing state machine pattern; they require no code changes in `usePresenterSession` because `navigate('/')` renders `HomePage` which already calls `usePresenterSession({ screen: 'category-list' })`.
