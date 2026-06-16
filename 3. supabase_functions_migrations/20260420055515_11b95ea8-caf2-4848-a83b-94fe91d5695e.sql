-- Refunds table
CREATE TABLE public.refunds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  user_id UUID,
  amount NUMERIC NOT NULL DEFAULT 0,
  reason TEXT NOT NULL DEFAULT '',
  processor_reference TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'logged',
  logged_by UUID,
  logged_by_email TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view refunds"
ON public.refunds FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['service','support','sales_agent','executive']));

CREATE POLICY "Support+ can insert refunds"
ON public.refunds FOR INSERT
TO authenticated
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['support','executive'])
  AND logged_by = auth.uid()
);

CREATE POLICY "Support+ can update refunds"
ON public.refunds FOR UPDATE
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['support','executive']));

CREATE POLICY "Users can view own refunds"
ON public.refunds FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE TRIGGER refunds_touch_updated_at
BEFORE UPDATE ON public.refunds
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_refunds_subscription_id ON public.refunds(subscription_id);
CREATE INDEX idx_refunds_user_id ON public.refunds(user_id);
CREATE INDEX idx_refunds_created_at ON public.refunds(created_at DESC);

-- Subscriptions: allow staff to view all, support+ to create/update
CREATE POLICY "Staff can view all subscriptions"
ON public.subscriptions FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['service','support','sales_agent','executive']));

CREATE POLICY "Support+ can create subscriptions"
ON public.subscriptions FOR INSERT
TO authenticated
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['support','executive']));

CREATE POLICY "Support+ can update subscriptions"
ON public.subscriptions FOR UPDATE
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['support','executive']));