create extension if not exists "pgcrypto";

create table if not exists public.entities (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_name text not null,
  registration_number text,
  province text,
  district text,
  municipality text,
  city text,
  postal_code text,
  latitude numeric(10,8),
  longitude numeric(11,8),
  phone text,
  email text,
  website text,
  primary_contact_name text,
  primary_contact_phone text,
  primary_contact_email text,
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.schools (
  id uuid primary key references public.entities(id) on delete cascade,
  emis_number text unique,
  school_type text,
  phase text,
  number_of_learners integer,
  number_of_educators integer,
  quintile integer check (quintile between 1 and 5),
  no_fee_school boolean default false,
  language_medium text,
  principal_name text,
  principal_contact text,
  department_region text,
  circuit text,
  last_visit_date date,
  follow_up_required boolean default false,
  follow_up_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.warehouses (
  id uuid primary key references public.entities(id) on delete cascade,
  warehouse_code text unique,
  warehouse_tier integer check (warehouse_tier in (1,2,3)),
  storage_capacity_sqm numeric(10,2),
  current_stock_level_ucg_sets integer default 0,
  staffing_count integer,
  security_features text[],
  has_24hr_security boolean default false,
  has_cctv boolean default false,
  has_dock_levelers boolean default false,
  has_fire_suppression boolean default false,
  operating_hours jsonb,
  manager_name text,
  manager_phone text,
  manager_email text,
  serving_provinces text[],
  serving_districts text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.partner_organizations (
  id uuid primary key references public.entities(id) on delete cascade,
  organization_type text,
  registration_number text,
  service_type text,
  contract_start_date date,
  contract_end_date date,
  contract_value numeric(15,2),
  kpi_targets jsonb,
  current_rating numeric(3,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.sponsors (
  id uuid primary key references public.entities(id) on delete cascade,
  sponsor_type text,
  funding_commitment numeric(15,2),
  sponsorship_status text default 'active',
  contact_name text,
  contact_email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  warehouse_id uuid references public.warehouses(id) on delete set null,
  item_type text not null,
  item_code text not null,
  quantity_available integer default 0,
  quantity_reserved integer default 0,
  quantity_dispatched integer default 0,
  unit_cost numeric(10,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  shipment_code text unique not null,
  sender_warehouse_id uuid references public.warehouses(id) on delete set null,
  recipient_entity_id uuid references public.entities(id) on delete set null,
  shipment_type text default 'distribution',
  status text default 'planned',
  dispatched_at timestamptz,
  expected_delivery_at timestamptz,
  delivered_at timestamptz,
  tracking_reference text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.shipment_items (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid references public.shipments(id) on delete cascade,
  inventory_item_id uuid references public.inventory_items(id) on delete set null,
  quantity integer default 1,
  unit_value numeric(10,2),
  created_at timestamptz default now()
);

create table if not exists public.delivery_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid references public.shipments(id) on delete cascade,
  event_type text not null,
  occurred_at timestamptz default now(),
  actor_type text,
  actor_name text,
  notes text,
  latitude numeric(10,8),
  longitude numeric(11,8),
  created_at timestamptz default now()
);

create table if not exists public.delivery_confirmations (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid references public.shipments(id) on delete cascade,
  confirmed_by text,
  confirmed_at timestamptz default now(),
  proof_photo_url text,
  signature_url text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid references public.entities(id) on delete set null,
  session_title text not null,
  session_type text,
  province text,
  district text,
  venue_name text,
  scheduled_at timestamptz,
  status text default 'planned',
  attendee_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.training_attendees (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.training_sessions(id) on delete cascade,
  school_id uuid references public.schools(id) on delete set null,
  trainer_id uuid,
  attendance_status text default 'registered',
  registered_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.event_programmes (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid references public.sponsors(id) on delete set null,
  name text not null,
  start_date date,
  end_date date,
  status text default 'planned',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phase text,
  target_date date,
  actual_date date,
  status text default 'planned',
  owner_entity_id uuid references public.entities(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.project_kpis (
  id uuid primary key default gen_random_uuid(),
  metric_name text not null,
  metric_value numeric(12,2),
  period_start date,
  period_end date,
  entity_id uuid references public.entities(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_entities_type_status on public.entities(entity_type, status);
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='schools' AND column_name='phase')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='schools' AND column_name='department_region') THEN
    CREATE INDEX IF NOT EXISTS idx_schools_province ON public.schools(phase, department_region);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='warehouses' AND column_name='created_at') THEN
    CREATE INDEX IF NOT EXISTS idx_warehouses_province ON public.warehouses(created_at);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='shipments' AND column_name='status')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='shipments' AND column_name='expected_delivery_at') THEN
    CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status, expected_delivery_at);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='delivery_events' AND column_name='shipment_id')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='delivery_events' AND column_name='occurred_at') THEN
    CREATE INDEX IF NOT EXISTS idx_delivery_events_shipment ON public.delivery_events(shipment_id, occurred_at);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='training_sessions' AND column_name='scheduled_at')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='training_sessions' AND column_name='status') THEN
    CREATE INDEX IF NOT EXISTS idx_training_sessions_scheduled ON public.training_sessions(scheduled_at, status);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='project_milestones' AND column_name='phase')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='project_milestones' AND column_name='status') THEN
    CREATE INDEX IF NOT EXISTS idx_project_milestones_phase ON public.project_milestones(phase, status);
  END IF;
END $$;

alter table public.entities enable row level security;
alter table public.schools enable row level security;
alter table public.warehouses enable row level security;
alter table public.partner_organizations enable row level security;
alter table public.sponsors enable row level security;
alter table public.inventory_items enable row level security;
alter table public.shipments enable row level security;
alter table public.shipment_items enable row level security;
alter table public.delivery_events enable row level security;
alter table public.delivery_confirmations enable row level security;
alter table public.training_sessions enable row level security;
alter table public.training_attendees enable row level security;
alter table public.event_programmes enable row level security;
alter table public.project_milestones enable row level security;
alter table public.project_kpis enable row level security;
alter table public.audit_logs enable row level security;

