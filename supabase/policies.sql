-- RentRate Row Level Security policies
-- Run this after schema.sql.

alter table public.profiles enable row level security;
alter table public.landlord_profiles enable row level security;
alter table public.tenant_profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.property_amenities enable row level security;
alter table public.tenant_property_links enable row level security;
alter table public.tenant_link_requests enable row level security;
alter table public.property_reviews enable row level security;
alter table public.landlord_reviews enable row level security;
alter table public.landlord_contacts enable row level security;
alter table public.saved_properties enable row level security;

-- Profiles
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
create policy "profiles_select_public"
on public.profiles
for select
using (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Landlord profiles
DROP POLICY IF EXISTS "landlord_profiles_select_public" ON public.landlord_profiles;
create policy "landlord_profiles_select_public"
on public.landlord_profiles
for select
using (true);

DROP POLICY IF EXISTS "landlord_profiles_insert_own" ON public.landlord_profiles;
create policy "landlord_profiles_insert_own"
on public.landlord_profiles
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'landlord'
  )
);

DROP POLICY IF EXISTS "landlord_profiles_update_own" ON public.landlord_profiles;
create policy "landlord_profiles_update_own"
on public.landlord_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Tenant profiles
DROP POLICY IF EXISTS "tenant_profiles_select_own" ON public.tenant_profiles;
create policy "tenant_profiles_select_own"
on public.tenant_profiles
for select
using (auth.uid() = user_id);

DROP POLICY IF EXISTS "tenant_profiles_insert_own" ON public.tenant_profiles;
create policy "tenant_profiles_insert_own"
on public.tenant_profiles
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'tenant'
  )
);

DROP POLICY IF EXISTS "tenant_profiles_update_own" ON public.tenant_profiles;
create policy "tenant_profiles_update_own"
on public.tenant_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Properties
DROP POLICY IF EXISTS "properties_select_available_or_owned_or_linked" ON public.properties;
create policy "properties_select_available_or_owned_or_linked"
on public.properties
for select
using (
  availability_status = 'available'
  or landlord_id = auth.uid()
  or exists (
    select 1
    from public.tenant_property_links tpl
    where tpl.property_id = properties.id
      and tpl.tenant_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "properties_insert_landlord_own" ON public.properties;
create policy "properties_insert_landlord_own"
on public.properties
for insert
with check (
  landlord_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'landlord'
  )
);

DROP POLICY IF EXISTS "properties_update_landlord_own" ON public.properties;
create policy "properties_update_landlord_own"
on public.properties
for update
using (landlord_id = auth.uid())
with check (landlord_id = auth.uid());

DROP POLICY IF EXISTS "properties_delete_landlord_own" ON public.properties;
create policy "properties_delete_landlord_own"
on public.properties
for delete
using (landlord_id = auth.uid());

-- Property images
DROP POLICY IF EXISTS "property_images_select_public" ON public.property_images;
create policy "property_images_select_public"
on public.property_images
for select
using (true);

DROP POLICY IF EXISTS "property_images_insert_owner" ON public.property_images;
create policy "property_images_insert_owner"
on public.property_images
for insert
with check (
  exists (
    select 1
    from public.properties p
    where p.id = property_images.property_id
      and p.landlord_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "property_images_update_owner" ON public.property_images;
create policy "property_images_update_owner"
on public.property_images
for update
using (
  exists (
    select 1
    from public.properties p
    where p.id = property_images.property_id
      and p.landlord_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.properties p
    where p.id = property_images.property_id
      and p.landlord_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "property_images_delete_owner" ON public.property_images;
create policy "property_images_delete_owner"
on public.property_images
for delete
using (
  exists (
    select 1
    from public.properties p
    where p.id = property_images.property_id
      and p.landlord_id = auth.uid()
  )
);

-- Property amenities
DROP POLICY IF EXISTS "property_amenities_select_public" ON public.property_amenities;
create policy "property_amenities_select_public"
on public.property_amenities
for select
using (true);

DROP POLICY IF EXISTS "property_amenities_insert_owner" ON public.property_amenities;
create policy "property_amenities_insert_owner"
on public.property_amenities
for insert
with check (
  exists (
    select 1
    from public.properties p
    where p.id = property_amenities.property_id
      and p.landlord_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "property_amenities_update_owner" ON public.property_amenities;
create policy "property_amenities_update_owner"
on public.property_amenities
for update
using (
  exists (
    select 1
    from public.properties p
    where p.id = property_amenities.property_id
      and p.landlord_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.properties p
    where p.id = property_amenities.property_id
      and p.landlord_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "property_amenities_delete_owner" ON public.property_amenities;
create policy "property_amenities_delete_owner"
on public.property_amenities
for delete
using (
  exists (
    select 1
    from public.properties p
    where p.id = property_amenities.property_id
      and p.landlord_id = auth.uid()
  )
);

-- Tenant-property links
DROP POLICY IF EXISTS "tenant_property_links_select_tenant_or_landlord" ON public.tenant_property_links;
create policy "tenant_property_links_select_tenant_or_landlord"
on public.tenant_property_links
for select
using (
  tenant_id = auth.uid()
  or landlord_id = auth.uid()
);

DROP POLICY IF EXISTS "tenant_property_links_insert_landlord_own_property" ON public.tenant_property_links;
create policy "tenant_property_links_insert_landlord_own_property"
on public.tenant_property_links
for insert
with check (
  landlord_id = auth.uid()
  and exists (
    select 1
    from public.properties p
    where p.id = tenant_property_links.property_id
      and p.landlord_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "tenant_property_links_update_landlord_own_property" ON public.tenant_property_links;
create policy "tenant_property_links_update_landlord_own_property"
on public.tenant_property_links
for update
using (
  landlord_id = auth.uid()
  and exists (
    select 1
    from public.properties p
    where p.id = tenant_property_links.property_id
      and p.landlord_id = auth.uid()
  )
)
with check (
  landlord_id = auth.uid()
  and exists (
    select 1
    from public.properties p
    where p.id = tenant_property_links.property_id
      and p.landlord_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "tenant_property_links_delete_landlord_own_property" ON public.tenant_property_links;
create policy "tenant_property_links_delete_landlord_own_property"
on public.tenant_property_links
for delete
using (
  landlord_id = auth.uid()
  and exists (
    select 1
    from public.properties p
    where p.id = tenant_property_links.property_id
      and p.landlord_id = auth.uid()
  )
);

-- Tenant link requests
DROP POLICY IF EXISTS "tenant_link_requests_select_tenant_or_landlord" ON public.tenant_link_requests;
create policy "tenant_link_requests_select_tenant_or_landlord"
on public.tenant_link_requests
for select
using (
  tenant_id = auth.uid()
  or landlord_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'landlord'
      and lower(p.email) = lower(tenant_link_requests.landlord_email)
  )
);

DROP POLICY IF EXISTS "tenant_link_requests_insert_tenant_self" ON public.tenant_link_requests;
create policy "tenant_link_requests_insert_tenant_self"
on public.tenant_link_requests
for insert
with check (
  tenant_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'tenant'
  )
);

DROP POLICY IF EXISTS "tenant_link_requests_update_tenant_self" ON public.tenant_link_requests;
create policy "tenant_link_requests_update_tenant_self"
on public.tenant_link_requests
for update
using (tenant_id = auth.uid())
with check (
  tenant_id = auth.uid()
  and status in ('pending', 'cancelled', 'rejected')
);

DROP POLICY IF EXISTS "tenant_link_requests_update_landlord" ON public.tenant_link_requests;
create policy "tenant_link_requests_update_landlord"
on public.tenant_link_requests
for update
using (
  landlord_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'landlord'
      and lower(p.email) = lower(tenant_link_requests.landlord_email)
  )
)
with check (
  landlord_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'landlord'
      and lower(p.email) = lower(tenant_link_requests.landlord_email)
  )
);

-- Property reviews
DROP POLICY IF EXISTS "property_reviews_select_public" ON public.property_reviews;
create policy "property_reviews_select_public"
on public.property_reviews
for select
using (true);

DROP POLICY IF EXISTS "property_reviews_insert_tenant_self" ON public.property_reviews;
create policy "property_reviews_insert_tenant_self"
on public.property_reviews
for insert
with check (
  tenant_id = auth.uid()
  and tenant_id <> landlord_id
  and exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'tenant'
  )
  and exists (
    select 1
    from public.tenant_property_links tpl
    where tpl.property_id = property_reviews.property_id
      and tpl.tenant_id = auth.uid()
      and tpl.landlord_id = property_reviews.landlord_id
      and tpl.status in ('active', 'past')
  )
);

DROP POLICY IF EXISTS "property_reviews_update_tenant_self" ON public.property_reviews;
create policy "property_reviews_update_tenant_self"
on public.property_reviews
for update
using (tenant_id = auth.uid())
with check (tenant_id = auth.uid());

DROP POLICY IF EXISTS "property_reviews_delete_tenant_self" ON public.property_reviews;
create policy "property_reviews_delete_tenant_self"
on public.property_reviews
for delete
using (tenant_id = auth.uid());

-- Landlord reviews
DROP POLICY IF EXISTS "landlord_reviews_select_public" ON public.landlord_reviews;
create policy "landlord_reviews_select_public"
on public.landlord_reviews
for select
using (true);

DROP POLICY IF EXISTS "landlord_reviews_insert_tenant_self" ON public.landlord_reviews;
create policy "landlord_reviews_insert_tenant_self"
on public.landlord_reviews
for insert
with check (
  tenant_id = auth.uid()
  and tenant_id <> landlord_id
  and exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'tenant'
  )
  and exists (
    select 1
    from public.tenant_property_links tpl
    where tpl.property_id = landlord_reviews.property_id
      and tpl.tenant_id = auth.uid()
      and tpl.landlord_id = landlord_reviews.landlord_id
      and tpl.status in ('active', 'past')
  )
);

DROP POLICY IF EXISTS "landlord_reviews_update_tenant_self" ON public.landlord_reviews;
create policy "landlord_reviews_update_tenant_self"
on public.landlord_reviews
for update
using (tenant_id = auth.uid())
with check (tenant_id = auth.uid());

DROP POLICY IF EXISTS "landlord_reviews_delete_tenant_self" ON public.landlord_reviews;
create policy "landlord_reviews_delete_tenant_self"
on public.landlord_reviews
for delete
using (tenant_id = auth.uid());

-- Landlord contacts
DROP POLICY IF EXISTS "landlord_contacts_insert_tenant_self" ON public.landlord_contacts;
create policy "landlord_contacts_insert_tenant_self"
on public.landlord_contacts
for insert
with check (
  tenant_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'tenant'
  )
  and exists (
    select 1
    from public.properties pr
    where pr.id = landlord_contacts.property_id
      and pr.landlord_id = landlord_contacts.landlord_id
  )
);

DROP POLICY IF EXISTS "landlord_contacts_select_tenant_or_landlord" ON public.landlord_contacts;
create policy "landlord_contacts_select_tenant_or_landlord"
on public.landlord_contacts
for select
using (tenant_id = auth.uid() or landlord_id = auth.uid());

DROP POLICY IF EXISTS "landlord_contacts_update_landlord_status" ON public.landlord_contacts;
create policy "landlord_contacts_update_landlord_status"
on public.landlord_contacts
for update
using (landlord_id = auth.uid())
with check (landlord_id = auth.uid());

-- Saved properties
DROP POLICY IF EXISTS "saved_properties_insert_tenant_self" ON public.saved_properties;
create policy "saved_properties_insert_tenant_self"
on public.saved_properties
for insert
with check (
  tenant_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'tenant'
  )
);

DROP POLICY IF EXISTS "saved_properties_select_tenant_self" ON public.saved_properties;
create policy "saved_properties_select_tenant_self"
on public.saved_properties
for select
using (tenant_id = auth.uid());

DROP POLICY IF EXISTS "saved_properties_delete_tenant_self" ON public.saved_properties;
create policy "saved_properties_delete_tenant_self"
on public.saved_properties
for delete
using (tenant_id = auth.uid());
