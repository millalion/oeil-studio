-- Œil Studio : amis et parrainage. À exécuter après schema.sql (le script peut être relancé sans risque).

-- ---------------------------------------------------------------- Codes ami et bonus
create or replace function public.gen_friend_code() returns text
language plpgsql volatile set search_path = public as $$
declare k text; alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  loop
    k := '';
    for i in 1..6 loop k := k || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1); end loop;
    exit when not exists (select 1 from profiles where friend_code = k);
  end loop;
  return k;
end $$;

alter table public.profiles add column if not exists friend_code text unique;
alter table public.profiles add column if not exists referred_by uuid references public.profiles on delete set null;
alter table public.profiles add column if not exists bonus_until timestamptz;
update public.profiles set friend_code = public.gen_friend_code() where friend_code is null;
alter table public.profiles alter column friend_code set default public.gen_friend_code();
alter table public.profiles alter column friend_code set not null;

-- ---------------------------------------------------------------- Amitiés (réciproques)
create table if not exists public.friendships (
  a uuid not null references public.profiles on delete cascade,
  b uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (a, b),
  check (a < b)
);
alter table public.friendships enable row level security;
-- Aucune politique : tout passe par les fonctions ci-dessous.

create or replace function public.befriend(x uuid, y uuid) returns void
language sql security definer set search_path = public as $$
  insert into friendships (a, b) values (least(x, y), greatest(x, y)) on conflict do nothing;
$$;
revoke execute on function public.befriend(uuid, uuid) from public, anon, authenticated;

create or replace function public.is_friend_of_me(other uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from friendships where (a = auth.uid() and b = other) or (b = auth.uid() and a = other));
$$;

create or replace function public.add_friend(p_code text) returns text
language plpgsql security definer set search_path = public as $$
declare f profiles; n int;
begin
  if auth.uid() is null then raise exception 'connexion requise'; end if;
  select * into f from profiles where friend_code = upper(trim(p_code));
  if f.id is null then raise exception 'code introuvable'; end if;
  if f.id = auth.uid() then raise exception 'c''est ton propre code'; end if;
  select count(*) into n from friendships where a = auth.uid() or b = auth.uid();
  if n >= 200 then raise exception 'trop d''amis'; end if;
  perform befriend(auth.uid(), f.id);
  return f.name;
end $$;

create or replace function public.remove_friend(p_friend uuid) returns void
language sql security definer set search_path = public as $$
  delete from friendships where (a = auth.uid() and b = p_friend) or (b = auth.uid() and a = p_friend);
$$;

-- Amis avec leurs scores de la semaine (lundi, heure de Paris)
create or replace function public.my_friends()
returns table (id uuid, name text, avatar_color text, avatar_icon text, pro boolean, week_points int, week_games int, last timestamptz)
language sql stable security definer set search_path = public as $$
  with week as (select date_trunc('week', now() at time zone 'Europe/Paris') at time zone 'Europe/Paris' as start),
  mine as (select case when a = auth.uid() then b else a end as fid from friendships where a = auth.uid() or b = auth.uid()),
  best as (
    select s.user_id, s.game_id, max(s.avg) as best from scores s, week
    where s.created_at >= week.start and s.game_id <> 'mix' and s.user_id in (select fid from mine)
    group by s.user_id, s.game_id
  )
  select p.id, p.name, p.avatar_color, p.avatar_icon,
    (p.plan <> 'free' or p.parcours or coalesce(p.bonus_until > now(), false)),
    coalesce((select sum(best)::int from best where best.user_id = p.id), 0),
    coalesce((select count(*)::int from best where best.user_id = p.id), 0),
    (select max(created_at) from scores where user_id = p.id)
  from profiles p where p.id in (select fid from mine)
  order by 6 desc, p.name;
$$;

-- ---------------------------------------------------------------- Parrainage
-- Le lien d'invitation affiche le prénom de la personne qui invite.
create or replace function public.referrer_name(p_code text) returns text
language sql stable security definer set search_path = public as $$
  select name from profiles where friend_code = upper(trim(p_code));
$$;

-- Appelée juste après l'inscription : 14 jours d'Œil Pro pour le filleul et pour le parrain
-- (bonus limité à 10 filleuls par parrain), et les deux deviennent amis.
create or replace function public.claim_referral(p_code text) returns text
language plpgsql security definer set search_path = public as $$
declare me profiles; r profiles; n int;
begin
  select * into me from profiles where id = auth.uid();
  if me.id is null then raise exception 'connexion requise'; end if;
  if me.referred_by is not null then return 'deja'; end if;
  if me.created_at < now() - interval '7 days' then return 'trop tard'; end if;
  select * into r from profiles where friend_code = upper(trim(p_code));
  if r.id is null or r.id = me.id then return 'invalide'; end if;
  update profiles set referred_by = r.id, bonus_until = greatest(coalesce(bonus_until, now()), now()) + interval '14 days' where id = me.id;
  select count(*) into n from profiles where referred_by = r.id;
  if n <= 10 then
    update profiles set bonus_until = greatest(coalesce(bonus_until, now()), now()) + interval '14 days' where id = r.id;
  end if;
  perform befriend(me.id, r.id);
  return r.name;
end $$;

create or replace function public.my_referrals() returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int from profiles where referred_by = auth.uid();
$$;

-- ---------------------------------------------------------------- Offre effective : le bonus de parrainage vaut Œil Pro
create or replace function public.my_access() returns text
language sql stable security definer set search_path = public as $$
  select case
    when p.plan <> 'free' and (p.plan_until is null or p.plan_until > now()) then p.plan
    when p.bonus_until > now() then 'pro'
    when p.parcours then 'parcours'
    when exists (
      select 1 from class_members m join classes c on c.id = m.class_id join profiles t on t.id = c.teacher_id
      where m.user_id = p.id and t.plan in ('classe', 'ecole') and (t.plan_until is null or t.plan_until > now())
    ) then 'classe-eleve'
    else 'free' end
  from profiles p where p.id = auth.uid();
$$;

-- ---------------------------------------------------------------- Classement de la semaine, avec le filtre « mes amis »
drop function if exists public.weekly_leaderboard(text);
create or replace function public.weekly_leaderboard(p_game text default null, p_friends boolean default false)
returns table (name text, avatar_color text, avatar_icon text, points int, games int, is_me boolean, pro boolean)
language sql stable security definer set search_path = public as $$
  with week as (select date_trunc('week', now() at time zone 'Europe/Paris') at time zone 'Europe/Paris' as start),
  best as (
    select s.user_id, s.game_id, max(s.avg) as best
    from scores s, week
    where s.created_at >= week.start and s.game_id <> 'mix' and (p_game is null or s.game_id = p_game)
      and (not p_friends or s.user_id = auth.uid() or is_friend_of_me(s.user_id))
    group by s.user_id, s.game_id
  )
  select p.name, p.avatar_color, p.avatar_icon, sum(b.best)::int, count(*)::int, p.id = auth.uid(),
    (p.plan <> 'free' or p.parcours or coalesce(p.bonus_until > now(), false))
  from best b join profiles p on p.id = b.user_id
  group by p.id
  order by sum(b.best) desc, p.name
  limit 50;
$$;

-- ---------------------------------------------------------------- Droits
revoke execute on function public.gen_friend_code(), public.is_friend_of_me(uuid) from public, anon;
revoke execute on function public.add_friend(text), public.remove_friend(uuid), public.my_friends(), public.claim_referral(text), public.my_referrals(), public.my_access() from public, anon;
grant execute on function public.is_friend_of_me(uuid), public.add_friend(text), public.remove_friend(uuid), public.my_friends(), public.claim_referral(text), public.my_referrals(), public.my_access() to authenticated;
grant execute on function public.referrer_name(text), public.weekly_leaderboard(text, boolean) to anon, authenticated;
