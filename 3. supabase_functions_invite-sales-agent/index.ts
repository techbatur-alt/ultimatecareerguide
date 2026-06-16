// Invite a sales agent by email. Admin (support/executive) only.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: uErr } = await userClient.auth.getUser();
    if (uErr || !user) return json({ error: "Unauthorized" }, 401);

    const { data: profile } = await userClient
      .from("profiles").select("role").eq("id", user.id).single();
    if (!profile || !["support", "executive"].includes(profile.role)) {
      return json({ error: "Forbidden" }, 403);
    }

    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const first_name = String(body.first_name || "").trim();
    const last_name = String(body.last_name || "").trim();
    const commission_rate = Number(body.commission_rate || 0);
    if (!email) return json({ error: "email required" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE);
    const origin = req.headers.get("origin") || "";
    const redirectTo = `${origin}/create-password?role=sales_agent`;

    const { data: inv, error: invErr } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { first_name, last_name, role: "sales_agent" },
    });
    if (invErr || !inv.user) return json({ error: invErr?.message || "Invite failed" }, 400);

    // Ensure profile role = sales_agent (handle_new_user trigger created it)
    await admin.from("profiles").update({ role: "sales_agent", first_name, last_name })
      .eq("id", inv.user.id);

    const { error: agErr } = await admin.from("sales_agents").insert({
      user_id: inv.user.id,
      commission_rate,
      status: "invited",
      invited_email: email,
      invited_at: new Date().toISOString(),
    });
    if (agErr) return json({ error: agErr.message }, 400);

    return json({ ok: true, user_id: inv.user.id });
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
