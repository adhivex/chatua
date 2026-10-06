-- Chatua v1 schema (Supabase Postgres).
-- Translated from the v3 handoff's prisma/schema.prisma (docs/05-DATABASE.md); see docs/DECISIONS.md.
-- Money is integer INR rupees. Tables and columns are snake_case.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------- enums
create type public.order_status as enum ('PLACED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

create type public.payment_status as enum ('PENDING', 'PAID', 'FAILED', 'COD', 'REFUNDED');

create type public.payment_method as enum ('UPI', 'CARD', 'NETBANKING', 'COD');

create type public.delivery_method as enum ('STANDARD', 'EXPRESS');

-- ---------------------------------------------------------------- helpers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- catalogue
create table public.products (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  category     text not null check (category in ('Classic', 'Multi-Grain', 'Jaggery', 'Protein')),
  short_desc   text not null,
  long_desc    text not null,
  how_to_enjoy text,
  storage      text,
  bestseller   boolean not null default false,
  active       boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.variants (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size       text not null check (size in ('500g', '1kg')),
  grams      integer not null check (grams > 0),
  price      integer not null check (price > 0),           -- INR rupees
  stock      integer not null default 0 check (stock >= 0),
  sku        text not null unique,
  unique (product_id, size)
);

create index variants_product_id_idx on public.variants (product_id);

create table public.product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products (id) on delete cascade,
  storage_path text not null,                               -- object path in the product-images bucket
  alt          text not null,
  position     integer not null default 0
);

create index product_images_product_id_idx on public.product_images (product_id, position);

create table public.recipes (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  title      text not null,
  note       text not null,
  category   text not null check (category in ('Drinks', 'Breakfast', 'Snacks')),
  body       text not null,
  image_path text,                                          -- object path in the product-images bucket
  sort_order integer not null default 0
);

-- ---------------------------------------------------------------- orders
create table public.orders (
  id                  uuid primary key default gen_random_uuid(),
  seq                 bigint generated always as identity unique,
  -- CHATUA00001; widens naturally past 99999 instead of truncating.
  order_number        text generated always as (
                        'CHATUA' || case when seq < 100000 then lpad(seq::text, 5, '0') else seq::text end
                      ) stored unique,
  -- Unguessable token for the guest order page link (/order/CHATUA00001?t=...).
  access_token        text not null unique default encode(extensions.gen_random_bytes(24), 'hex'),
  status              public.order_status not null default 'PLACED',
  payment_status      public.payment_status not null default 'PENDING',
  payment_method      public.payment_method not null,
  delivery_method     public.delivery_method not null,
  subtotal            integer not null check (subtotal >= 0),
  delivery_fee        integer not null check (delivery_fee >= 0),
  total               integer not null check (total >= 0),
  customer_name       text not null,
  phone               text not null check (phone ~ '^[0-9]{10}$'),
  email               text,
  address_type        text not null default 'Home' check (address_type in ('Home', 'Work')),
  address_line        text not null,
  city                text not null,
  state               text,
  pincode             text not null check (pincode ~ '^[0-9]{6}$'),
  razorpay_order_id   text unique,
  razorpay_payment_id text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  check (total = subtotal + delivery_fee)
);

create index orders_created_at_idx on public.orders (created_at desc);

create index orders_status_idx on public.orders (status);

create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  name       text not null,                                 -- snapshot
  size       text not null,                                 -- snapshot
  unit_price integer not null check (unit_price >= 0),      -- snapshot, INR rupees
  qty        integer not null check (qty between 1 and 20)
);

create index order_items_order_id_idx on public.order_items (order_id);

-- ---------------------------------------------------------------- row level security
-- Storefront reads use the anon key and see active catalogue rows only.
-- Orders and order items have no policies: only server code with the service role can touch them.
alter table public.products enable row level security;

alter table public.variants enable row level security;

alter table public.product_images enable row level security;

alter table public.recipes enable row level security;

alter table public.orders enable row level security;

alter table public.order_items enable row level security;

create policy "Active products are public" on public.products
  for select to anon, authenticated using (active);

create policy "Variants of active products are public" on public.variants
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.active));

create policy "Images of active products are public" on public.product_images
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.active));

create policy "Recipes are public" on public.recipes
  for select to anon, authenticated using (true);

-- ---------------------------------------------------------------- storage
-- Public bucket for product and recipe photos (served through next/image).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;
