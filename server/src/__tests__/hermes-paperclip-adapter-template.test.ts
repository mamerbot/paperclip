import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execute } from "hermes-paperclip-adapter/server";

type CapturePayload = {
  argv: string[];
};

async function writeFakeHermesCommand(commandPath: string): Promise<void> {
  const script = `#!/usr/bin/env node
const fs = require("node:fs");
const capturePath = process.env.PAPERCLIP_TEST_CAPTURE_PATH;
if (capturePath) {
  fs.writeFileSync(capturePath, JSON.stringify({ argv: process.argv.slice(2) }), "utf8");
}
console.log("Heartbeat acknowledged");
console.log("session_id: hermes-session-1");
`;
  await fs.writeFile(commandPath, script, "utf8");
  await fs.chmod(commandPath, 0o755);
}

async function runExecute(options?: { taskId?: string; taskTitle?: string; taskBody?: string }) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclip-hermes-adapter-template-"));
  const workspace = path.join(root, "workspace");
  const commandPath = path.join(root, "hermes");
  const capturePath = path.join(root, "capture.json");
  await fs.mkdir(workspace, { recursive: true });
  await writeFakeHermesCommand(commandPath);

  try {
    const result = await execute({
      runId: "run-1",
      agent: {
        id: "agent-1",
        companyId: "company-1",
        name: "Richard",
        adapterType: "hermes_local",
        adapterConfig: {
          hermesCommand: commandPath,
          model: "gpt-5.4",
          env: {
            PAPERCLIP_TEST_CAPTURE_PATH: capturePath,
          },
        },
      },
      runtime: {
        sessionId: null,
        sessionParams: null,
        sessionDisplayId: null,
        taskKey: null,
      },
      config: {
        taskId: options?.taskId ?? null,
        taskTitle: options?.taskTitle ?? null,
        taskBody: options?.taskBody ?? null,
        workspaceDir: workspace,
      },
      context: {},
      authToken: "run-jwt-token",
      onLog: async () => {},
    });

    const capture = JSON.parse(await fs.readFile(capturePath, "utf8")) as CapturePayload;
    return { result, prompt: capture.argv[2], root };
  } catch (error) {
    await fs.rm(root, { recursive: true, force: true });
    throw error;
  }
}

describe("hermes-paperclip-adapter prompt template", () => {
  it("guides heartbeats to use safe Python API calls and keep in-progress work in scope", async () => {
    const { result, prompt, root } = await runExecute();
    try {
      expect(result.exitCode).toBe(0);
      expect(prompt).toContain("python3 /tmp/");
      expect(prompt).toContain("urllib.request");
      expect(prompt).toContain("Do NOT use `curl | python3` pipelines");
      expect(prompt).toContain("status in `todo,in_progress,blocked`");
      expect(prompt).toContain("Prefer an existing `in_progress` issue first");
      expect(prompt).toContain("continue that work instead of saying there is nothing to do");
      expect(prompt).not.toContain("status=todo\" | python3 -m json.tool");
      expect(prompt).not.toContain("Use `terminal` tool with `curl` for ALL Paperclip API calls");
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("guides assigned-task runs to review and update issues via short Python scripts", async () => {
    const { result, prompt, root } = await runExecute({
      taskId: "issue-1",
      taskTitle: "Fix the adapter prompt",
      taskBody: "Patch the source-of-truth template and verify it.",
    });
    try {
      expect(result.exitCode).toBe(0);
      expect(prompt).toContain("GETs `http://127.0.0.1:3100/api/issues/issue-1` with `urllib.request`");
      expect(prompt).toContain("POSTs to `http://127.0.0.1:3100/api/issues/issue-1/checkout`");
      expect(prompt).toContain("PATCHes `http://127.0.0.1:3100/api/issues/issue-1`");
      expect(prompt).toContain("leave a concise comment with what changed and why");
      expect(prompt).not.toContain("mark the issue as completed");
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });
});
