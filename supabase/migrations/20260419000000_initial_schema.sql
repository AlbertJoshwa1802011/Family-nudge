-- Family-nudge initial schema.
-- Depends on Supabase's built-in `auth.users` table for user identity.
-- All app tables live in `public` and are gated by RLS policies tied to family membership.

set check_function_bodies = off;

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.member_role as enum ('HEAD', 'ADULT', 'ELDER', 'CHILD');
create type public.reminder_status as enum ('ACTIVE', 'PAUSED', 'ARCHIVED');
create type public.escalation_channel as enum ('PUSH', 'WHATSAPP_TEXT', 'WHATSAPP_VOICE');
create type public.document_category as enum (
  'IDENTITY', 'MEDICAL', 'FINANCIAL', 'EDUCATION',
  'PROPERTY', 'WARRANTY', 'SUBSCRIPTION', 'OTHER'
);
create type public.document_action as enum (
  'UPLOAD', 'DOWNLOAD', 'VIEW', 'DELETE', 'RENAME'
);

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null,
  phone_e164    text unique,
  quiet_start   time,
  quiet_end     time,
  timezone      text not null default 'Asia/Kolkata',
  push_token    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Families and membership
-- ---------------------------------------------------------------------------
create table public.families (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  invite_code  text not null unique default encode(gen_random_bytes(6), 'hex'),
  -- wrapped KEK (family key wrapped by a passphrase-derived key) kept server-side;
  -- unwrapping happens client-side with the family passphrase.
  wrapped_kek  bytea,
  kek_salt     bytea,
  kek_params   jsonb,
  created_at   timestamptz not null default now()
);

create table public.family_members (
  id         uuid primary key default uuid_generate_v4(),
  family_id  uuid not null references public.families(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       public.member_role not null default 'ADULT',
  joined_at  timestamptz not null default now(),
  unique (family_id, user_id)
);

create index family_members_user_idx on public.family_members(user_id);
create index family_members_family_idx on public.family_members(family_id);

-- Helper: is the current auth.uid a member of a given family?
create or replace function public.is_family_member(fid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members fm
    where fm.family_id = fid
      and fm.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Reminders
-- ---------------------------------------------------------------------------
create table public.reminders (
  id                uuid primary key default uuid_generate_v4(),
  family_id         uuid not null references public.families(id) on delete cascade,
  created_by        uuid not null references auth.users(id),
  target_user_id    uuid not null references auth.users(id),
  title             text not null,
  description       text,
  rrule             text not null,
  escalation_rules  jsonb not null,
  timezone          text not null default 'Asia/Kolkata',
  urgent            boolean not null default false,
  status            public.reminder_status not null default 'ACTIVE',
  next_run_at       timestamptz not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index reminders_family_idx on public.reminders(family_id);
create index reminders_next_run_idx on public.reminders(status, next_run_at);

create table public.reminder_instances (
  id               uuid primary key default uuid_generate_v4(),
  reminder_id      uuid not null references public.reminders(id) on delete cascade,
  fired_at         timestamptz not null default now(),
  acknowledged_at  timestamptz,
  ack_channel      text,
  escalation_level int not null default 0
);

create index reminder_instances_reminder_idx on public.reminder_instances(reminder_id);
create index reminder_instances_open_idx
  on public.reminder_instances(reminder_id)
  where acknowledged_at is null;

-- ---------------------------------------------------------------------------
-- Documents (encrypted; metadata only stored in the DB)
-- ---------------------------------------------------------------------------
create table public.documents (
  id             uuid primary key default uuid_generate_v4(),
  family_id      uuid not null references public.families(id) on delete cascade,
  uploaded_by    uuid not null references auth.users(id),
  title          text not null,
  category       public.document_category not null default 'OTHER',
  file_key       text not null,        -- Supabase Storage object path
  mime_type      text not null,
  size_bytes     bigint not null,
  encrypted_dek  bytea not null,       -- DEK wrapped client-side by the family KEK
  iv             bytea not null,       -- AES-GCM IV
  auth_tag       bytea not null,       -- AES-GCM tag
  created_at     timestamptz not null default now()
);

create index documents_family_idx on public.documents(family_id);
create index documents_category_idx on public.documents(family_id, category);

create table public.document_activities (
  id           uuid primary key default uuid_generate_v4(),
  document_id  uuid not null references public.documents(id) on delete cascade,
  user_id      uuid not null references auth.users(id),
  action       public.document_action not null,
  ip_address   inet,
  user_agent   text,
  created_at   timestamptz not null default now()
);

create index document_activities_document_idx
  on public.document_activities(document_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.families            enable row level security;
alter table public.family_members      enable row level security;
alter table public.reminders           enable row level security;
alter table public.reminder_instances  enable row level security;
alter table public.documents           enable row level security;
alter table public.document_activities enable row level security;

-- profiles: a user can read/update only their own row.
create policy "profiles self read"    on public.profiles for select using (id = auth.uid());
create policy "profiles self upsert"  on public.profiles for insert with check (id = auth.uid());
create policy "profiles self update"  on public.profiles for update using (id = auth.uid());

-- families: visible to members only; creation open to any authed user.
create policy "families member read"  on public.families for select using (public.is_family_member(id));
create policy "families create"       on public.families for insert with check (auth.uid() is not null);
create policy "families head update"  on public.families for update using (
  exists (
    select 1 from public.family_members fm
    where fm.family_id = families.id
      and fm.user_id = auth.uid()
      and fm.role = 'HEAD'
  )
);

-- family_members: members can read rows of their families. Joining a family is
-- normally done through an invite-code RPC (see server fn) so we keep INSERT locked.
create policy "fm member read"  on public.family_members for select using (public.is_family_member(family_id));

-- reminders: members of the family can read; creator or HEAD can write.
create policy "reminders family read"   on public.reminders for select using (public.is_family_member(family_id));
create policy "reminders family insert" on public.reminders for insert
  with check (public.is_family_member(family_id) and created_by = auth.uid());
create policy "reminders creator upd"   on public.reminders for update
  using (created_by = auth.uid() and public.is_family_member(family_id));
create policy "reminders creator del"   on public.reminders for delete
  using (created_by = auth.uid() and public.is_family_member(family_id));

-- reminder_instances: readable by the family; ack handled through a server fn
-- that uses the service role, so we only allow select here.
create policy "ri family read" on public.reminder_instances for select using (
  exists (
    select 1 from public.reminders r
    where r.id = reminder_instances.reminder_id
      and public.is_family_member(r.family_id)
  )
);

-- documents: readable by family; child role is blocked from sensitive categories.
create policy "documents family read" on public.documents for select using (
  public.is_family_member(family_id)
  and not exists (
    select 1 from public.family_members fm
    where fm.family_id = documents.family_id
      and fm.user_id = auth.uid()
      and fm.role = 'CHILD'
      and documents.category in ('IDENTITY', 'FINANCIAL')
  )
);
create policy "documents family insert" on public.documents for insert
  with check (public.is_family_member(family_id) and uploaded_by = auth.uid());
create policy "documents uploader del" on public.documents for delete
  using (uploaded_by = auth.uid() and public.is_family_member(family_id));

-- document_activities: readable by family; inserts are limited to the acting user.
create policy "da family read" on public.document_activities for select using (
  exists (
    select 1 from public.documents d
    where d.id = document_activities.document_id
      and public.is_family_member(d.family_id)
  )
);
create policy "da self insert" on public.document_activities for insert
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Trigger: auto-create a profile row when a new auth.user is created.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
