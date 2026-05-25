-- RentRate Supabase schema
-- Run this first.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  role text not null check (role in ('landlord', 'tenant')),
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.landlord_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  bio text,
  average_rating numeric(3,2) not null default 0,
  total_reviews integer not null default 0,
  total_properties integer not null default 0,
  is_verified boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tenant_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  occupation text,
  current_location text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  location text not null,
  address text,
  rent_price numeric(12,2) not null check (rent_price >= 0),
  property_type text not null,
  bedrooms integer not null default 0 check (bedrooms >= 0),
  bathrooms integer not null default 0 check (bathrooms >= 0),
  availability_status text not null default 'available' check (availability_status in ('available', 'occupied', 'maintenance')),
  average_rating numeric(3,2) not null default 0,
  total_reviews integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  image_url text,
  is_cover boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.property_amenities (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  amenity text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tenant_property_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references auth.users(id) on delete cascade,
  landlord_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  status text not null default 'pending' check (status in ('active', 'past', 'pending')),
  start_date date,
  end_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tenant_link_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references auth.users(id) on delete cascade,
  landlord_id uuid references auth.users(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  tenant_name text,
  tenant_email text,
  landlord_email text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  note text,
  requested_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint tenant_link_requests_unique_tenant_landlord_email unique (tenant_id, landlord_email)
);

create table if not exists public.property_reviews (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  tenant_id uuid not null references auth.users(id) on delete cascade,
  landlord_id uuid not null references auth.users(id) on delete cascade,
  overall_rating integer not null check (overall_rating between 1 and 5),
  maintenance_rating integer not null check (maintenance_rating between 1 and 5),
  property_condition_rating integer not null check (property_condition_rating between 1 and 5),
  rent_fairness_rating integer not null check (rent_fairness_rating between 1 and 5),
  comment text,
  would_recommend boolean,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint property_reviews_unique_tenant_property unique (property_id, tenant_id),
  constraint property_reviews_no_self_review check (tenant_id <> landlord_id)
);

create table if not exists public.landlord_reviews (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references auth.users(id) on delete cascade,
  tenant_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  overall_rating integer not null check (overall_rating between 1 and 5),
  communication_rating integer not null check (communication_rating between 1 and 5),
  maintenance_response_rating integer not null check (maintenance_response_rating between 1 and 5),
  fairness_rating integer not null check (fairness_rating between 1 and 5),
  comment text,
  would_recommend boolean,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint landlord_reviews_unique_tenant_landlord_property unique (landlord_id, tenant_id, property_id),
  constraint landlord_reviews_no_self_review check (tenant_id <> landlord_id)
);

create table if not exists public.landlord_contacts (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  landlord_id uuid not null references auth.users(id) on delete cascade,
  tenant_id uuid not null references auth.users(id) on delete cascade,
  tenant_name text not null,
  tenant_email text,
  tenant_phone text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'closed')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.saved_properties (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint saved_properties_unique_tenant_property unique (tenant_id, property_id)
);

create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_landlord_profiles_user_id on public.landlord_profiles(user_id);
create index if not exists idx_tenant_profiles_user_id on public.tenant_profiles(user_id);
create index if not exists idx_properties_landlord_id on public.properties(landlord_id);
create index if not exists idx_properties_availability_status on public.properties(availability_status);
create index if not exists idx_properties_location on public.properties(location);
create index if not exists idx_property_images_property_id on public.property_images(property_id);
create index if not exists idx_property_amenities_property_id on public.property_amenities(property_id);
create index if not exists idx_tenant_property_links_tenant_id on public.tenant_property_links(tenant_id);
create index if not exists idx_tenant_property_links_landlord_id on public.tenant_property_links(landlord_id);
create index if not exists idx_tenant_property_links_property_id on public.tenant_property_links(property_id);
create index if not exists idx_tenant_link_requests_tenant_id on public.tenant_link_requests(tenant_id);
create index if not exists idx_tenant_link_requests_landlord_id on public.tenant_link_requests(landlord_id);
create index if not exists idx_tenant_link_requests_status on public.tenant_link_requests(status);
create index if not exists idx_tenant_link_requests_landlord_email on public.tenant_link_requests(landlord_email);
create index if not exists idx_property_reviews_property_id on public.property_reviews(property_id);
create index if not exists idx_property_reviews_tenant_id on public.property_reviews(tenant_id);
create index if not exists idx_landlord_reviews_landlord_id on public.landlord_reviews(landlord_id);
create index if not exists idx_landlord_reviews_tenant_id on public.landlord_reviews(tenant_id);
create index if not exists idx_landlord_contacts_landlord_id on public.landlord_contacts(landlord_id);
create index if not exists idx_landlord_contacts_tenant_id on public.landlord_contacts(tenant_id);
create index if not exists idx_saved_properties_tenant_id on public.saved_properties(tenant_id);
create index if not exists idx_saved_properties_property_id on public.saved_properties(property_id);
