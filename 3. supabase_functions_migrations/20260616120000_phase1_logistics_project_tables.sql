-- Phase 1 logistics / sponsor-project foundation
-- Adds operational geography, sponsor projects, fulfillment routing, and risk/KPI tracking.

-- Helper: project visibility for sponsor-owned projects and staff users.
CREATE OR REPLACE FUNCTION public.project_visible_to_user(p_project_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.sponsor_projects sp
    WHERE sp.id = p_project_id
      AND (
        sp.owner_user_id = auth.uid()
        OR has_any_role(auth.uid(), ARRAY['service','support','sales_agent','executive'])
      )
  );
$$;

-- 1) Sponsor project + operational delivery foundation
CREATE TABLE IF NOT EXISTS public.sponsor_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid REFERENCES public.sponsors(id) ON DELETE SET NULL,
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  project_name text NOT NULL DEFAULT '',
  project_theme text NOT NULL DEFAULT '',
  project_status text NOT NULL DEFAULT 'planning',
  budget_total numeric NOT NULL DEFAULT 0,
  units_target integer NOT NULL DEFAULT 0,
  units_delivered integer NOT NULL DEFAULT 0,
  start_date date,
  end_date date,
  summary text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sponsor_projects_sponsor ON public.sponsor_projects(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_projects_owner ON public.sponsor_projects(owner_user_id);

CREATE TABLE IF NOT EXISTS public.project_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.sponsor_projects(id) ON DELETE CASCADE,
  school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  warehouse_id uuid,
  units_allocated integer NOT NULL DEFAULT 0,
  units_delivered integer NOT NULL DEFAULT 0,
  delivery_status text NOT NULL DEFAULT 'pending',
  priority_level text NOT NULL DEFAULT 'normal',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_allocations_project ON public.project_allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_allocations_school ON public.project_allocations(school_id);

CREATE TABLE IF NOT EXISTS public.warehouse_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_type text NOT NULL DEFAULT 'warehouse',
  name text NOT NULL DEFAULT '',
  province text NOT NULL DEFAULT '',
  district text NOT NULL DEFAULT '',
  municipality text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  latitude double precision,
  longitude double precision,
  contact_name text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.warehouse_capacities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id uuid NOT NULL REFERENCES public.warehouse_nodes(id) ON DELETE CASCADE,
  capacity_units integer NOT NULL DEFAULT 0,
  available_units integer NOT NULL DEFAULT 0,
  storage_cbm numeric NOT NULL DEFAULT 0,
  storage_weight_kg numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name text NOT NULL DEFAULT '',
  min_km numeric NOT NULL DEFAULT 0,
  max_km numeric NOT NULL DEFAULT 0,
  cost_per_set numeric NOT NULL DEFAULT 0,
  fuel_factor numeric NOT NULL DEFAULT 1,
  handling_factor numeric NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Fulfillment and route cost layer
CREATE TABLE IF NOT EXISTS public.fulfillment_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.sponsor_projects(id) ON DELETE CASCADE,
  origin_warehouse_id uuid REFERENCES public.warehouse_nodes(id) ON DELETE SET NULL,
  destination_school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  distance_km numeric NOT NULL DEFAULT 0,
  zone_bucket text NOT NULL DEFAULT 'local',
  estimated_cost numeric NOT NULL DEFAULT 0,
  cbm_per_set numeric NOT NULL DEFAULT 0,
  weight_per_set_kg numeric NOT NULL DEFAULT 0,
  delivery_mode text NOT NULL DEFAULT 'road',
  status text NOT NULL DEFAULT 'planned',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fulfillment_routes_project ON public.fulfillment_routes(project_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_routes_origin ON public.fulfillment_routes(origin_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_routes_destination ON public.fulfillment_routes(destination_school_id);

CREATE TABLE IF NOT EXISTS public.fulfillment_cost_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_type text NOT NULL DEFAULT 'road',
  cost_per_set numeric NOT NULL DEFAULT 0,
  handling_cost numeric NOT NULL DEFAULT 0,
  fuel_cost numeric NOT NULL DEFAULT 0,
  insurance_cost numeric NOT NULL DEFAULT 0,
  risk_adjustment numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.delivery_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.sponsor_projects(id) ON DELETE CASCADE,
  route_id uuid REFERENCES public.fulfillment_routes(id) ON DELETE SET NULL,
  event_type text NOT NULL DEFAULT 'dispatched',
  status text NOT NULL DEFAULT 'scheduled',
  event_time timestamptz NOT NULL DEFAULT now(),
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_delivery_events_project ON public.delivery_events(project_id);
CREATE INDEX IF NOT EXISTS idx_delivery_events_route ON public.delivery_events(route_id);

-- 3) Risk and KPI tracking
CREATE TABLE IF NOT EXISTS public.project_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.sponsor_projects(id) ON DELETE CASCADE,
  risk_name text NOT NULL DEFAULT '',
  risk_level text NOT NULL DEFAULT 'medium',
  probability integer NOT NULL DEFAULT 1,
  impact integer NOT NULL DEFAULT 1,
  mitigation text NOT NULL DEFAULT '',
  owner_role text NOT NULL DEFAULT 'operations',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.sponsor_projects(id) ON DELETE CASCADE,
  kpi_name text NOT NULL DEFAULT '',
  value numeric NOT NULL DEFAULT 0,
  target_value numeric NOT NULL DEFAULT 0,
  trend text NOT NULL DEFAULT 'steady',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Triggers for updated_at
CREATE TRIGGER trg_sponsor_projects_updated
  BEFORE UPDATE ON public.sponsor_projects
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_project_allocations_updated
  BEFORE UPDATE ON public.project_allocations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_warehouse_nodes_updated
  BEFORE UPDATE ON public.warehouse_nodes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_warehouse_capacities_updated
  BEFORE UPDATE ON public.warehouse_capacities
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_delivery_zones_updated
  BEFORE UPDATE ON public.delivery_zones
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_fulfillment_routes_updated
  BEFORE UPDATE ON public.fulfillment_routes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_fulfillment_cost_models_updated
  BEFORE UPDATE ON public.fulfillment_cost_models
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_delivery_events_updated
  BEFORE UPDATE ON public.delivery_events
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_project_risks_updated
  BEFORE UPDATE ON public.project_risks
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_project_kpis_updated
  BEFORE UPDATE ON public.project_kpis
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Enable RLS
ALTER TABLE public.sponsor_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_capacities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillment_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillment_cost_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_kpis ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view warehouse geography" ON public.warehouse_nodes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view warehouse capacity" ON public.warehouse_capacities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view delivery zones" ON public.delivery_zones
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view fulfillment cost models" ON public.fulfillment_cost_models
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Sponsor owners and staff can view sponsor projects" ON public.sponsor_projects
  FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid() OR has_any_role(auth.uid(), ARRAY['service','support','sales_agent','executive']));

CREATE POLICY "Sponsor owners and staff can manage sponsor projects" ON public.sponsor_projects
  FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = auth.uid() OR has_any_role(auth.uid(), ARRAY['service','support','sales_agent','executive']));

CREATE POLICY "Sponsor owners and staff can update sponsor projects" ON public.sponsor_projects
  FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid() OR has_any_role(auth.uid(), ARRAY['service','support','sales_agent','executive']))
  WITH CHECK (owner_user_id = auth.uid() OR has_any_role(auth.uid(), ARRAY['service','support','sales_agent','executive']));

CREATE POLICY "Sponsor owners and staff can delete sponsor projects" ON public.sponsor_projects
  FOR DELETE TO authenticated
  USING (owner_user_id = auth.uid() OR has_any_role(auth.uid(), ARRAY['service','support','sales_agent','executive']));

CREATE POLICY "Project viewers can view allocations" ON public.project_allocations
  FOR SELECT TO authenticated
  USING (public.project_visible_to_user(project_id));

CREATE POLICY "Project managers can manage allocations" ON public.project_allocations
  FOR INSERT TO authenticated
  WITH CHECK (public.project_visible_to_user(project_id));

CREATE POLICY "Project managers can update allocations" ON public.project_allocations
  FOR UPDATE TO authenticated
  USING (public.project_visible_to_user(project_id))
  WITH CHECK (public.project_visible_to_user(project_id));

CREATE POLICY "Project managers can delete allocations" ON public.project_allocations
  FOR DELETE TO authenticated
  USING (public.project_visible_to_user(project_id));

CREATE POLICY "Project viewers can view fulfillment routes" ON public.fulfillment_routes
  FOR SELECT TO authenticated
  USING (public.project_visible_to_user(project_id));

CREATE POLICY "Project managers can manage fulfillment routes" ON public.fulfillment_routes
  FOR INSERT TO authenticated
  WITH CHECK (public.project_visible_to_user(project_id));

CREATE POLICY "Project managers can update fulfillment routes" ON public.fulfillment_routes
  FOR UPDATE TO authenticated
  USING (public.project_visible_to_user(project_id))
  WITH CHECK (public.project_visible_to_user(project_id));

CREATE POLICY "Project managers can delete fulfillment routes" ON public.fulfillment_routes
  FOR DELETE TO authenticated
  USING (public.project_visible_to_user(project_id));

CREATE POLICY "Project viewers can view delivery events" ON public.delivery_events
  FOR SELECT TO authenticated
  USING (public.project_visible_to_user(project_id));

CREATE POLICY "Project managers can manage delivery events" ON public.delivery_events
  FOR INSERT TO authenticated
  WITH CHECK (public.project_visible_to_user(project_id));

CREATE POLICY "Project managers can update delivery events" ON public.delivery_events
  FOR UPDATE TO authenticated
  USING (public.project_visible_to_user(project_id))
  WITH CHECK (public.project_visible_to_user(project_id));

CREATE POLICY "Project managers can delete delivery events" ON public.delivery_events
  FOR DELETE TO authenticated
  USING (public.project_visible_to_user(project_id));

CREATE POLICY "Project viewers can view risks" ON public.project_risks
  FOR SELECT TO authenticated
  USING (public.project_visible_to_user(project_id));

CREATE POLICY "Project managers can manage risks" ON public.project_risks
  FOR INSERT TO authenticated
  WITH CHECK (public.project_visible_to_user(project_id));

CREATE POLICY "Project managers can update risks" ON public.project_risks
  FOR UPDATE TO authenticated
  USING (public.project_visible_to_user(project_id))
  WITH CHECK (public.project_visible_to_user(project_id));

CREATE POLICY "Project managers can delete risks" ON public.project_risks
  FOR DELETE TO authenticated
  USING (public.project_visible_to_user(project_id));

CREATE POLICY "Project viewers can view KPIs" ON public.project_kpis
  FOR SELECT TO authenticated
  USING (public.project_visible_to_user(project_id));

CREATE POLICY "Project managers can manage KPIs" ON public.project_kpis
  FOR INSERT TO authenticated
  WITH CHECK (public.project_visible_to_user(project_id));

CREATE POLICY "Project managers can update KPIs" ON public.project_kpis
  FOR UPDATE TO authenticated
  USING (public.project_visible_to_user(project_id))
  WITH CHECK (public.project_visible_to_user(project_id));

CREATE POLICY "Project managers can delete KPIs" ON public.project_kpis
  FOR DELETE TO authenticated
  USING (public.project_visible_to_user(project_id));
