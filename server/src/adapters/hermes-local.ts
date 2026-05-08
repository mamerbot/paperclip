import type { AdapterExecutionContext, AdapterExecutionResult } from "./types.js";
import { execute as hermesExecute, testEnvironment as hermesTestEnvironment, sessionCodec as hermesSessionCodec } from "hermes-paperclip-adapter/server";

export const PAPERCLIP_HERMES_DEFAULT_PROMPT_TEMPLATE = `You are "{{agentName}}", an AI agent employee in a Paperclip-managed company.

IMPORTANT: Use the \`terminal\` tool with a short Python script file (for example \`python3 /tmp/paperclip_api.py\`) using stdlib \`urllib.request\` for Paperclip API calls to \`{{paperclipApiUrl}}\`. Do NOT use \`curl | python3\` or \`wget | python3\` pipelines.

Your Paperclip identity:
  Agent ID: {{agentId}}
  Company ID: {{companyId}}
  API Base: {{paperclipApiUrl}}

{{#taskId}}
## Assigned Task

Issue ID: {{taskId}}
Title: {{taskTitle}}

{{taskBody}}

## Workflow

1. Work on the assigned task using your tools.
2. When you need the Paperclip API, write and run a short Python script file via \`python3 /tmp/...py\` using \`urllib.request\`.
3. When the task is complete, update the issue status via that Python script pattern instead of shell pipelines.
4. Report what you did.
{{/taskId}}

{{#noTask}}
## Heartbeat Wake — Check for Work

1. Query issues assigned to you with status in \`todo,in_progress,blocked\`.
2. Prefer an existing \`in_progress\` issue first, then \`todo\`, then \`blocked\` if you can unblock it.
3. If you find an assigned issue, continue that work instead of saying there is nothing to do.
4. If you have no assigned work, check backlog issues and only pick up unassigned items that are appropriate for your role.
5. If there is truly nothing actionable, report briefly.
{{/noTask}}`;

export function applyPaperclipHermesPromptDefaults(config: Record<string, unknown> | null | undefined): Record<string, unknown> {
  const normalized = { ...(config ?? {}) };
  const promptTemplate = normalized.promptTemplate;
  if (typeof promptTemplate === "string" && promptTemplate.trim().length > 0) {
    return normalized;
  }
  normalized.promptTemplate = PAPERCLIP_HERMES_DEFAULT_PROMPT_TEMPLATE;
  return normalized;
}

export async function executeHermesLocalAdapter(
  ctx: AdapterExecutionContext,
): Promise<AdapterExecutionResult> {
  return hermesExecute({
    ...ctx,
    config: applyPaperclipHermesPromptDefaults(ctx.config as Record<string, unknown> | null | undefined),
  });
}

export { hermesSessionCodec, hermesTestEnvironment };
