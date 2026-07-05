# AegisIaC MVP Architecture

## Goal

AegisIaC captures Terraform plan runs, stores normalized plan data, produces an infrastructure graph, records AI review results, and gates merge/apply approval by plan hash.

This repository currently contains an MVP scaffold: shared contracts, Supabase schema, Fastify API skeleton, risk and AI domain packages, CI integration templates, and a Vite-hosted PR review dashboard prototype.

## Contract Boundaries

- `packages/contracts`: dependency-free TypeScript DTOs shared by frontend, API handlers, workers, and tests.
- `packages/risk`: deterministic plan hashing, Terraform plan parsing, dependency graph extraction, stateful-resource detection, and risk-tier heuristics.
- `packages/ai`: provider abstraction, intensity mapping, prompt building, and placeholder OpenAI/Anthropic-compatible reviewers.
- `apps/api`: Fastify API scaffold with health, plan ingest, plan run read, graph read, approval, and GitHub webhook endpoints.
- `src/components/aegis`: PR review dashboard prototype with graph, findings, cost, AI advisory, resource detail, workspace nav, and approval bar.
- `integrations`: reference GitHub Actions and Buildkite plan producer templates plus jq redaction filter.
- `docs/openapi.yaml`: REST API contract for M0.
- `supabase/migrations`: Supabase Postgres schema, RLS policies, indexes, and storage bucket policy notes.

## Core Domain Model

- `profiles`: authenticated user profile metadata.
- `projects`: top-level user-owned IaC projects.
- `project_members`: membership and authorization metadata for projects.
- `vcs_repositories`: linked source repositories.
- `terraform_workspaces`: Terraform workspace or working-directory configuration.
- `plan_runs`: lifecycle record for a Terraform plan or apply review workflow.
- `plan_artifacts`: storage references for raw plan JSON, binary plans, logs, and lockfiles.
- `terraform_resource_changes`: normalized resource-level changes extracted from Terraform plan JSON.
- `ai_review_configs`: model/provider configuration for AI reviews.
- `ai_review_results`: review state, risk score, summary, findings, token usage, and raw response.
- `iac_graph_snapshots`: graph DTO snapshots derived from a plan run.
- `apply_approvals`: request and decision records for apply gating.

## MVP Flow

1. A client creates or selects a project and workspace.
2. A client creates a `plan_run` with source metadata such as branch, commit, Terraform version, and CLI args.
3. A worker uploads raw artifacts to the private `aegis-iac-artifacts` storage bucket under `{auth.uid()}/{planRunId}/...`.
4. The API/worker parses `resource_changes`, stores normalized resource changes, and updates the plan summary.
5. The risk package extracts dependency edges and produces graph DTOs.
6. The risk package computes a tier from destructive/stateful changes, graph breadth, and policy/cost signals.
7. The AI package builds advisory summaries from redacted plan context.
8. If needed, the API records an approval or rejection bound to the current plan hash.

## Auth And Data Access

M0 assumes Supabase Auth and project-level membership.

- Tables in `public` explicitly grant access to `authenticated` and `service_role`.
- RLS is enabled on every M0 table.
- Policies use `auth.uid()` and helper functions for project membership and plan-run access.
- Service role access is reserved for trusted backend jobs.
- No `anon` table grants are included.
- Storage object access requires the private bucket `aegis-iac-artifacts` and a first path segment equal to the authenticated user's UUID.

## API Shape

The REST surface is versioned under `/v1`.

- `POST /v1/ingest/plan`: CI/agent plan ingest.
- `POST /v1/webhooks/github`: GitHub webhook receiver placeholder.
- `GET /v1/plan-runs/:id`: plan review payload.
- `GET /v1/plan-runs/:id/graph`: graph DTO.
- `POST /v1/plan-runs/:id/approvals`: approval/rejection.
- `GET /v1/health`: API health.

All responses use the shared envelope:

```json
{
  "ok": true,
  "data": {}
}
```

Errors use:

```json
{
  "ok": false,
  "error": {
    "code": "not_found",
    "message": "Plan run not found"
  }
}
```

## Assumptions

- The scaffold uses an in-memory repository in `apps/api`; Supabase persistence is represented by the migration and contracts.
- The frontend dashboard currently uses static fixture data pending API wiring.
- M0 stores a normalized Terraform plan subset instead of the full Terraform JSON document in relational tables.
- Raw full-fidelity plan JSON can be stored as a `plan-json` artifact.
- Organization billing, SSO, cloud account credential storage, drift scheduling, and Terraform apply execution are post-M0.
- The AI provider API key and secret material are not stored in these tables.
- Backend workers may use Supabase service role credentials but frontend clients should use only authenticated user access.
