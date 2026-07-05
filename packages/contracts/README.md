# @aegisiac/contracts

Shared TypeScript contracts for the AegisIaC MVP.

This package owns the API DTOs, normalized Terraform plan model, graph payloads,
AI provider configuration, and approval/risk enums used by the frontend,
Fastify API, worker, risk engine, and AI subsystem.

Raw Terraform plan JSON should not be persisted in Postgres rows. Store it in
Supabase Storage and pass only redacted summaries through these contracts.
