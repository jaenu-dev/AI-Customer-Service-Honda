-- Skema database Honda AI CS (Supabase / PostgreSQL)
-- Jalankan di Supabase SQL Editor.

create table if not exists public.users (
    id          bigint generated always as identity primary key,
    username    text not null unique,
    password    text not null,              -- hash bcrypt, bukan plaintext
    created_at  timestamptz not null default now()
);

create table if not exists public.chat_history (
    id          bigint generated always as identity primary key,
    user_id     bigint references public.users(id) on delete cascade,
    session_id  text,
    question    text,
    answer      text,
    created_at  timestamptz not null default now()
);

create index if not exists idx_chat_history_user_session
    on public.chat_history (user_id, session_id);

-- Row Level Security: aktifkan TANPA policy untuk role anon/authenticated.
-- Artinya anon key tidak bisa membaca/menulis apa pun; hanya server (service_role) yang bisa.
alter table public.users enable row level security;
alter table public.chat_history enable row level security;
