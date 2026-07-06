import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "./server.js";

const originalGithubToken = process.env.GITHUB_TOKEN;
const originalIsengardGithubToken = process.env.ISENGARD_GITHUB_TOKEN;
const originalRepoAliases = process.env.ISENGARD_REPO_ALIASES;

describe("API server", () => {
  beforeEach(() => {
    delete process.env.GITHUB_TOKEN;
    delete process.env.ISENGARD_GITHUB_TOKEN;
    process.env.ISENGARD_REPO_ALIASES = JSON.stringify({ aw: "bshamloufard/aegisiac-demo-actions-wall" });
  });

  afterEach(() => {
    if (originalGithubToken === undefined) {
      delete process.env.GITHUB_TOKEN;
    } else {
      process.env.GITHUB_TOKEN = originalGithubToken;
    }

    if (originalIsengardGithubToken === undefined) {
      delete process.env.ISENGARD_GITHUB_TOKEN;
    } else {
      process.env.ISENGARD_GITHUB_TOKEN = originalIsengardGithubToken;
    }

    if (originalRepoAliases === undefined) {
      delete process.env.ISENGARD_REPO_ALIASES;
    } else {
      process.env.ISENGARD_REPO_ALIASES = originalRepoAliases;
    }
  });

  it("returns health status", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/v1/health" });
    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: "ok", service: "isengard-api" });
  });

  it("ingests a JSON Terraform plan", async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/v1/ingest/plan",
      payload: {
        metadata: { repository: "example/repo" },
        plan: {
          format_version: "1.2",
          terraform_version: "1.8.0",
          resource_changes: [
            {
              address: "aws_s3_bucket.logs",
              type: "aws_s3_bucket",
              change: { actions: ["create"] }
            }
          ]
        }
      }
    });
    await app.close();

    expect(response.statusCode).toBe(202);
    expect(response.json().planRun.planHash).toEqual(expect.any(String));
  });

  it("resolves short PR review references without redirecting to query strings", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/v1/demo/pr-gate/resolve/aw-1-4e630b4" });
    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      gate: {
        repository: "bshamloufard/aegisiac-demo-actions-wall",
        pullRequest: 1,
        shortRef: "aw-1-4e630b4",
        sha: "4e630b4"
      }
    });
  });
});
