-- RentRate triggers and helper functions
-- Run this after schema.sql and policies.sql.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_landlord_profiles_updated_at on public.landlord_profiles;
create trigger set_landlord_profiles_updated_at
before update on public.landlord_profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_tenant_profiles_updated_at on public.tenant_profiles;
create trigger set_tenant_profiles_updated_at
before update on public.tenant_profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_properties_updated_at on public.properties;
create trigger set_properties_updated_at
before update on public.properties
for each row
execute function public.set_updated_at();

drop trigger if exists set_tenant_property_links_updated_at on public.tenant_property_links;
create trigger set_tenant_property_links_updated_at
before update on public.tenant_property_links
for each row
execute function public.set_updated_at();

drop trigger if exists set_tenant_link_requests_updated_at on public.tenant_link_requests;
create trigger set_tenant_link_requests_updated_at
before update on public.tenant_link_requests
for each row
execute function public.set_updated_at();

drop trigger if exists set_property_reviews_updated_at on public.property_reviews;
create trigger set_property_reviews_updated_at
before update on public.property_reviews
for each row
execute function public.set_updated_at();

drop trigger if exists set_landlord_reviews_updated_at on public.landlord_reviews;
create trigger set_landlord_reviews_updated_at
before update on public.landlord_reviews
for each row
execute function public.set_updated_at();

create or replace function public.refresh_property_rating(p_property_id uuid)
returns void
language plpgsql
as $$
declare
  v_average numeric(3,2);
  v_total integer;
begin
  select
    coalesce(round(avg(pr.overall_rating)::numeric, 2), 0),
    count(*)::integer
  into v_average, v_total
  from public.property_reviews pr
  where pr.property_id = p_property_id;

  update public.properties
  set average_rating = v_average,
      total_reviews = v_total
  where id = p_property_id;
end;
$$;

create or replace function public.refresh_landlord_rating(p_landlord_id uuid)
returns void
language plpgsql
as $$
declare
  v_average numeric(3,2);
  v_total integer;
begin
  select
    coalesce(round(avg(lr.overall_rating)::numeric, 2), 0),
    count(*)::integer
  into v_average, v_total
  from public.landlord_reviews lr
  where lr.landlord_id = p_landlord_id;

  update public.landlord_profiles
  set average_rating = v_average,
      total_reviews = v_total
  where user_id = p_landlord_id;
end;
$$;

create or replace function public.handle_property_review_rating_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_property_rating(old.property_id);
    return old;
  end if;

  perform public.refresh_property_rating(new.property_id);

  if tg_op = 'UPDATE' and old.property_id <> new.property_id then
    perform public.refresh_property_rating(old.property_id);
  end if;

  return new;
end;
$$;

create or replace function public.handle_landlord_review_rating_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_landlord_rating(old.landlord_id);
    return old;
  end if;

  perform public.refresh_landlord_rating(new.landlord_id);

  if tg_op = 'UPDATE' and old.landlord_id <> new.landlord_id then
    perform public.refresh_landlord_rating(old.landlord_id);
  end if;

  return new;
end;
$$;

drop trigger if exists property_reviews_rating_sync on public.property_reviews;
create trigger property_reviews_rating_sync
after insert or update or delete on public.property_reviews
for each row
execute function public.handle_property_review_rating_change();

drop trigger if exists landlord_reviews_rating_sync on public.landlord_reviews;
create trigger landlord_reviews_rating_sync
after insert or update or delete on public.landlord_reviews
for each row
execute function public.handle_landlord_review_rating_change();

create or replace function public.refresh_landlord_property_count(p_landlord_id uuid)
returns void
language plpgsql
as $$
declare
  v_total integer;
begin
  select count(*)::integer
  into v_total
  from public.properties p
  where p.landlord_id = p_landlord_id;

  update public.landlord_profiles
  set total_properties = v_total
  where user_id = p_landlord_id;
end;
$$;

create or replace function public.handle_property_count_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_landlord_property_count(old.landlord_id);
    return old;
  end if;

  perform public.refresh_landlord_property_count(new.landlord_id);

  if tg_op = 'UPDATE' and old.landlord_id <> new.landlord_id then
    perform public.refresh_landlord_property_count(old.landlord_id);
  end if;

  return new;
end;
$$;

drop trigger if exists properties_count_sync on public.properties;
create trigger properties_count_sync
after insert or update or delete on public.properties
for each row
execute function public.handle_property_count_change();
