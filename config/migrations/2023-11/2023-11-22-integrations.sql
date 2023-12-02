-- Integrations
create table public.integrations (
  id              uuid primary key default uuid_generate_v4(),
  inserted_at     timestamp with time zone default timezone('utc'::text, now()) not null,
  name            text,
  slug            text,
  data            jsonb
);
comment on table public.sync_queues is 'Integrations.';

-- Installations
create table public.integration_installs (
  id              uuid primary key default uuid_generate_v4(),
  inserted_at     timestamp with time zone default timezone('utc'::text, now()) not null,
  integration_id  uuid references public.integrations on delete cascade not null,
  project_id      uuid references public.projects on delete cascade not null,
  config          jsonb
);
comment on table public.sync_queues is 'Integration installs.';
