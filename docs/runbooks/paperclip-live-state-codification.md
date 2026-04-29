# Paperclip live-state codification notes

Last updated: 2026-04-28

## Purpose
Capture which Paperclip fixes have been codified in the `mamerbot/paperclip` fork, which behaviors still live outside source control, and the exact runtime assumptions observed on Raven.

## Codified in the fork

### 1) Heartbeat empty-log fallback
Already codified on branch `fix/heartbeat-empty-log-fallback`.

Behavior:
- Existing heartbeat runs that do not yet have `logStore` / `logRef` should return an empty log payload instead of `404 Run log not found`.

Why it matters:
- Avoids noisy transient log fetch failures for legitimate runs.

### 2) Manual wake context + agent guidance
Codified on branch `codify/manual-wake-context-and-agent-guidance`.

Changes:
- `packages/shared/src/validators/agent.ts`
  - wakeup schema accepts top-level `issueId`, `taskId`, `taskKey`, `commentId`.
- `server/src/routes/agents.ts`
  - wakeup route normalizes those top-level fields into `payload` so manual board/API wakeups preserve issue context.
- `ui/src/api/agents.ts`
  - client typing updated for the new wakeup fields.
- `server/src/__tests__/agent-wakeup-routes.test.ts`
  - route test covers context-field normalization.
- `docs/guides/agent-developer/heartbeat-protocol.md`
  - documents keeping `in_progress` work in scope and carrying issue context on manual wake/retry.
- `docs/guides/agent-developer/task-workflow.md`
  - documents the manual wake/resume pattern.
- `server/src/onboarding-assets/ceo/TOOLS.md`
  - adds safe API usage guidance and warns against `curl ... | python3` pipelines.

## Still live-state / not fully codified

### EMT-11 codified in the fork via dependency patch
Fork-local source-of-truth for the stale Hermes adapter prompt now lives in:
- `package.json` -> `pnpm.patchedDependencies`
- `patches/hermes-paperclip-adapter@0.1.1.patch`
- `server/src/__tests__/hermes-paperclip-adapter-template.test.ts`

Rollout path on Raven:
1. `pnpm install` in the Paperclip repo so pnpm reapplies the patched dependency.
2. Rebuild/redeploy the Paperclip server runtime that vendors `hermes-paperclip-adapter`.
3. Wake an affected agent and verify the generated prompt uses Python `urllib.request` guidance and includes assigned `in_progress` work.

### A) Fallback workspace on live Monica runs
Observed in live run logs:
- `No project or prior session workspace was available. Using fallback workspace ...`

This still occurs on Raven for Monica issue-triggered runs, even when the run carries `issueId` and `wakeReason` such as `issue_assigned` or `issue_commented`.

Implication:
- There is still a deeper runtime/session/workspace-resolution gap beyond the manual wake API convenience fix.

### B) Stale unsafe prompt template in installed adapter dependency
Live Monica runs repeatedly attempted:
- `curl -s "http://127.0.0.1:3100/api/companies/.../issues?assigneeAgentId=...&status=todo" | python3 -m json.tool`

That string was traced to the installed dependency:
- `node_modules/.pnpm/hermes-paperclip-adapter@0.1.1/node_modules/hermes-paperclip-adapter/dist/server/execute.js`

Observed problems in that template:
- Uses `curl | python3`, which Hermes/Tirith blocks.
- Queries only `status=todo`, ignoring assigned `in_progress` work.

Important:
- This behavior is not coming from Monica’s editable live instruction files alone.
- It appears to be baked into the currently installed adapter package/runtime path.

## Operational assumptions on Raven
- Paperclip service: user-scoped systemd unit `~/.config/systemd/user/paperclip.service`
- API base: `http://127.0.0.1:3100/api`
- Company ID: `cbc62b74-e2c6-43c5-ab0e-1310102cadb8`
- Monica agent ID: `c5784533-4e81-4ab0-98e0-4d6f2b972253`
- Local repo path: `/home/mark/src/github.com/paperclipai/paperclip`

## Recommended next steps
1. Find the source-of-truth repo/package for `hermes-paperclip-adapter` and patch the prompt template there:
   - remove `curl | python3`
   - prefer safe API access patterns
   - include `todo,in_progress,blocked` or inbox-lite behavior as appropriate
2. Trace why issue-triggered runs on Raven still lose project workspace binding and fall back to `agent_home`.
3. After those are fixed, re-run Monica on `EMT-10` to get a clean next-step proposal from the Paperclip team itself.
