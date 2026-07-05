import { describe, expect, it } from "vitest";
import {
  assessPlanRisk,
  canonicalPlanHash,
  extractGraphEdges,
  parseTerraformPlan
} from "./index.js";

describe("risk package", () => {
  it("hashes equivalent plans deterministically", () => {
    expect(canonicalPlanHash({ b: 1, a: 2 })).toBe(canonicalPlanHash({ a: 2, b: 1 }));
  });

  it("extracts graph edges from Terraform configuration references", () => {
    const plan = parseTerraformPlan({
      resource_changes: [
        {
          address: "aws_vpc.main",
          type: "aws_vpc",
          change: { actions: ["create"] }
        },
        {
          address: "aws_subnet.public",
          type: "aws_subnet",
          change: { actions: ["create"] }
        }
      ],
      configuration: {
        root_module: {
          resources: [
            {
              address: "aws_subnet.public",
              expressions: {
                vpc_id: { references: ["aws_vpc.main.id"] }
              }
            }
          ]
        }
      }
    });

    expect(extractGraphEdges(plan)).toEqual([
      {
        from: "aws_vpc.main",
        to: "aws_subnet.public",
        reason: "configuration-reference",
        attribute: "vpc_id"
      }
    ]);
  });

  it("raises critical risk for deleting stateful resources", () => {
    const plan = parseTerraformPlan({
      resource_changes: [
        {
          address: "aws_db_instance.primary",
          type: "aws_db_instance",
          change: { actions: ["delete"] }
        }
      ]
    });

    expect(assessPlanRisk(plan).tier).toBe("critical");
  });
});
