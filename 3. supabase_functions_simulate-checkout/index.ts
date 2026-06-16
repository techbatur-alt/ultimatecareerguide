// Simulated checkout edge function — pretends a payment succeeded and runs the
// full internal pipeline so the admin portal can be exercised end-to-end.
//
// Three flows, distinguished by the resolved product's `product_type`:
//
// PHYSICAL  (UCG-SET-PRINT)        : order + procurement ticket
// SUBSCRIPTION (UCG-SUB-DIGITAL)   : order + 1-year subscription
// COMBO     (UCG-COMBO)            : order + procurement ticket + 1-year subscription

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type PurchaseKind = "physical" | "subscription" | "combo";

interface SimulateBody {
  payment_method?: "card" | "eft" | string;
  shipping_name?: string;
  shipping_phone?: string;
  shipping_address?: string;
  product_sku?: string;
  quantity?: number;
  purchase_kind?: PurchaseKind;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  // --- AUTH ---------------------------------------------------------------
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return json({ error: "Missing Authorization header" }, 401);
  }
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json({ error: "Invalid token" }, 401);
  const user = userData.user;

  let body: SimulateBody = {};
  try { body = (await req.json()) as SimulateBody; } catch { /* ignore */ }

  const payment_method = body.payment_method ?? "card";
  const product_sku = body.product_sku ?? "UCG-SET-PRINT";
  const quantity = Math.max(1, Math.min(10, body.quantity ?? 1));

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data: profile } = await admin
    .from("profiles")
    .select("first_name,last_name,email,mobile_1,home_address")
    .eq("id", user.id)
    .maybeSingle();

  const userEmail = profile?.email ?? user.email ?? "unknown@ibatur.co.za";
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || userEmail;

  const { data: product, error: productErr } = await admin
    .from("products")
    .select("id,name,price,currency,sku,product_type")
    .eq("sku", product_sku)
    .eq("is_active", true)
    .maybeSingle();

  if (productErr || !product) {
    return json({ error: `Product ${product_sku} not found or inactive` }, 404);
  }

  // Resolve purchase kind from product_type (combo is a real type now).
  const resolvedKind: PurchaseKind =
    body.purchase_kind ??
    (product.product_type === "combo"
      ? "combo"
      : product.product_type === "subscription" || product.product_type === "digital"
        ? "subscription"
        : "physical");

  const isSubscription = resolvedKind === "subscription";
  const isCombo = resolvedKind === "combo";
  const needsShipping = resolvedKind === "physical" || isCombo;
  const grantsSubscription = isSubscription || isCombo;

  const effectiveQty = isSubscription ? 1 : quantity;
  const unit_price = Number(product.price);
  const total_amount = unit_price * effectiveQty;

  const shipping_name = needsShipping ? (body.shipping_name ?? fullName) : "";
  const shipping_phone = needsShipping ? (body.shipping_phone ?? profile?.mobile_1 ?? "") : "";
  const shipping_address = needsShipping ? (body.shipping_address ?? profile?.home_address ?? "") : "";

  const order_number = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
  const payment_reference = `SIM-${crypto.randomUUID().split("-")[0].toUpperCase()}`;

  const orderInsert: Record<string, unknown> = {
    user_id: user.id,
    user_email: userEmail,
    order_number,
    product_id: product.id,
    product_name: product.name,
    quantity: effectiveQty,
    unit_price,
    total_amount,
    currency: product.currency ?? "ZAR",
    status: "paid",
    payment_method,
    payment_reference,
    shipping_name,
    shipping_phone,
    shipping_address,
    notes: isSubscription
      ? "Simulated checkout — digital subscription. No physical fulfilment required."
      : isCombo
        ? "Simulated checkout — combo: digital subscription activated immediately, printed set awaiting dispatch."
        : "Simulated checkout — printed set awaiting dispatch.",
  };

  // For pure-digital, mark dispatched/delivered immediately.
  if (isSubscription) {
    const now = new Date().toISOString();
    orderInsert.dispatched_at = now;
    orderInsert.delivered_at = now;
    orderInsert.courier_name = "Digital";
    orderInsert.tracking_number = "N/A";
  }

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert(orderInsert)
    .select()
    .single();

  if (orderErr || !order) {
    return json({ error: "Failed to create order", detail: orderErr?.message }, 500);
  }

  let ticket: { id: string; subject: string; category: string } | null = null;
  let subscription: {
    id: string;
    order_number: string;
    end_date: string;
    status: string;
    amount_paid: number;
  } | null = null;
  let subErrMsg: string | null = null;

  if (grantsSubscription) {
    const start = new Date();
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);

    // Combo splits the price: notional R500 to subscription, remainder to printed set.
    const subAmount = isCombo ? 500 : total_amount;

    const { data: sub, error: sErr } = await admin
      .from("subscriptions")
      .insert({
        user_id: user.id,
        order_number,
        payment_method,
        status: "active",
        amount_paid: subAmount,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      })
      .select("id, order_number, end_date, status, amount_paid")
      .single();

    if (sErr || !sub) {
      subErrMsg = sErr?.message ?? "unknown error";
    } else {
      subscription = {
        id: sub.id,
        order_number: sub.order_number,
        end_date: sub.end_date,
        status: sub.status,
        amount_paid: Number(sub.amount_paid),
      };
    }
  }

  // Ticket is auto-created by the orders trigger (auto_create_order_ticket).
  // Re-fetch the order to surface the linked ticket in the response.
  {
    const { data: refreshed } = await admin
      .from("orders")
      .select("ticket_id")
      .eq("id", order.id)
      .maybeSingle();
    if (refreshed?.ticket_id) {
      const { data: t } = await admin
        .from("support_tickets")
        .select("id, subject, category")
        .eq("id", refreshed.ticket_id)
        .maybeSingle();
      if (t) ticket = { id: t.id, subject: t.subject, category: t.category };
    }
  }

  await admin.from("order_status_history").insert({
    order_id: order.id,
    from_status: "pending",
    to_status: "paid",
    note: `Simulated ${resolvedKind} payment via ${payment_method}. Reference ${payment_reference}.`,
    actor_id: user.id,
    actor_email: userEmail,
  });

  const pipeline: string[] = [
    "✓ Auth verified",
    `✓ Product loaded (${product.product_type})`,
    "✓ Order created (status=paid)",
  ];
  if (grantsSubscription) {
    pipeline.push(subscription ? "✓ Subscription activated (1 year)" : `✗ Subscription failed: ${subErrMsg}`);
  }
  if (true) {
    pipeline.push(ticket ? "✓ Service/procurement ticket auto-created" : "… Ticket creation pending (trigger)");
  }
  if (isSubscription) {
    pipeline.push("✓ Order marked delivered (digital fulfilment)");
  }
  pipeline.push("✓ Status history written");
  pipeline.push("→ Realtime channels notified (admin dashboard, orders/billing pages)");

  return json({
    ok: true,
    simulated: true,
    kind: resolvedKind,
    order: {
      id: order.id,
      order_number,
      total_amount,
      currency: product.currency ?? "ZAR",
      status: "paid",
      payment_method,
      payment_reference,
      product_name: product.name,
      product_type: product.product_type,
    },
    ticket,
    subscription: subscription ?? (subErrMsg ? { error: subErrMsg } : null),
    pipeline,
  });
});
