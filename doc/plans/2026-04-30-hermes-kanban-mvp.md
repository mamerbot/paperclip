# Hermes Kanban MVP Implementation Plan

> For Hermes: use subagent-driven-development or equivalent disciplined execution. Keep the slice minimal and prove it end-to-end.

Goal: let a Paperclip issue launch a narrow Hermes Kanban workflow, persist a traceable Paperclip->Hermes mapping, and show operators enough status in Paperclip to follow progress without inventing a full sync engine.

Architecture: treat Paperclip as the intake and roll-up control plane, not the source of truth for subtask execution. The bridge should create a small Hermes Kanban execution artifact from one Paperclip issue, then write the resulting board/task identifiers back into Paperclip using existing issue work-product and comment surfaces. Telegram and rich Kanban interaction stay on the Hermes side for the MVP; Paperclip only needs links, roll-ups, and blocker visibility.

Tech stack: existing Paperclip server routes/services, issue work-products, issue comments, issue activity/runs UI, Hermes dashboard/gateway on Raven, user-scoped Paperclip service.

---

## Discovery summary

Confirmed in the fork and live runtime:

- Monica already has assigned `in_progress` work for EMT-20 in `/home/mark/src/github.com/paperclipai/paperclip`.
- Paperclip already has the right assignment surface for agents: `GET /api/agents/me/inbox-lite` returns `todo,in_progress,blocked`.
- Paperclip already has a durable traceability primitive: issue work-products (`GET/POST /issues/:id/work-products`) with types like `preview_url`, `runtime_service`, `artifact`, and `document`.
- Paperclip issue detail already shows comments, activity, and linked runs, but does not currently render work-products in the main issue UI.
- There is no Telegram implementation in this repo today, so Telegram notifications should be treated as Hermes/runtime wiring for the MVP, not a new Paperclip product subsystem.
- The repo already documents two relevant live-state gaps in `docs/runbooks/paperclip-live-state-codification.md`: unsafe/stale Monica adapter prompt behavior and workspace fallback drift.

## Recommended MVP slice

### What ships in Paperclip

1. A single "launch Hermes Kanban" path from a Paperclip issue.
2. Creation of one or more Paperclip work-products that store Hermes board/task URLs and IDs.
3. A lightweight issue-detail UI section that displays those work-products clearly.
4. A concise issue comment writeback convention for launch/result/blocker summaries.
5. A short runbook describing the Raven-side Hermes prerequisites and rollback.

### What stays outside Paperclip for now

1. Telegram delivery plumbing.
2. Actual Kanban execution orchestration inside Hermes.
3. Rich bidirectional state sync.
4. Generalized multi-provider bridge infrastructure.

## Proposed source-of-truth boundaries

- Hermes Kanban owns task graph creation, execution state, and task-level notifications.
- Paperclip owns intake issue, orchestration trigger, human-readable roll-up, and durable links back to Hermes.
- Mapping state lives in Paperclip work-products plus optional comment/document metadata, not in a brand-new sync table unless implementation proves that unavoidable.

## Proposed data model for the MVP

Use existing issue work-products first.

Primary work-products to create per launched issue:

1. `preview_url`
   - provider: `hermes-kanban`
   - title: `Hermes Kanban board`
   - url: direct board URL or gateway path
   - metadata:
     - `paperclipIssueId`
     - `paperclipIdentifier`
     - `hermesBoardId` if available
     - `hermesProjectKey` if available

2. `artifact` or `document`
   - provider: `hermes-kanban`
   - title: `Hermes Kanban task mapping`
   - metadata:
     - `paperclipIssueId`
     - `rootTaskId`
     - `childTaskIds`
     - `launchMode`
     - `lastRollupAt`
     - `statusSummary`

This is enough for traceability without adding new DB tables.

## Proposed launch flow

1. Operator opens a Paperclip issue and triggers the MVP launch path.
2. Paperclip validates the issue has enough context to launch.
3. Paperclip calls a narrow Hermes bridge implementation.
4. Hermes returns a launch result with URLs/IDs for the created board/task graph.
5. Paperclip writes work-products onto the issue.
6. Paperclip appends a launch comment summarizing what was created.
7. Subsequent status/blocker updates arrive as comments and, when needed, work-product metadata updates.

## UI/UX slice for Paperclip

Add one small issue-detail section:

- heading: `Hermes execution`
- show primary board link if present
- show root task ID / child task count if present
- show last status summary from metadata
- show empty state when issue has no Hermes work-products

Do not build a dedicated cross-system dashboard yet. Reuse the existing issue detail page.

## Bite-sized implementation tasks

### Task 1: Lock the design note into the repo

Objective: make the MVP shape explicit before code changes.

Files:
- Create: `doc/plans/2026-04-30-hermes-kanban-mvp.md`
- Modify: `tasks/todo.md`

Verification:
- The plan names the source-of-truth boundary, traceability primitive, and what is deliberately deferred.

### Task 2: Confirm work-product route/service coverage

Objective: verify the existing work-product API is enough for Hermes mapping data.

Files:
- Inspect: `packages/shared/src/validators/work-product.ts`
- Inspect: `server/src/routes/issues.ts`
- Inspect: `server/src/services/work-products.ts`

Verification:
- Confirm metadata payload can store Hermes IDs, URLs, and roll-up status without schema changes.
- If gaps exist, document the smallest schema/API extension needed.

### Task 3: Add issue-detail work-product rendering

Objective: make Hermes links visible to Mark in the Paperclip UI.

Files:
- Modify: `ui/src/pages/IssueDetail.tsx`
- Possibly create: `ui/src/components/IssueWorkProductsSection.tsx`
- Reuse: `ui/src/api/issues.ts`

Implementation notes:
- Query `issuesApi.listWorkProducts(issueId)`.
- Filter or highlight `provider === "hermes-kanban"` first, but still render generic work-products cleanly.
- Keep it read-only for the MVP if that simplifies scope.

Verification:
- Issue detail loads work-products.
- Hermes board link is clickable.
- Empty state is clear.

### Task 4: Define the narrow launch contract

Objective: choose one product-safe path for Paperclip to ask Hermes to create Kanban work.

Files:
- Likely create or modify in `server/src/routes/` and `server/src/services/`
- Update docs/runbook once the exact contract is real

Recommended contract:
- manual board/operator action or issue-scoped route
- request includes issue ID and optional launch mode
- response returns created board/task references plus summary text

Verification:
- The contract is documented with a sample request/response.
- No generalized sync engine is introduced.

### Task 5: Write back launch/status summaries to the issue

Objective: ensure Paperclip stays useful after launch.

Files:
- Reuse issue comment route/service path
- Potentially update activity text/docs only if needed

Implementation notes:
- Launch comment should include board link and root task identifier.
- Blocker comment should use a stable prefix so humans can scan it quickly.
- Completion comment should summarize shipped vs deferred work.

Verification:
- A launched issue has at least one work-product and one summary comment.

### Task 6: Raven runtime/runbook follow-up

Objective: document non-repo prerequisites cleanly.

Files:
- Modify: `docs/runbooks/paperclip-live-state-codification.md` or add a focused runbook

Must cover:
- Hermes dashboard/gateway path used for the board link
- Telegram notification source-of-truth and event triggers
- rollback path if the bridge is disabled

Verification:
- Another operator can tell which parts live in Paperclip code vs Raven runtime configuration.

## Risks and guardrails

### Risk: building a sync engine by accident

Guardrail: only store launch references and roll-up summaries in Paperclip. Hermes remains authoritative for detailed task state.

### Risk: adding new persistence unnecessarily

Guardrail: use issue work-products plus comments first. Only add tables if a specific missing capability is proven.

### Risk: UI scope creep

Guardrail: add one issue-detail section, not a new board or status page.

### Risk: Telegram work balloons the scope

Guardrail: treat Telegram as a Hermes-side prerequisite and verify it operationally, not as a new Paperclip notification subsystem.

## Verification checklist for the eventual MVP

- A Paperclip issue can trigger one Hermes Kanban launch path.
- The issue receives a Hermes board/task link via work-products.
- The Paperclip issue detail page renders the Hermes execution section.
- A blocker or completion summary is written back into Paperclip.
- The demo uses the existing Raven Paperclip and Hermes services with rollback notes captured.

## Current recommendation

Implement Task 3 before Task 4 unless discovery finds a nearly-finished launch bridge already exists. Surfacing work-products in issue detail is the smallest product win and gives us a place to show Hermes state even before automation is complete.
