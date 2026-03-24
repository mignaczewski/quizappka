<!--
Sync Impact Report
- Version change: 1.0.0 -> 1.1.0
- Modified principles:
  - Template principle 1 -> I. Shared Domain Contracts
  - Template principle 2 -> II. Quality Gates Are Non-Negotiable
  - Template principle 3 -> III. Test Strategy Before Merge
  - Template principle 4 -> IV. Frontend-Backend Integration Confidence
  - Template principle 5 -> V. Maintainability Over Cleverness
- Added sections:
  - Engineering Standards
  - Delivery Workflow
- Removed sections:
  - None
- Templates requiring updates:
  - updated: .specify/templates/plan-template.md
  - updated: .specify/templates/spec-template.md
  - updated: .specify/templates/tasks-template.md
  - pending: .specify/templates/commands/*.md (directory not present in this repository)
  - pending: README.md, docs/quickstart.md (not present in this repository)
- Follow-up TODOs:
  - None
-->

# Quizappka Constitution

## Core Principles

### I. Shared Domain Contracts
Frontend and backend changes MUST be designed around explicit API contracts,
validation rules, and shared domain language before implementation begins. Every
feature spec and implementation plan MUST identify the affected user journey,
request and response boundaries, failure modes, and ownership of contract
changes. Rationale: most regressions in web applications occur at boundaries,
not inside isolated functions.

### II. Quality Gates Are Non-Negotiable
All production changes MUST pass linting, type checks where configured, code
review, and automated tests before merge. A change that bypasses any gate MUST
include a documented exception, a time-bounded remediation owner, and a reason
why shipping without the gate is safer than delaying. Rationale: quality gates
exist to stop preventable defects from reaching users.

### III. Test Strategy Before Merge
Every feature and bug fix MUST define the automated tests that prove the change.
Backend work MUST include unit tests for business logic and integration or
contract tests for externally visible behavior. Frontend work MUST include
component or user-flow tests for stateful behavior and accessibility assertions
for user-facing changes. Manual testing may supplement automated coverage, but
it MUST NOT replace it for core flows or regressions. Rationale: testing is how
the team proves behavior, not how it hopes behavior remains correct.

### IV. Frontend-Backend Integration Confidence
Changes that alter API contracts, authentication, persistence, or cross-layer
user flows MUST include end-to-end or equivalent integration validation across
frontend and backend boundaries. Mock-only verification is insufficient when a
real integration path can fail due to serialization, authorization, routing, or
schema drift. Rationale: full-stack applications fail where assumptions between
layers diverge.

### V. Maintainability Over Cleverness
Code MUST optimize for readability, debuggability, and safe modification.
Developers MUST prefer straightforward designs, small reviewable changes,
consistent naming, and explicit error handling over abstraction that is not yet
needed. Refactors are encouraged when they reduce complexity or improve test
clarity, but speculative architecture is prohibited. Rationale: sustainable
delivery depends on code that the next engineer can understand quickly.

## Engineering Standards

The default target is a web application with both frontend and backend
components. Each implementation plan MUST describe the selected project
structure, testing pyramid, contract ownership, and how local validation will be
run for both layers. New code MUST preserve backward compatibility unless the
spec, plan, and release communication explicitly declare a breaking change.
Security, accessibility, and observability requirements MUST be captured when a
feature affects authentication, data handling, or user-critical flows.

## Delivery Workflow

Each feature specification MUST define independently testable user scenarios,
explicit edge cases, and measurable success criteria. Each implementation plan
MUST include a Constitution Check that names the required quality gates,
integration points, and any justified complexity deviations. Task breakdowns
MUST include the test work necessary to prove each story, and user-story work
MUST NOT be marked complete until the relevant automated checks pass. Reviewers
MUST reject changes that do not identify test evidence or that leave cross-layer
behavior ambiguous.

## Governance

This constitution supersedes conflicting local practices for planning,
implementation, and review. Amendments require a documented rationale, updates
to affected templates, and a version bump consistent with semantic versioning:
MAJOR for removed or fundamentally redefined principles, MINOR for new
principles or materially expanded governance, and PATCH for clarifications that
do not change expectations. Compliance MUST be verified during planning,
implementation review, and pre-merge validation. Any approved exception MUST be
documented in the relevant spec, plan, or pull request with an owner and an
expiration date.

**Version**: 1.1.0 | **Ratified**: 2026-03-24 | **Last Amended**: 2026-03-24