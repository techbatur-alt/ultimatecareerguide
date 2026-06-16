-- CUSTOMERS (CRM only, no auth)
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  notes text NOT NULL DEFAULT '',
  owner_agent_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_customers_owner ON public.customers(owner_agent_id);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view customers" ON public.customers FOR SELECT TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['service','support','sales_agent','executive']));
CREATE POLICY "Staff insert customers" ON public.customers FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['support','sales_agent','executive']));
CREATE POLICY "Staff update customers" ON public.customers FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['support','sales_agent','executive']));
CREATE POLICY "Staff delete customers" ON public.customers FOR DELETE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['support','executive']));

CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- SALES AGENTS
CREATE TABLE public.sales_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  commission_rate numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'invited',
  invited_email text NOT NULL DEFAULT '',
  invited_at timestamptz,
  activated_at timestamptz,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view sales_agents" ON public.sales_agents FOR SELECT TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['service','support','sales_agent','executive']));
CREATE POLICY "Agent view own row" ON public.sales_agents FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Support manage sales_agents" ON public.sales_agents FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['support','executive']));
CREATE POLICY "Support update sales_agents" ON public.sales_agents FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['support','executive']));
CREATE POLICY "Support delete sales_agents" ON public.sales_agents FOR DELETE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['support','executive']));

CREATE TRIGGER trg_sales_agents_updated BEFORE UPDATE ON public.sales_agents
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- PROJECTS
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  project_type text NOT NULL DEFAULT 'customer', -- customer | sponsorship | generic
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  school_id uuid,
  npo_id uuid,
  kam_agent_id uuid,
  status text NOT NULL DEFAULT 'active',
  value numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'ZAR',
  description text NOT NULL DEFAULT '',
  start_date date,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_projects_kam ON public.projects(kam_agent_id);
CREATE INDEX idx_projects_customer ON public.projects(customer_id);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view projects" ON public.projects FOR SELECT TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['service','support','sales_agent','executive']));
CREATE POLICY "Staff insert projects" ON public.projects FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['support','sales_agent','executive']));
CREATE POLICY "Staff update projects" ON public.projects FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['support','sales_agent','executive']));
CREATE POLICY "Staff delete projects" ON public.projects FOR DELETE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['support','executive']));

CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();