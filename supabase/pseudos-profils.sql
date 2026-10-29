-- Œil Studio : pseudo unique et profils publics. À exécuter après amis-parrainage.sql.

-- ---------------------------------------------------------------- Pseudo unique (@pseudo), le prénom reste libre
create extension if not exists unaccent with schema extensions;

create or replace function public.slug_username(src text) returns text
language plpgsql volatile set search_path = public as $$
declare base text; k text; n int := 0;
begin
  base := lower(regexp_replace(extensions.unaccent(coalesce(src, '')), '[^a-zA-Z0-9_.]', '', 'g'));
  if char_length(base) < 3 then base := base || 'oeil'; end if;
  base := left(base, 16);
  k := base;
  while exists (select 1 from profiles where username = k) loop
    n := n + 1;
    k := left(base, 16) || (10 + floor(random() * 990))::int;
    exit when n > 50;
  end loop;
  return k;
end $$;

alter table public.profiles add column if not exists username text;
update public.profiles set username = public.slug_username(name) where username is null;
alter table public.profiles alter column username set not null;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_username_key') then
    alter table public.profiles add constraint profiles_username_key unique (username);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_username_format') then
    alter table public.profiles add constraint profiles_username_format check (username ~ '^[a-z0-9_.]{3,20}$');
  end if;
end $$;
grant update (username) on public.profiles to authenticated;

-- Profil créé à l'inscription : prénom et pseudo du formulaire (ou prénom Google)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb); nm text; un text;
begin
  nm := left(coalesce(nullif(m->>'name', ''), nullif(m->>'given_name', ''), nullif(split_part(coalesce(m->>'full_name', ''), ' ', 1), ''), split_part(new.email, '@', 1)), 40);
  un := lower(coalesce(m->>'username', ''));
  if un !~ '^[a-z0-9_.]{3,20}$' or exists (select 1 from profiles where username = un) then un := slug_username(nm); end if;
  insert into public.profiles (id, name, username, role, avatar_color, avatar_icon)
  values (
    new.id, nm, un,
    case when m->>'role' in ('etudiant', 'enseignant', 'pro') then m->>'role' else 'etudiant' end,
    case when coalesce(m->>'avatar_color', '') ~ '^#[0-9A-Fa-f]{6}$' then m->>'avatar_color' else '#B9D9FF' end,
    left(coalesce(m->>'avatar_icon', ''), 32)
  )
  on conflict (id) do nothing;
  return new;
end $$;

create or replace function public.username_free(p_username text) returns boolean
language sql stable security definer set search_path = public as $$
  select lower(p_username) ~ '^[a-z0-9_.]{3,20}$' and not exists (select 1 from profiles where username = lower(p_username) and id is distinct from auth.uid());
$$;

-- ---------------------------------------------------------------- Classements et amis : prénom + pseudo
drop function if exists public.weekly_leaderboard(text, boolean);
create or replace function public.weekly_leaderboard(p_game text default null, p_friends boolean default false)
returns table (name text, username text, avatar_color text, avatar_icon text, points int, games int, is_me boolean, pro boolean)
language sql stable security definer set search_path = public as $$
  with week as (select date_trunc('week', now() at time zone 'Europe/Paris') at time zone 'Europe/Paris' as start),
  best as (
    select s.user_id, s.game_id, max(s.avg) as best
    from scores s, week
    where s.created_at >= week.start and s.game_id <> 'mix' and (p_game is null or s.game_id = p_game)
      and (not p_friends or s.user_id = auth.uid() or is_friend_of_me(s.user_id))
    group by s.user_id, s.game_id
  )
  select p.name, p.username, p.avatar_color, p.avatar_icon, sum(b.best)::int, count(*)::int, p.id = auth.uid(),
    (p.plan <> 'free' or p.parcours or coalesce(p.bonus_until > now(), false))
  from best b join profiles p on p.id = b.user_id
  group by p.id order by sum(b.best) desc, p.name limit 50;
$$;

drop function if exists public.daily_leaderboard(date);
create or replace function public.daily_leaderboard(p_day date)
returns table (name text, username text, avatar_color text, avatar_icon text, best int, pro boolean)
language sql stable security definer set search_path = public as $$
  select p.name, p.username, p.avatar_color, p.avatar_icon, max(s.avg),
    (p.plan <> 'free' or p.parcours or coalesce(p.bonus_until > now(), false))
  from scores s join profiles p on p.id = s.user_id
  where s.mode = 'daily' and s.day = p_day
  group by p.id order by max(s.avg) desc, min(s.created_at) limit 20;
$$;

drop function if exists public.my_friends();
create or replace function public.my_friends()
returns table (id uuid, name text, username text, avatar_color text, avatar_icon text, pro boolean, week_points int, week_games int, last timestamptz)
language sql stable security definer set search_path = public as $$
  with week as (select date_trunc('week', now() at time zone 'Europe/Paris') at time zone 'Europe/Paris' as start),
  mine as (select case when a = auth.uid() then b else a end as fid from friendships where a = auth.uid() or b = auth.uid()),
  best as (
    select s.user_id, s.game_id, max(s.avg) as best from scores s, week
    where s.created_at >= week.start and s.game_id <> 'mix' and s.user_id in (select fid from mine)
    group by s.user_id, s.game_id
  )
  select p.id, p.name, p.username, p.avatar_color, p.avatar_icon,
    (p.plan <> 'free' or p.parcours or coalesce(p.bonus_until > now(), false)),
    coalesce((select sum(best)::int from best where best.user_id = p.id), 0),
    coalesce((select count(*)::int from best where best.user_id = p.id), 0),
    (select max(created_at) from scores where user_id = p.id)
  from profiles p where p.id in (select fid from mine)
  order by 7 desc, p.name;
$$;

-- ---------------------------------------------------------------- Profil public
create or replace function public.public_profile(p_username text)
returns table (name text, username text, avatar_color text, avatar_icon text, pro boolean, role text, since timestamptz,
  sessions int, week_points int, is_me boolean, is_friend boolean, bests jsonb)
language sql stable security definer set search_path = public as $$
  with p as (select * from profiles where username = lower(trim(p_username))),
  week as (select date_trunc('week', now() at time zone 'Europe/Paris') at time zone 'Europe/Paris' as start)
  select p.name, p.username, p.avatar_color, p.avatar_icon,
    (p.plan <> 'free' or p.parcours or coalesce(p.bonus_until > now(), false)), p.role, p.created_at,
    (select count(*)::int from scores s where s.user_id = p.id and s.mode <> 'round'),
    coalesce((select sum(b)::int from (select max(s.avg) b from scores s, week where s.user_id = p.id and s.game_id <> 'mix' and s.created_at >= week.start group by s.game_id) x), 0),
    p.id = auth.uid(),
    coalesce(is_friend_of_me(p.id), false),
    coalesce((select jsonb_object_agg(game_id, best) from (select s.game_id, max(s.avg) best from scores s where s.user_id = p.id and s.game_id <> 'mix' group by s.game_id) g), '{}'::jsonb)
  from p;
$$;

create or replace function public.add_friend_by_username(p_username text) returns text
language plpgsql security definer set search_path = public as $$
declare f profiles;
begin
  if auth.uid() is null then raise exception 'connexion requise'; end if;
  select * into f from profiles where username = lower(trim(p_username));
  if f.id is null then raise exception 'code introuvable'; end if;
  if f.id = auth.uid() then raise exception 'c''est ton propre code'; end if;
  perform befriend(auth.uid(), f.id);
  return f.name;
end $$;

-- ---------------------------------------------------------------- Droits
revoke execute on function public.slug_username(text), public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.add_friend_by_username(text), public.my_friends() from public, anon;
grant execute on function public.add_friend_by_username(text), public.my_friends() to authenticated;
grant execute on function public.username_free(text), public.public_profile(text), public.weekly_leaderboard(text, boolean), public.daily_leaderboard(date) to anon, authenticated;
