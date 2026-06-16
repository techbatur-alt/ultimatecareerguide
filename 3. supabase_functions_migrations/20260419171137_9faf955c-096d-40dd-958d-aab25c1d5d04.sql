-- ============================================================
-- SUPPORT TICKETS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',  -- open | in_progress | resolved | closed
  priority TEXT NOT NULL DEFAULT 'normal', -- low | normal | high | urgent
  category TEXT NOT NULL DEFAULT 'general', -- general | billing | access | content | technical | account
  raised_by UUID,             -- profile id of the person/account the ticket is about
  raised_by_email TEXT NOT NULL DEFAULT '',
  assigned_to UUID,           -- staff profile id
  resolution_notes TEXT NOT NULL DEFAULT '',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_raised_by ON public.support_tickets(raised_by);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Staff (service+) can view all tickets
CREATE POLICY "Staff can view all tickets" ON public.support_tickets
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['service','support','sales_agent','executive']));

-- Subscribers can view their own tickets
CREATE POLICY "Users can view own tickets" ON public.support_tickets
  FOR SELECT TO authenticated
  USING (raised_by = auth.uid());

-- Staff can create tickets for any user; subscribers can create their own
CREATE POLICY "Staff can create tickets" ON public.support_tickets
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['service','support','sales_agent','executive']));

CREATE POLICY "Users can create own tickets" ON public.support_tickets
  FOR INSERT TO authenticated
  WITH CHECK (raised_by = auth.uid());

-- Only staff can update tickets
CREATE POLICY "Staff can update tickets" ON public.support_tickets
  FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['service','support','sales_agent','executive']));

-- Only Support / Executive can delete
CREATE POLICY "Support+ can delete tickets" ON public.support_tickets
  FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['support','executive']));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER trg_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================
-- AUDIT LOGS (append-only)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,                   -- staff profile id who performed the action
  actor_email TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL DEFAULT '', -- e.g. ticket.created, user.role_changed, password.reset
  resource_type TEXT NOT NULL DEFAULT '', -- e.g. ticket, user, subscription
  resource_id TEXT NOT NULL DEFAULT '',
  target_user_id UUID,             -- the user the action affected, if any
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_user_id ON public.audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Staff (service+) can read audit logs
CREATE POLICY "Staff can view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['service','support','sales_agent','executive']));

-- Staff can insert audit log entries (typically via app code)
CREATE POLICY "Staff can write audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_any_role(auth.uid(), ARRAY['service','support','sales_agent','executive'])
    AND actor_id = auth.uid()
  );

-- No update/delete policies → append-only by RLS