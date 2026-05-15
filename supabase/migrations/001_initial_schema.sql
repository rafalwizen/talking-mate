-- ============================================
-- TalkingMate - Initial Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  native_language text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Conversations table
create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  language text not null check (language in ('en', 'de', 'es')),
  mode text not null check (mode in ('free_talk', 'scenario')),
  scenario_id text,
  title text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Messages table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz default now() not null
);

-- Indexes
create index idx_conversations_user_id on public.conversations (user_id);
create index idx_conversations_updated_at on public.conversations (updated_at desc);
create index idx_messages_conversation_id on public.messages (conversation_id);
create index idx_messages_created_at on public.messages (conversation_id, created_at asc);

-- ============================================
-- RLS Policies
-- ============================================

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Profiles: users can only access their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Conversations: users can only CRUD their own conversations
create policy "Users can view own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "Users can create own conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on public.conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on public.conversations for delete
  using (auth.uid() = user_id);

-- Messages: users can only access messages in their own conversations
create policy "Users can view own messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can insert own messages"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can delete own messages"
  on public.messages for delete
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

-- ============================================
-- Trigger: auto-update updated_at
-- ============================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_conversations_updated_at
  before update on public.conversations
  for each row execute function public.handle_updated_at();

-- ============================================
-- Trigger: auto-create profile on signup
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
