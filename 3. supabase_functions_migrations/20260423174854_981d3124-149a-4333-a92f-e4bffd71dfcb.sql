ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS agent_notes text NOT NULL DEFAULT '';

ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS agent_notes text NOT NULL DEFAULT '';