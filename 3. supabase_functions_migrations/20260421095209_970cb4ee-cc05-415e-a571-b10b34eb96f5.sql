-- PRODUCTS
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  product_type TEXT NOT NULL DEFAULT 'physical',
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products" ON public.products
FOR SELECT USING (is_active = true);

CREATE POLICY "Staff can view all products" ON public.products
FOR SELECT TO authenticated
USING (has_any_role(auth.uid(), ARRAY['service','support','sales_agent','executive']));

CREATE POLICY "Support+ can manage products" ON public.products
FOR ALL TO authenticated
USING (has_any_role(auth.uid(), ARRAY['support','executive']))
WITH CHECK (has_any_role(auth.uid(), ARRAY['support','executive']));

CREATE TRIGGER products_touch_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ORDERS
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL DEFAULT '',
  product_id UUID,
  product_name TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  payment_method TEXT NOT NULL DEFAULT '',
  payment_reference TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  shipping_name TEXT NOT NULL DEFAULT '',
  shipping_phone TEXT NOT NULL DEFAULT '',
  shipping_address TEXT NOT NULL DEFAULT '',
  courier_name TEXT NOT NULL DEFAULT '',
  tracking_number TEXT NOT NULL DEFAULT '',
  tracking_url TEXT NOT NULL DEFAULT '',
  ticket_id UUID,
  dispatched_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  expected_delivery_at TIMESTAMPTZ,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_tracking_number ON public.orders(tracking_number) WHERE tracking_number <> '';

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON public.orders
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Staff can view all orders" ON public.orders
FOR SELECT TO authenticated
USING (has_any_role(auth.uid(), ARRAY['service','support','sales_agent','executive']));

CREATE POLICY "Users can create own orders" ON public.orders
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Support+ can create orders" ON public.orders
FOR INSERT TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['support','executive']));

CREATE POLICY "Support+ can update orders" ON public.orders
FOR UPDATE TO authenticated
USING (has_any_role(auth.uid(), ARRAY['support','executive']));

CREATE TRIGGER orders_touch_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ORDER STATUS HISTORY
CREATE TABLE public.order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status TEXT NOT NULL DEFAULT '',
  to_status TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  actor_id UUID,
  actor_email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_status_history_order_id ON public.order_status_history(order_id);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view order history" ON public.order_status_history
FOR SELECT TO authenticated
USING (has_any_role(auth.uid(), ARRAY['service','support','sales_agent','executive']));

CREATE POLICY "Users can view own order history" ON public.order_status_history
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

CREATE POLICY "Staff can write order history" ON public.order_status_history
FOR INSERT TO authenticated
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['service','support','sales_agent','executive'])
  AND actor_id = auth.uid()
);

-- COURIER EVENTS
CREATE TABLE public.courier_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  tracking_number TEXT NOT NULL DEFAULT '',
  courier_name TEXT NOT NULL DEFAULT '',
  event_status TEXT NOT NULL DEFAULT '',
  event_description TEXT NOT NULL DEFAULT '',
  event_location TEXT NOT NULL DEFAULT '',
  event_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courier_events_order_id ON public.courier_events(order_id);
CREATE INDEX idx_courier_events_tracking_number ON public.courier_events(tracking_number);

ALTER TABLE public.courier_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view courier events" ON public.courier_events
FOR SELECT TO authenticated
USING (has_any_role(auth.uid(), ARRAY['service','support','sales_agent','executive']));

CREATE POLICY "Users can view own order courier events" ON public.courier_events
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

-- Enable realtime on relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;

-- Seed the UCG Set product
INSERT INTO public.products (sku, name, description, product_type, price, currency)
VALUES (
  'UCG-SET-PRINT',
  'Ultimate Career Guide — Full Printed Set',
  'Complete 13-volume printed Ultimate Career Guide set delivered by courier.',
  'physical',
  3415.00,
  'ZAR'
);