# AegisIaC CI integration

These reference templates collect Terraform plan evidence, redact Terraform
sensitive masks, run Infracost and Checkov, and post one payload to the AegisIaC
ingest endpoint. They are intended to be copied into a consuming repository and
adjusted for that repository's Terraform layout.

## Templates

- `integrations/github-actions/aegis-plan.yml`: GitHub Actions pull request
  workflow.
- `integrations/buildkite/pipeline.yml`: Buildkite command step.
- `integrations/redact-plan.jq`: jq filter used by both templates before any
  Terraform plan JSON leaves CI.

Both templates keep `tfplan.raw.json` and `tfplan.bin` local to the job. Uploaded
artifacts are limited to the redacted Terraform plan, Infracost JSON, Checkov
JSON, Checkov stderr, and the Aegis ingest payload.

## Required secrets

GitHub Actions repository secrets:

- `AEGIS_INGEST_URL`: HTTPS endpoint that accepts the plan review payload.
- `AEGIS_INGEST_TOKEN`: bearer token for the ingest endpoint.
- `INFRACOST_API_KEY`: Infracost API key.
- Cloud credentials required by `terraform init` and `terraform plan`, such as
  AWS, Azure, Google Cloud, or Terraform Cloud environment variables.

Buildkite secrets or environment variables:

- `AEGIS_INGEST_URL`
- `AEGIS_INGEST_TOKEN`
- `INFRACOST_API_KEY`
- Cloud credentials required by Terraform.

Optional configuration:

- `AEGIS_TF_ROOT` or `TF_ROOT`: Terraform working directory. Defaults to `.`.
- `AEGIS_TF_PLAN_ARGS` or `TF_PLAN_ARGS`: additional flags, for example
  `-var-file=env/prod.tfvars`.

## Runner requirements

GitHub Actions uses setup actions for Terraform and Infracost. Pin all actions
to full commit SHAs in production, as marked in the workflow comments.
Repository secrets are not exposed to workflows triggered from untrusted forks by
default; keep this workflow on trusted branches or use a separate reviewed
`pull_request_target` design if fork PR support is required.

Buildkite agents must already provide:

- `terraform`
- `jq`
- `infracost`
- `docker`

Both templates run Checkov with the `bridgecrew/checkov` container image. Pin the
image to an immutable digest in production.

## GitHub App permissions

The AegisIaC GitHub App should create or update the check run named
`aegis/plan-review` after ingest receives a CI payload. Configure the App with:

- Metadata: read-only. This is required for all GitHub Apps.
- Contents: read-only.
- Pull requests: read-only.
- Checks: read and write.

Subscribe the App to pull request events if it needs to correlate review state
outside the CI ingest payload. The CI workflow itself only needs repository
contents and pull request read permissions for `GITHUB_TOKEN`.

## Branch protection

Use `aegis/plan-review` as the required check name in branch protection rules.
GitHub only offers a status check in the branch protection selector after that
check has been created at least once for the repository. Install the App, open or
rerun a pull request, wait for AegisIaC to create the first `aegis/plan-review`
check run, then select that check from branch protection.

If a GitHub Actions job and a GitHub App check share the same display name,
GitHub may show multiple selectable entries with different sources. Select the
entry whose source is the AegisIaC GitHub App, not the workflow job. The provided
workflow job is named `aegis/plan-ingest` to avoid that ambiguity.
