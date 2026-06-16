
-- Trigger function: auto-create ticket for new orders
CREATE OR REPLACE FUNCTION public.auto_create_order_ticket()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_type text;
  v_category text;
  v_subject text;
  v_description text;
  v_ticket_id uuid;
BEGIN
  -- Skip if order already has a ticket linked
  IF NEW.ticket_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Resolve product type
  SELECT product_type INTO v_product_type FROM public.products WHERE id = NEW.product_id;
  v_product_type := COALESCE(v_product_type, 'physical');

  IF v_product_type IN ('subscription', 'digital') THEN
    v_category := 'service';
    v_subject := 'Digital activation: ' || NEW.product_name || ' (' || NEW.order_number || ')';
    v_description :=
      'Auto-generated from order.' || E'\n\n' ||
      'Order: ' || NEW.order_number || E'\n' ||
      'Product: ' || NEW.product_name || ' x' || NEW.quantity || E'\n' ||
      'Total: ' || NEW.currency || ' ' || NEW.total_amount::text || E'\n' ||
      'Customer: ' || COALESCE(NEW.user_email, '') || E'\n\n' ||
      'Action: confirm digital access has been granted and subscription is active.';
  ELSE
    v_category := 'procurement';
    v_subject := 'Procurement: ' || NEW.product_name || ' (' || NEW.order_number || ')';
    v_description :=
      'Auto-generated from order.' || E'\n\n' ||
      'Order: ' || NEW.order_number || E'\n' ||
      'Product: ' || NEW.product_name || ' x' || NEW.quantity || E'\n' ||
      'Total: ' || NEW.currency || ' ' || NEW.total_amount::text || E'\n' ||
      CASE WHEN v_product_type = 'combo'
           THEN 'Combo: digital sub already activated; printed set requires dispatch.' || E'\n'
           ELSE '' END ||
      'Customer: ' || COALESCE(NEW.shipping_name, NEW.user_email, '') || E'\n' ||
      'Phone: ' || COALESCE(NEW.shipping_phone, '') || E'\n' ||
      'Ship to: ' || COALESCE(NEW.shipping_address, '') || E'\n\n' ||
      'Action: Logistics to pack & dispatch, then update tracking in Orders.';
  END IF;

  INSERT INTO public.support_tickets (raised_by, raised_by_email, category, priority, status, subject, description)
  VALUES (NEW.user_id, COALESCE(NEW.user_email, ''), v_category, 'normal', 'open', v_subject, v_description)
  RETURNING id INTO v_ticket_id;

  UPDATE public.orders SET ticket_id = v_ticket_id WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_auto_ticket ON public.orders;
CREATE TRIGGER trg_orders_auto_ticket
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_order_ticket();

-- Backfill: create tickets for any existing orders without one
DO $$
DECLARE
  r RECORD;
  v_product_type text;
  v_category text;
  v_subject text;
  v_description text;
  v_ticket_id uuid;
BEGIN
  FOR r IN SELECT * FROM public.orders WHERE ticket_id IS NULL LOOP
    SELECT product_type INTO v_product_type FROM public.products WHERE id = r.product_id;
    v_product_type := COALESCE(v_product_type, 'physical');

    IF v_product_type IN ('subscription', 'digital') THEN
      v_category := 'service';
      v_subject := 'Digital activation: ' || r.product_name || ' (' || r.order_number || ')';
      v_description := 'Backfilled ticket for historic order ' || r.order_number ||
        '. Product: ' || r.product_name || '. Customer: ' || COALESCE(r.user_email, '') ||
        '. Action: confirm digital access.';
    ELSE
      v_category := 'procurement';
      v_subject := 'Procurement: ' || r.product_name || ' (' || r.order_number || ')';
      v_description := 'Backfilled ticket for historic order ' || r.order_number ||
        '. Product: ' || r.product_name || '. Customer: ' || COALESCE(r.user_email, '') ||
        '. Action: verify dispatch status.';
    END IF;

    INSERT INTO public.support_tickets (raised_by, raised_by_email, category, priority, status, subject, description)
    VALUES (r.user_id, COALESCE(r.user_email, ''), v_category, 'normal', 'open', v_subject, v_description)
    RETURNING id INTO v_ticket_id;

    UPDATE public.orders SET ticket_id = v_ticket_id WHERE id = r.id;
  END LOOP;
END;
$$;
