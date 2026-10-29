-- Œil Studio : base de données Supabase.
-- À coller une fois dans Supabase → SQL Editor → New query → Run. Le script peut être relancé sans risque.

-- ---------------------------------------------------------------- Profils
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '' check (char_length(name) <= 40),
  role text not null default 'etudiant' check (role in ('etudiant', 'enseignant', 'pro')),
  avatar_color text not null default '#B9D9FF' check (avatar_color ~ '^#[0-9A-Fa-f]{6}$'),
  avatar_icon text not null default '' check (char_length(avatar_icon) <= 32),
  plan text not null default 'free' check (plan in ('free', 'pro', 'classe', 'ecole')),
  parcours boolean not null default false,
  plan_until timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profil lisible par son propriétaire" on public.profiles;
create policy "profil lisible par son propriétaire" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profil modifiable par son propriétaire" on public.profiles;
create policy "profil modifiable par son propriétaire" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
-- L'offre et les identifiants Stripe ne sont modifiables que par le serveur (webhook Stripe).
revoke insert, update, delete on public.profiles from authenticated, anon;
grant update (name, role, avatar_color, avatar_icon) on public.profiles to authenticated;

-- Profil créé automatiquement à l'inscription, à partir des informations du formulaire.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, name, role, avatar_color, avatar_icon)
  values (
    new.id,
    left(coalesce(nullif(m->>'name', ''), split_part(new.email, '@', 1)), 40),
    case when m->>'role' in ('etudiant', 'enseignant', 'pro') then m->>'role' else 'etudiant' end,
    case when coalesce(m->>'avatar_color', '') ~ '^#[0-9A-Fa-f]{6}$' then m->>'avatar_color' else '#B9D9FF' end,
    left(coalesce(m->>'avatar_icon', ''), 32)
  )
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- Scores
create table if not exists public.scores (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles on delete cascade,
  game_id text not null check (char_length(game_id) <= 40),
  title text check (char_length(title) <= 80),
  avg int not null check (avg between 0 and 100),
  rounds int[],
  mode text not null default 'solo' check (mode in ('solo', 'mix', 'daily', 'live', 'round')),
  day date,
  created_at timestamptz not null default now()
);
alter table public.scores drop constraint if exists scores_mode_check;
alter table public.scores add constraint scores_mode_check check (mode in ('solo', 'mix', 'daily', 'live', 'round'));
create index if not exists scores_user_idx on public.scores (user_id, created_at desc);
create index if not exists scores_daily_idx on public.scores (day) where mode = 'daily';
alter table public.scores enable row level security;
drop policy if exists "scores lisibles par leur auteur" on public.scores;
create policy "scores lisibles par leur auteur" on public.scores for select using (auth.uid() = user_id);
drop policy if exists "scores ajoutés par leur auteur" on public.scores;
create policy "scores ajoutés par leur auteur" on public.scores for insert with check (auth.uid() = user_id);

-- ---------------------------------------------------------------- Classes
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  teacher_id uuid not null references public.profiles on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  created_at timestamptz not null default now()
);
create table if not exists public.class_members (
  class_id uuid not null references public.classes on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, user_id)
);
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
-- Aucune politique : tout passe par les fonctions ci-dessous, qui vérifient les droits.

-- Offre effective de l'utilisateur connecté (son offre, le parcours, ou l'accès offert par sa classe).
create or replace function public.my_access() returns text
language sql stable security definer set search_path = public as $$
  select case
    when p.plan <> 'free' and (p.plan_until is null or p.plan_until > now()) then p.plan
    when p.parcours then 'parcours'
    when exists (
      select 1 from class_members m join classes c on c.id = m.class_id join profiles t on t.id = c.teacher_id
      where m.user_id = p.id and t.plan in ('classe', 'ecole') and (t.plan_until is null or t.plan_until > now())
    ) then 'classe-eleve'
    else 'free' end
  from profiles p where p.id = auth.uid();
$$;

create or replace function public.create_class(p_name text) returns public.classes
language plpgsql security definer set search_path = public as $$
declare t profiles; c classes; k text; alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  select * into t from profiles where id = auth.uid();
  if t.id is null then raise exception 'connexion requise'; end if;
  if t.plan not in ('classe', 'ecole') then raise exception 'offre Classe ou École requise'; end if;
  if (select count(*) from classes where teacher_id = t.id) >= 20 then raise exception 'trop de classes'; end if;
  loop
    k := '';
    for i in 1..6 loop k := k || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1); end loop;
    exit when not exists (select 1 from classes where code = k);
  end loop;
  insert into classes (code, teacher_id, name) values (k, t.id, left(trim(p_name), 60)) returning * into c;
  return c;
end $$;

create or replace function public.join_class(p_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare c classes;
begin
  if auth.uid() is null then raise exception 'connexion requise'; end if;
  select * into c from classes where code = upper(trim(p_code));
  if c.id is null then raise exception 'classe introuvable'; end if;
  if (select count(*) from class_members where class_id = c.id) >= 40 then raise exception 'classe pleine'; end if;
  insert into class_members (class_id, user_id) values (c.id, auth.uid()) on conflict do nothing;
  return c.id;
end $$;

create or replace function public.leave_class(p_class uuid) returns void
language sql security definer set search_path = public as $$
  delete from class_members where class_id = p_class and user_id = auth.uid();
$$;

create or replace function public.my_classes() returns table (id uuid, name text, code text, is_teacher boolean, teacher_name text)
language sql stable security definer set search_path = public as $$
  select c.id, c.name, case when c.teacher_id = auth.uid() then c.code end, c.teacher_id = auth.uid(), t.name
  from classes c join profiles t on t.id = c.teacher_id
  where c.teacher_id = auth.uid() or exists (select 1 from class_members m where m.class_id = c.id and m.user_id = auth.uid())
  order by c.created_at;
$$;

create or replace function public.class_roster(p_class uuid) returns table (name text, avatar_color text, avatar_icon text, sessions bigint, avg int, last timestamptz)
language sql stable security definer set search_path = public as $$
  select p.name, p.avatar_color, p.avatar_icon, count(s.id) filter (where s.mode <> 'round'), round(avg(s.avg) filter (where s.mode <> 'round'))::int, max(s.created_at)
  from class_members m join profiles p on p.id = m.user_id left join scores s on s.user_id = p.id
  where m.class_id = p_class and exists (select 1 from classes c where c.id = p_class and c.teacher_id = auth.uid())
  group by p.id order by count(s.id) desc, p.name;
$$;

-- Classement du défi du jour : meilleur score de chaque joueur ce jour-là.
create or replace function public.daily_leaderboard(p_day date) returns table (name text, avatar_color text, avatar_icon text, best int)
language sql stable security definer set search_path = public as $$
  select p.name, p.avatar_color, p.avatar_icon, max(s.avg)
  from scores s join profiles p on p.id = s.user_id
  where s.mode = 'daily' and s.day = p_day
  group by p.id order by max(s.avg) desc, min(s.created_at) limit 20;
$$;

grant execute on function public.my_access, public.create_class, public.join_class, public.leave_class, public.my_classes, public.class_roster to authenticated;
grant execute on function public.daily_leaderboard to anon, authenticated;

-- ---------------------------------------------------------------- Demandes de contact et de devis
create table if not exists public.contact_requests (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  offer text check (char_length(offer) <= 20),
  name text not null check (char_length(name) between 1 and 80),
  email text not null check (char_length(email) <= 120 and email like '%@%'),
  org text check (char_length(org) <= 120),
  students int check (students between 1 and 20000),
  message text check (char_length(message) <= 4000)
);
alter table public.contact_requests enable row level security;
drop policy if exists "tout le monde peut écrire" on public.contact_requests;
create policy "tout le monde peut écrire" on public.contact_requests for insert to anon, authenticated with check (true);
grant insert on public.contact_requests to anon, authenticated;

-- ---------------------------------------------------------------- Classement national de la semaine
-- Semaine du lundi au dimanche (heure de Paris). p_game = un jeu précis, ou null pour le classement général :
-- la somme des meilleurs scores de chaque jeu joué dans la semaine.
create index if not exists scores_week_idx on public.scores (created_at, game_id);
create or replace function public.weekly_leaderboard(p_game text default null)
returns table (name text, avatar_color text, avatar_icon text, points int, games int, is_me boolean)
language sql stable security definer set search_path = public as $$
  with week as (select date_trunc('week', now() at time zone 'Europe/Paris') at time zone 'Europe/Paris' as start),
  best as (
    select s.user_id, s.game_id, max(s.avg) as best
    from scores s, week
    where s.created_at >= week.start and s.game_id <> 'mix' and (p_game is null or s.game_id = p_game)
    group by s.user_id, s.game_id
  )
  select p.name, p.avatar_color, p.avatar_icon, sum(b.best)::int, count(*)::int, p.id = auth.uid()
  from best b join profiles p on p.id = b.user_id
  group by p.id
  order by sum(b.best) desc, p.name
  limit 50;
$$;
grant execute on function public.weekly_leaderboard to anon, authenticated;
