# EMT-11 Plan

- [x] Locate the source-of-truth path for the Hermes Paperclip adapter prompt template and capture the current failure mode.
- [x] Patch the adapter prompt so heartbeat runs avoid curl|python and include active assigned work.
- [x] Add a regression test that proves the generated heartbeat prompt uses safe API guidance.
- [x] Update docs with the fork-local rollout path for the patched adapter.
- [x] Run verification (targeted test + typecheck/build as appropriate), then commit the fix on this branch.

## Review

- Verified with `pnpm test:run server/src/__tests__/hermes-paperclip-adapter-template.test.ts`.
- Verified with `pnpm typecheck`.
- Verified with `pnpm build`.
