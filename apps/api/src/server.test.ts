import { describe, expect, it } from "vitest";
import { buildApp } from "./server.js";

describe("API server", () => {
  it("returns health status", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/v1/health" });
    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: "ok", service: "aegisiac-api" });
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
});
