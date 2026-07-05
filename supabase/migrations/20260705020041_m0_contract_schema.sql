create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$'),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, slug)
);

create table public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'maintainer', 'viewer')),
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table public.vcs_repositories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  provider text not null check (provider in ('github', 'gitlab', 'bitbucket', 'azure-devops', 'other')),
  external_id text,
  url text not null,
  default_branch text not null default 'main',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, provider, url)
);

create table public.terraform_workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  terraform_version text,
  working_directory text,
  variables jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, name)
);

create table public.plan_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  workspace_id uuid references public.terraform_workspaces(id) on delete set null,
  repository_id uuid references public.vcs_repositories(id) on delete set null,
  source text not null check (source in ('api', 'cli', 'github', 'scheduler')),
  status text not null default 'queued' check (
    status in (
      'queued',
      'planning',
      'planned',
      'reviewing',
      'needs-approval',
      'approved',
      'applying',
      'applied',
      'failed',
      'cancelled'
    )
  ),
  branch text,
  commit_sha text,
  terraform_version text,
  cli_args text[] not null default array[]::text[],
  variables jsonb not null default '{}'::jsonb,
  summary jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.plan_artifacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan_run_id uuid not null references public.plan_runs(id) on delete cascade,
  kind text not null check (kind in ('plan-json', 'plan-binary', 'stdout', 'stderr', 'lockfile')),
  storage_bucket text not null default 'aegis-iac-artifacts',
  storage_path text not null,
  sha256 text check (sha256 is null or sha256 ~ '^[a-f0-9]{64}$'),
  byte_size bigint check (byte_size is null or byte_size >= 0),
  content_type text,
  created_at timestamptz not null default now(),
  unique (plan_run_id, kind, storage_path),
  check (storage_path like owner_id::text || '/%')
);

create table public.terraform_resource_changes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan_run_id uuid not null references public.plan_runs(id) on delete cascade,
  address text not null,
  module_address text,
  mode text not null check (mode in ('managed', 'data')),
  type text not null,
  name text not null,
  provider_name text not null,
  resource_index text,
  actions text[] not null,
  before_value jsonb,
  after_value jsonb,
  after_unknown jsonb,
  before_sensitive jsonb,
  after_sensitive jsonb,
  replace_paths jsonb,
  created_at timestamptz not null default now(),
  unique (plan_run_id, address)
);

create table public.ai_review_configs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  provider text not null check (provider in ('openai', 'anthropic', 'azure-openai', 'local', 'other')),
  model text not null,
  enabled boolean not null default true,
  prompt_version text not null default 'm0',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, name)
);

create table public.ai_review_results (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan_run_id uuid not null references public.plan_runs(id) on delete cascade,
  config_id uuid references public.ai_review_configs(id) on delete set null,
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
  risk_score numeric(5, 2) check (risk_score is null or (risk_score >= 0 and risk_score <= 100)),
  summary text,
  findings jsonb not null default '[]'::jsonb,
  raw_response jsonb,
  token_usage jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (plan_run_id, config_id)
);

create table public.iac_graph_snapshots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan_run_id uuid not null references public.plan_runs(id) on delete cascade,
  format_version text not null default '1.0',
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (plan_run_id, format_version)
);

create table public.apply_approvals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan_run_id uuid not null references public.plan_runs(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete cascade,
  approved_by uuid references auth.users(id) on delete set null,
  status text not null default 'requested' check (status in ('requested', 'approved', 'rejected', 'expired', 'cancelled')),
  reason text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_project_owner(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects p
    where p.id = target_project_id
      and p.owner_id = (select auth.uid())
  );
$$;

create or replace function public.is_project_member(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_project_owner(target_project_id)
    or exists (
      select 1
      from public.project_members pm
      where pm.project_id = target_project_id
        and pm.user_id = (select auth.uid())
    );
$$;

create or replace function public.can_access_plan_run(target_plan_run_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.plan_runs pr
    where pr.id = target_plan_run_id
      and public.is_project_member(pr.project_id)
  );
$$;

revoke all on function public.is_project_owner(uuid) from public;
revoke all on function public.is_project_member(uuid) from public;
revoke all on function public.can_access_plan_run(uuid) from public;
grant execute on function public.is_project_owner(uuid) to authenticated, service_role;
grant execute on function public.is_project_member(uuid) to authenticated, service_role;
grant execute on function public.can_access_plan_run(uuid) to authenticated, service_role;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger project_members_set_updated_at
before update on public.project_members
for each row execute function public.set_updated_at();

create trigger vcs_repositories_set_updated_at
before update on public.vcs_repositories
for each row execute function public.set_updated_at();

create trigger terraform_workspaces_set_updated_at
before update on public.terraform_workspaces
for each row execute function public.set_updated_at();

create trigger plan_runs_set_updated_at
before update on public.plan_runs
for each row execute function public.set_updated_at();

create trigger ai_review_configs_set_updated_at
before update on public.ai_review_configs
for each row execute function public.set_updated_at();

create trigger ai_review_results_set_updated_at
before update on public.ai_review_results
for each row execute function public.set_updated_at();

create trigger apply_approvals_set_updated_at
before update on public.apply_approvals
for each row execute function public.set_updated_at();

grant usage on schema public to authenticated, service_role;

grant select, insert, update, delete on public.profiles to authenticated, service_role;
grant select, insert, update, delete on public.projects to authenticated, service_role;
grant select, insert, update, delete on public.project_members to authenticated, service_role;
grant select, insert, update, delete on public.vcs_repositories to authenticated, service_role;
grant select, insert, update, delete on public.terraform_workspaces to authenticated, service_role;
grant select, insert, update, delete on public.plan_runs to authenticated, service_role;
grant select, insert, update, delete on public.plan_artifacts to authenticated, service_role;
grant select, insert, update, delete on public.terraform_resource_changes to authenticated, service_role;
grant select, insert, update, delete on public.ai_review_configs to authenticated, service_role;
grant select, insert, update, delete on public.ai_review_results to authenticated, service_role;
grant select, insert, update, delete on public.iac_graph_snapshots to authenticated, service_role;
grant select, insert, update, delete on public.apply_approvals to authenticated, service_role;

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.vcs_repositories enable row level security;
alter table public.terraform_workspaces enable row level security;
alter table public.plan_runs enable row level security;
alter table public.plan_artifacts enable row level security;
alter table public.terraform_resource_changes enable row level security;
alter table public.ai_review_configs enable row level security;
alter table public.ai_review_results enable row level security;
alter table public.iac_graph_snapshots enable row level security;
alter table public.apply_approvals enable row level security;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (user_id = (select auth.uid()));

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "projects_select_members"
on public.projects for select
to authenticated
using (public.is_project_member(id));

create policy "projects_insert_owner"
on public.projects for insert
to authenticated
with check (owner_id = (select auth.uid()));

create policy "projects_update_owner"
on public.projects for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "projects_delete_owner"
on public.projects for delete
to authenticated
using (owner_id = (select auth.uid()));

create policy "project_members_select_members"
on public.project_members for select
to authenticated
using (public.is_project_member(project_id));

create policy "project_members_insert_owner"
on public.project_members for insert
to authenticated
with check (public.is_project_owner(project_id));

create policy "project_members_update_owner"
on public.project_members for update
to authenticated
using (public.is_project_owner(project_id))
with check (public.is_project_owner(project_id));

create policy "project_members_delete_owner"
on public.project_members for delete
to authenticated
using (public.is_project_owner(project_id));

create policy "vcs_repositories_select_members"
on public.vcs_repositories for select
to authenticated
using (public.is_project_member(project_id));

create policy "vcs_repositories_insert_members"
on public.vcs_repositories for insert
to authenticated
with check (owner_id = (select auth.uid()) and public.is_project_member(project_id));

create policy "vcs_repositories_update_owner"
on public.vcs_repositories for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()) and public.is_project_member(project_id));

create policy "vcs_repositories_delete_owner"
on public.vcs_repositories for delete
to authenticated
using (owner_id = (select auth.uid()));

create policy "terraform_workspaces_select_members"
on public.terraform_workspaces for select
to authenticated
using (public.is_project_member(project_id));

create policy "terraform_workspaces_insert_members"
on public.terraform_workspaces for insert
to authenticated
with check (owner_id = (select auth.uid()) and public.is_project_member(project_id));

create policy "terraform_workspaces_update_owner"
on public.terraform_workspaces for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()) and public.is_project_member(project_id));

create policy "terraform_workspaces_delete_owner"
on public.terraform_workspaces for delete
to authenticated
using (owner_id = (select auth.uid()));

create policy "plan_runs_select_members"
on public.plan_runs for select
to authenticated
using (public.is_project_member(project_id));

create policy "plan_runs_insert_members"
on public.plan_runs for insert
to authenticated
with check (owner_id = (select auth.uid()) and public.is_project_member(project_id));

create policy "plan_runs_update_owner"
on public.plan_runs for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()) and public.is_project_member(project_id));

create policy "plan_runs_delete_owner"
on public.plan_runs for delete
to authenticated
using (owner_id = (select auth.uid()));

create policy "plan_artifacts_select_plan_members"
on public.plan_artifacts for select
to authenticated
using (public.can_access_plan_run(plan_run_id));

create policy "plan_artifacts_insert_owner"
on public.plan_artifacts for insert
to authenticated
with check (owner_id = (select auth.uid()) and public.can_access_plan_run(plan_run_id));

create policy "plan_artifacts_update_owner"
on public.plan_artifacts for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()) and public.can_access_plan_run(plan_run_id));

create policy "plan_artifacts_delete_owner"
on public.plan_artifacts for delete
to authenticated
using (owner_id = (select auth.uid()));

create policy "terraform_resource_changes_select_plan_members"
on public.terraform_resource_changes for select
to authenticated
using (public.can_access_plan_run(plan_run_id));

create policy "terraform_resource_changes_insert_owner"
on public.terraform_resource_changes for insert
to authenticated
with check (owner_id = (select auth.uid()) and public.can_access_plan_run(plan_run_id));

create policy "terraform_resource_changes_update_owner"
on public.terraform_resource_changes for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()) and public.can_access_plan_run(plan_run_id));

create policy "terraform_resource_changes_delete_owner"
on public.terraform_resource_changes for delete
to authenticated
using (owner_id = (select auth.uid()));

create policy "ai_review_configs_select_members"
on public.ai_review_configs for select
to authenticated
using (public.is_project_member(project_id));

create policy "ai_review_configs_insert_members"
on public.ai_review_configs for insert
to authenticated
with check (owner_id = (select auth.uid()) and public.is_project_member(project_id));

create policy "ai_review_configs_update_owner"
on public.ai_review_configs for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()) and public.is_project_member(project_id));

create policy "ai_review_configs_delete_owner"
on public.ai_review_configs for delete
to authenticated
using (owner_id = (select auth.uid()));

create policy "ai_review_results_select_plan_members"
on public.ai_review_results for select
to authenticated
using (public.can_access_plan_run(plan_run_id));

create policy "ai_review_results_insert_owner"
on public.ai_review_results for insert
to authenticated
with check (owner_id = (select auth.uid()) and public.can_access_plan_run(plan_run_id));

create policy "ai_review_results_update_owner"
on public.ai_review_results for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()) and public.can_access_plan_run(plan_run_id));

create policy "ai_review_results_delete_owner"
on public.ai_review_results for delete
to authenticated
using (owner_id = (select auth.uid()));

create policy "iac_graph_snapshots_select_plan_members"
on public.iac_graph_snapshots for select
to authenticated
using (public.can_access_plan_run(plan_run_id));

create policy "iac_graph_snapshots_insert_owner"
on public.iac_graph_snapshots for insert
to authenticated
with check (owner_id = (select auth.uid()) and public.can_access_plan_run(plan_run_id));

create policy "iac_graph_snapshots_update_owner"
on public.iac_graph_snapshots for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()) and public.can_access_plan_run(plan_run_id));

create policy "iac_graph_snapshots_delete_owner"
on public.iac_graph_snapshots for delete
to authenticated
using (owner_id = (select auth.uid()));

create policy "apply_approvals_select_plan_members"
on public.apply_approvals for select
to authenticated
using (public.can_access_plan_run(plan_run_id));

create policy "apply_approvals_insert_owner"
on public.apply_approvals for insert
to authenticated
with check (owner_id = (select auth.uid()) and requested_by = (select auth.uid()) and public.can_access_plan_run(plan_run_id));

create policy "apply_approvals_update_owner"
on public.apply_approvals for update
to authenticated
using (owner_id = (select auth.uid()) or public.can_access_plan_run(plan_run_id))
with check (public.can_access_plan_run(plan_run_id));

create policy "apply_approvals_delete_owner"
on public.apply_approvals for delete
to authenticated
using (owner_id = (select auth.uid()));

create index profiles_email_idx on public.profiles (email);
create index projects_owner_id_idx on public.projects (owner_id);
create index project_members_user_id_idx on public.project_members (user_id);
create index vcs_repositories_project_id_idx on public.vcs_repositories (project_id);
create index terraform_workspaces_project_id_idx on public.terraform_workspaces (project_id);
create index plan_runs_project_id_created_at_idx on public.plan_runs (project_id, created_at desc);
create index plan_runs_workspace_id_idx on public.plan_runs (workspace_id);
create index plan_runs_repository_id_idx on public.plan_runs (repository_id);
create index plan_runs_status_idx on public.plan_runs (status);
create index plan_runs_commit_sha_idx on public.plan_runs (commit_sha);
create index plan_artifacts_plan_run_id_idx on public.plan_artifacts (plan_run_id);
create index terraform_resource_changes_plan_run_id_idx on public.terraform_resource_changes (plan_run_id);
create index terraform_resource_changes_type_idx on public.terraform_resource_changes (type);
create index terraform_resource_changes_actions_idx on public.terraform_resource_changes using gin (actions);
create index ai_review_configs_project_id_idx on public.ai_review_configs (project_id);
create index ai_review_results_plan_run_id_idx on public.ai_review_results (plan_run_id);
create index ai_review_results_findings_idx on public.ai_review_results using gin (findings);
create index iac_graph_snapshots_plan_run_id_idx on public.iac_graph_snapshots (plan_run_id);
create index iac_graph_snapshots_nodes_idx on public.iac_graph_snapshots using gin (nodes);
create index iac_graph_snapshots_edges_idx on public.iac_graph_snapshots using gin (edges);
create index apply_approvals_plan_run_id_idx on public.apply_approvals (plan_run_id);
create index apply_approvals_status_idx on public.apply_approvals (status);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'aegis-iac-artifacts',
  'aegis-iac-artifacts',
  false,
  52428800,
  array[
    'application/json',
    'application/octet-stream',
    'text/plain'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "aegis_artifacts_select_own_prefix"
on storage.objects for select
to authenticated
using (
  bucket_id = 'aegis-iac-artifacts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "aegis_artifacts_insert_own_prefix"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'aegis-iac-artifacts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "aegis_artifacts_update_own_prefix"
on storage.objects for update
to authenticated
using (
  bucket_id = 'aegis-iac-artifacts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'aegis-iac-artifacts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "aegis_artifacts_delete_own_prefix"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'aegis-iac-artifacts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
