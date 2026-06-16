
CREATE TABLE public.sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  organization text DEFAULT '',
  tier text NOT NULL DEFAULT 'bronze',
  amount_pledged numeric NOT NULL DEFAULT 0,
  amount_paid numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.sponsorship_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid REFERENCES public.sponsors(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT '',
  description text DEFAULT '',
  quantity integer NOT NULL DEFAULT 0,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sponsors" ON public.sponsors FOR SELECT USING (true);
CREATE POLICY "Anyone can view allocations" ON public.sponsorship_allocations FOR SELECT USING (true);

CREATE POLICY "Admins can insert sponsors" ON public.sponsors FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update sponsors" ON public.sponsors FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete sponsors" ON public.sponsors FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can insert allocations" ON public.sponsorship_allocations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update allocations" ON public.sponsorship_allocations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete allocations" ON public.sponsorship_allocations FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
