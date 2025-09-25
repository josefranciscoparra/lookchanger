create table if not exists public.models (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  image_url text not null,
  created_at timestamp with time zone default now()
);

create table if not exists public.garments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  category text,
  image_url text not null,
  created_at timestamp with time zone default now()
);

create table if not exists public.outfit_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  model_ids text[] not null,
  garment_ids text[] not null,
  style_json jsonb,
  status text default 'queued',
  cost_cents int default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.outputs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.outfit_jobs(id) on delete cascade,
  image_url text not null,
  meta jsonb,
  created_at timestamp with time zone default now()
);