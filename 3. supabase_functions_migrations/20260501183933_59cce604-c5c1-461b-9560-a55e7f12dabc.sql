-- DBE geography (seeded with the 9 provinces; districts user-managed)
CREATE TABLE public.provinces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.districts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  province_id uuid NOT NULL REFERENCES public.provinces(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (province_id, name)
);

-- PBO (top of chain)
CREATE TABLE public.pbos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  registration_number text NOT NULL DEFAULT '',
  contact_name text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- NPO (reports to PBO)
CREATE TABLE public.npos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pbo_id uuid REFERENCES public.pbos(id) ON DELETE SET NULL,
  name text NOT NULL,
  registration_number text NOT NULL DEFAULT '',
  contact_name text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Schools (belong to a District; can also be linked to one NPO)
CREATE TABLE public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  province_id uuid REFERENCES public.provinces(id) ON DELETE SET NULL,
  district_id uuid REFERENCES public.districts(id) ON DELETE SET NULL,
  npo_id uuid REFERENCES public.npos(id) ON DELETE SET NULL,
  name text NOT NULL,
  emis_number text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  contact_name text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  learner_count integer NOT NULL DEFAULT 0,
  notes text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_schools_province ON public.schools(province_id);
CREATE INDEX idx_schools_district ON public.schools(district_id);
CREATE INDEX idx_schools_npo ON public.schools(npo_id);

-- Trainers (one NPO; many schools via join)
CREATE TABLE public.trainers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  npo_id uuid REFERENCES public.npos(id) ON DELETE SET NULL,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  qualifications text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.trainer_schools (
  trainer_id uuid NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (trainer_id, school_id)
);

-- Sponsor → School (sponsor-level link)
CREATE TABLE public.sponsor_schools (
  sponsor_id uuid NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (sponsor_id, school_id)
);

-- Allocation → School (allocation-level link)
CREATE TABLE public.allocation_schools (
  allocation_id uuid NOT NULL REFERENCES public.sponsorship_allocations(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  units integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (allocation_id, school_id)
);

-- Triggers for updated_at
CREATE TRIGGER trg_pbos_updated BEFORE UPDATE ON public.pbos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_npos_updated BEFORE UPDATE ON public.npos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_schools_updated BEFORE UPDATE ON public.schools FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_trainers_updated BEFORE UPDATE ON public.trainers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Enable RLS
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pbos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.npos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocation_schools ENABLE ROW LEVEL SECURITY;

-- Public read for reference/geography & stakeholder data (used by tracker)
CREATE POLICY "Anyone can view provinces" ON public.provinces FOR SELECT USING (true);
CREATE POLICY "Anyone can view districts" ON public.districts FOR SELECT USING (true);
CREATE POLICY "Anyone can view pbos" ON public.pbos FOR SELECT USING (true);
CREATE POLICY "Anyone can view npos" ON public.npos FOR SELECT USING (true);
CREATE POLICY "Anyone can view schools" ON public.schools FOR SELECT USING (true);
CREATE POLICY "Anyone can view trainers" ON public.trainers FOR SELECT USING (true);
CREATE POLICY "Anyone can view trainer_schools" ON public.trainer_schools FOR SELECT USING (true);
CREATE POLICY "Anyone can view sponsor_schools" ON public.sponsor_schools FOR SELECT USING (true);
CREATE POLICY "Anyone can view allocation_schools" ON public.allocation_schools FOR SELECT USING (true);

-- Staff write policies (support, sales_agent, executive)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['provinces','districts','pbos','npos','schools','trainers','trainer_schools','sponsor_schools','allocation_schools']
  LOOP
    EXECUTE format($f$
      CREATE POLICY "Staff can insert %1$s" ON public.%1$I FOR INSERT TO authenticated
      WITH CHECK (has_any_role(auth.uid(), ARRAY['support','sales_agent','executive']));
      CREATE POLICY "Staff can update %1$s" ON public.%1$I FOR UPDATE TO authenticated
      USING (has_any_role(auth.uid(), ARRAY['support','sales_agent','executive']));
      CREATE POLICY "Staff can delete %1$s" ON public.%1$I FOR DELETE TO authenticated
      USING (has_any_role(auth.uid(), ARRAY['support','sales_agent','executive']));
    $f$, t);
  END LOOP;
END $$;

-- Seed 9 provinces
INSERT INTO public.provinces (name, code) VALUES
  ('Eastern Cape','EC'),
  ('Free State','FS'),
  ('Gauteng','GP'),
  ('KwaZulu-Natal','KZN'),
  ('Limpopo','LP'),
  ('Mpumalanga','MP'),
  ('Northern Cape','NC'),
  ('North West','NW'),
  ('Western Cape','WC');