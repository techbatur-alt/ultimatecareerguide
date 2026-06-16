import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CreditCard, Plus, RefreshCw, Search, Receipt, Loader2, DollarSign, TrendingUp,
  Ban, Undo2, Package,
} from "lucide-react";
import { toast } from "sonner";

// ---------- types ----------
interface Subscription {
  id: string;
  user_id: string;
  order_number: string;
  amount_paid: number;
  payment_method: string | null;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface Refund {
  id: string;
  subscription_id: string | null;
  user_id: string | null;
  amount: number;
  reason: string;
  processor_reference: string;
  status: string;
  logged_by: string | null;
  logged_by_email: string;
  notes: string;
  created_at: string;
}

interface ProfileLite {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

const STATUS_META: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  expired: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  refunded: "bg-amber-500/15 text-amber-700 border-amber-500/30",
};

const REFUND_STATUS_META: Record<string, string> = {
  logged: "bg-secondary text-secondary-foreground",
  processed: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
};

const formatZAR = (v: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(v || 0);

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-ZA") : "—";

const writeAudit = async (
  actorId: string,
  actorEmail: string,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata: Record<string, unknown> = {},
) => {
  await supabase.from("audit_logs").insert([{
    actor_id: actorId,
    actor_email: actorEmail,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    metadata: metadata as never,
  }]);
};

interface OrderRow {
  id: string;
  order_number: string;
  user_id: string;
  user_email: string;
  product_name: string;
  total_amount: number;
  status: string;
  payment_method: string;
  created_at: string;
}

const ORDER_STATUS_META: Record<string, string> = {
  pending: "bg-muted text-muted-foreground border-border",
  paid: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  processing: "bg-primary/15 text-primary border-primary/30",
  dispatched: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  in_transit: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  delivered: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  delayed: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  refunded: "bg-amber-500/15 text-amber-700 border-amber-500/30",
};

const REVENUE_STATUSES = ["paid", "processing", "dispatched", "in_transit", "delivered"];

const BillingManagement = () => {
  const { user, role } = useAuth();
  const callerId = user?.id ?? "";
  const callerEmail = user?.email ?? "";
  const canMutate = role === "support" || role === "executive";

  const [subs, setSubs] = useState<Subscription[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundForSub, setRefundForSub] = useState<Subscription | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Create-order form (replaces Create Subscription)
  const [newEmail, setNewEmail] = useState("");
  const [newSku, setNewSku] = useState<"UCG-SUB-DIGITAL" | "UCG-SET-PRINT" | "UCG-COMBO">("UCG-SUB-DIGITAL");
  const [newAmount, setNewAmount] = useState("500");
  const [newMethod, setNewMethod] = useState("manual");
  const [newOrder, setNewOrder] = useState("");
  const [newDuration, setNewDuration] = useState("12"); // months (sub/combo only)

  // Refund form
  const [refAmount, setRefAmount] = useState("");
  const [refReason, setRefReason] = useState("");
  const [refRef, setRefRef] = useState("");
  const [refNotes, setRefNotes] = useState("");

  // Auto-fill price/duration when SKU changes
  useEffect(() => {
    if (newSku === "UCG-SUB-DIGITAL") { setNewAmount("500"); setNewDuration("12"); }
    else if (newSku === "UCG-SET-PRINT") { setNewAmount("3415"); setNewDuration("0"); }
    else if (newSku === "UCG-COMBO") { setNewAmount("3915"); setNewDuration("12"); }
  }, [newSku]);

  const loadAll = async () => {
    setLoading(true);
    const [
      { data: sData, error: sErr },
      { data: rData, error: rErr },
      { data: oData, error: oErr },
    ] = await Promise.all([
      supabase.from("subscriptions").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("refunds").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("orders").select("id,order_number,user_id,user_email,product_name,total_amount,status,payment_method,created_at")
        .order("created_at", { ascending: false }).limit(500),
    ]);

    if (sErr) toast.error(`Subscriptions: ${sErr.message}`);
    if (rErr) toast.error(`Refunds: ${rErr.message}`);
    if (oErr) toast.error(`Orders: ${oErr.message}`);

    const subRows = (sData ?? []) as Subscription[];
    const refRows = (rData ?? []) as Refund[];
    const orderRows = (oData ?? []) as OrderRow[];
    setSubs(subRows);
    setRefunds(refRows);
    setOrders(orderRows);

    const ids = Array.from(new Set([
      ...subRows.map((s) => s.user_id),
      ...refRows.map((r) => r.user_id).filter(Boolean) as string[],
      ...orderRows.map((o) => o.user_id),
    ]));


    if (ids.length) {
      const { data: pData } = await supabase
        .from("profiles")
        .select("id,email,first_name,last_name")
        .in("id", ids);
      const map: Record<string, ProfileLite> = {};
      (pData ?? []).forEach((p) => { map[p.id] = p as ProfileLite; });
      setProfiles(map);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- stats ----------
  const stats = useMemo(() => {
    const activeSubs = subs.filter((s) => s.status === "active");
    const subRevenue = subs.reduce((sum, s) => sum + Number(s.amount_paid || 0), 0);
    const productRevenue = orders
      .filter((o) => REVENUE_STATUSES.includes(o.status))
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const totalRefunded = refunds.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    return {
      totalSubs: subs.length,
      activeSubs: activeSubs.length,
      subRevenue,
      productRevenue,
      totalOrders: orders.length,
      refunded: totalRefunded,
      net: subRevenue + productRevenue - totalRefunded,
    };
  }, [subs, refunds, orders]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) =>
      o.order_number.toLowerCase().includes(q) ||
      o.user_email.toLowerCase().includes(q) ||
      o.product_name.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q),
    );
  }, [orders, search]);


  // ---------- filters ----------
  const filteredSubs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subs;
    return subs.filter((s) => {
      const p = profiles[s.user_id];
      return (
        s.order_number.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q) ||
        p?.email?.toLowerCase().includes(q) ||
        `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.toLowerCase().includes(q)
      );
    });
  }, [subs, profiles, search]);

  const filteredRefunds = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return refunds;
    return refunds.filter((r) => {
      const p = r.user_id ? profiles[r.user_id] : null;
      return (
        r.reason.toLowerCase().includes(q) ||
        r.processor_reference.toLowerCase().includes(q) ||
        r.logged_by_email.toLowerCase().includes(q) ||
        p?.email?.toLowerCase().includes(q)
      );
    });
  }, [refunds, profiles, search]);

  // ---------- actions ----------
  const handleCreateOrder = async () => {
    if (!canMutate) return;
    if (!newEmail.trim()) return toast.error("Email is required");
    const amt = parseFloat(newAmount);
    if (isNaN(amt) || amt < 0) return toast.error("Amount must be a positive number");

    setSubmitting(true);
    try {
      // Find user by email
      const { data: prof, error: pErr } = await supabase
        .from("profiles")
        .select("id,email,first_name,last_name")
        .ilike("email", newEmail.trim())
        .maybeSingle();

      if (pErr) throw pErr;
      if (!prof) throw new Error("No user found with that email");

      // Look up the product
      const { data: product, error: prodErr } = await supabase
        .from("products")
        .select("id,name,price,currency,product_type")
        .eq("sku", newSku)
        .maybeSingle();
      if (prodErr) throw prodErr;
      if (!product) throw new Error("Product not found");

      const orderNum = newOrder.trim() || `MAN-${Date.now().toString(36).toUpperCase()}`;
      const isSub = product.product_type === "subscription" || product.product_type === "digital";
      const isCombo = product.product_type === "combo";
      const isPhysical = product.product_type === "physical";

      // Create the order row
      const { data: order, error: oErr } = await supabase
        .from("orders")
        .insert({
          user_id: prof.id,
          user_email: prof.email,
          order_number: orderNum,
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          unit_price: amt,
          total_amount: amt,
          currency: product.currency ?? "ZAR",
          status: "paid",
          payment_method: newMethod,
          payment_reference: `MANUAL-${Date.now().toString(36).toUpperCase()}`,
          notes: `Manually created via Billing Management for ${prof.email}.`,
          ...(isSub ? {
            dispatched_at: new Date().toISOString(),
            delivered_at: new Date().toISOString(),
            courier_name: "Digital",
            tracking_number: "N/A",
          } : {}),
        })
        .select()
        .single();
      if (oErr) throw oErr;

      // Subscription if applicable
      if (isSub || isCombo) {
        const months = Math.max(1, parseInt(newDuration, 10) || 12);
        const start = new Date();
        const end = new Date(start);
        end.setMonth(end.getMonth() + months);
        const subAmount = isCombo ? 500 : amt;
        await supabase.from("subscriptions").insert({
          user_id: prof.id,
          order_number: orderNum,
          amount_paid: subAmount,
          payment_method: newMethod,
          status: "active",
          start_date: start.toISOString(),
          end_date: end.toISOString(),
        });
      }

      // Procurement ticket if physical/combo
      if (isPhysical || isCombo) {
        const { data: t } = await supabase.from("support_tickets").insert({
          raised_by: prof.id,
          raised_by_email: prof.email,
          category: "procurement",
          priority: "medium",
          status: "open",
          subject: `Procurement: ${product.name} (${orderNum})`,
          description: `Manually created order — please dispatch printed set to ${prof.email}.`,
        }).select("id").single();
        if (t?.id) {
          await supabase.from("orders").update({ ticket_id: t.id }).eq("id", order.id);
        }
      }

      await writeAudit(callerId, callerEmail, "order.create_manual", "order", order.id, {
        target_email: prof.email,
        sku: newSku,
        amount: amt,
        order_number: orderNum,
      });

      toast.success(`Order created for ${prof.email}`);
      setCreateOpen(false);
      setNewEmail(""); setNewMethod("manual"); setNewOrder("");
      await loadAll();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create order";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSub = async (sub: Subscription) => {
    if (!canMutate) return;
    if (!confirm(`Cancel subscription ${sub.order_number}? The user will lose access at end-date.`)) return;
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("id", sub.id);
    if (error) return toast.error(error.message);
    await writeAudit(callerId, callerEmail, "subscription.cancel", "subscription", sub.id, {
      order_number: sub.order_number,
    });
    toast.success("Subscription cancelled");
    loadAll();
  };

  const openRefundDialog = (sub: Subscription) => {
    setRefundForSub(sub);
    setRefAmount(String(sub.amount_paid));
    setRefReason("");
    setRefRef("");
    setRefNotes("");
    setRefundOpen(true);
  };

  const handleLogRefund = async () => {
    if (!canMutate || !refundForSub) return;
    const amt = parseFloat(refAmount);
    if (isNaN(amt) || amt <= 0) return toast.error("Amount must be > 0");
    if (!refReason.trim()) return toast.error("Reason is required");

    setSubmitting(true);
    try {
      const { data: refund, error: rErr } = await supabase
        .from("refunds")
        .insert({
          subscription_id: refundForSub.id,
          user_id: refundForSub.user_id,
          amount: amt,
          reason: refReason.trim(),
          processor_reference: refRef.trim(),
          notes: refNotes.trim(),
          status: "logged",
          logged_by: callerId,
          logged_by_email: callerEmail,
        })
        .select()
        .single();

      if (rErr) throw rErr;

      // Mark sub as refunded if full refund
      if (amt >= Number(refundForSub.amount_paid)) {
        await supabase
          .from("subscriptions")
          .update({ status: "refunded" })
          .eq("id", refundForSub.id);
      }

      await writeAudit(callerId, callerEmail, "refund.log", "refund", refund.id, {
        subscription_id: refundForSub.id,
        order_number: refundForSub.order_number,
        amount: amt,
        reason: refReason.trim(),
      });

      toast.success("Refund logged");
      setRefundOpen(false);
      setRefundForSub(null);
      loadAll();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to log refund";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const userLabel = (id: string | null) => {
    if (!id) return "—";
    const p = profiles[id];
    if (!p) return id.slice(0, 8) + "…";
    const name = `${p.first_name} ${p.last_name}`.trim();
    return name ? `${name} · ${p.email}` : p.email;
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-black">
            <span className="text-primary">Billing</span> Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage subscriptions, log refunds, and track revenue.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAll} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {canMutate && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Order
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Manual Order</DialogTitle>
                  <DialogDescription>
                    For donated, sponsored, or off-platform payments. The user must already have an account.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">User email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">Product</Label>
                    <Select value={newSku} onValueChange={(v) => setNewSku(v as typeof newSku)}>
                      <SelectTrigger id="sku"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UCG-SUB-DIGITAL">Digital Subscription (R500/yr)</SelectItem>
                        <SelectItem value="UCG-SET-PRINT">Printed UCG Set (R3,415)</SelectItem>
                        <SelectItem value="UCG-COMBO">Combo: Set + Subscription (R3,915)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {newSku === "UCG-SUB-DIGITAL" && "Creates an order + active 1-year subscription."}
                      {newSku === "UCG-SET-PRINT" && "Creates an order + procurement ticket for dispatch."}
                      {newSku === "UCG-COMBO" && "Creates an order + 1-year subscription + procurement ticket."}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="amt">Amount paid (ZAR)</Label>
                      <Input
                        id="amt"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                      />
                    </div>
                    {newSku !== "UCG-SET-PRINT" && (
                      <div className="space-y-2">
                        <Label htmlFor="dur">Subscription (months)</Label>
                        <Input
                          id="dur"
                          type="number"
                          min="1"
                          value={newDuration}
                          onChange={(e) => setNewDuration(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="method">Payment method</Label>
                      <Select value={newMethod} onValueChange={setNewMethod}>
                        <SelectTrigger id="method"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="eft">EFT</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="sponsored">Sponsored</SelectItem>
                          <SelectItem value="donated">Donated</SelectItem>
                          <SelectItem value="comp">Complimentary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ord">Order # (optional)</Label>
                      <Input
                        id="ord"
                        value={newOrder}
                        onChange={(e) => setNewOrder(e.target.value)}
                        placeholder="Auto if blank"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateOrder} disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Order
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats — revenue split by stream */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Product revenue (UCG Sets)" value={formatZAR(stats.productRevenue)} accent />
        <StatCard icon={CreditCard} label="Subscription revenue" value={formatZAR(stats.subRevenue)} accent />
        <StatCard icon={DollarSign} label="Net revenue" value={formatZAR(stats.net)} />
        <StatCard icon={Undo2} label="Refunded" value={formatZAR(stats.refunded)} muted />
      </div>


      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by email, name, order #, reason…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">
            <Package className="h-4 w-4 mr-2" />
            Product Sales ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="subs">
            <CreditCard className="h-4 w-4 mr-2" />
            Subscriptions ({subs.length})
          </TabsTrigger>
          <TabsTrigger value="refunds">
            <Receipt className="h-4 w-4 mr-2" />
            Refunds ({refunds.length})
          </TabsTrigger>
        </TabsList>

        {/* Product Sales */}
        <TabsContent value="products" className="space-y-3">
          <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline mr-2" />Loading…</TableCell></TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No product orders yet. When customers buy UCG Sets, they'll appear here.</TableCell></TableRow>
                ) : (
                  filteredOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">{o.order_number}</TableCell>
                      <TableCell className="text-sm">{o.user_email || userLabel(o.user_id)}</TableCell>
                      <TableCell className="text-sm">{o.product_name}</TableCell>
                      <TableCell className="font-medium">{formatZAR(Number(o.total_amount))}</TableCell>
                      <TableCell className="text-sm capitalize">{o.payment_method || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={ORDER_STATUS_META[o.status] ?? ""}>
                          {o.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(o.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground">Manage dispatching and tracking from the <a href="/admin/orders" className="underline">Orders page</a>.</p>
        </TabsContent>


        {/* Subscriptions */}
        <TabsContent value="subs" className="space-y-3">
          <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Period</TableHead>
                  {canMutate && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={canMutate ? 7 : 6} className="text-center py-8 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : filteredSubs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canMutate ? 7 : 6} className="text-center py-8 text-muted-foreground">
                      No subscriptions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubs.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-sm">{userLabel(s.user_id)}</TableCell>
                      <TableCell className="font-mono text-xs">{s.order_number}</TableCell>
                      <TableCell className="font-medium">{formatZAR(Number(s.amount_paid))}</TableCell>
                      <TableCell className="text-sm capitalize">{s.payment_method || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_META[s.status] ?? ""}>
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(s.start_date)} → {formatDate(s.end_date)}
                      </TableCell>
                      {canMutate && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {s.status !== "refunded" && (
                              <Button size="sm" variant="ghost" onClick={() => openRefundDialog(s)}>
                                <Undo2 className="h-3.5 w-3.5 mr-1" />
                                Refund
                              </Button>
                            )}
                            {s.status === "active" && (
                              <Button size="sm" variant="ghost" onClick={() => handleCancelSub(s)}>
                                <Ban className="h-3.5 w-3.5 mr-1" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Refunds */}
        <TabsContent value="refunds" className="space-y-3">
          <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Logged by</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : filteredRefunds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No refunds logged.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRefunds.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(r.created_at)}
                      </TableCell>
                      <TableCell className="text-sm">{userLabel(r.user_id)}</TableCell>
                      <TableCell className="font-medium">{formatZAR(Number(r.amount))}</TableCell>
                      <TableCell className="text-sm max-w-xs truncate" title={r.reason}>
                        {r.reason || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{r.processor_reference || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={REFUND_STATUS_META[r.status] ?? ""}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.logged_by_email || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Refund dialog */}
      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log refund</DialogTitle>
            <DialogDescription>
              {refundForSub && (
                <>
                  For order <span className="font-mono">{refundForSub.order_number}</span> ·{" "}
                  {userLabel(refundForSub.user_id)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="refAmt">Amount (ZAR)</Label>
              <Input
                id="refAmt"
                type="number"
                min="0"
                step="0.01"
                value={refAmount}
                onChange={(e) => setRefAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Full refund will mark the subscription as refunded.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="refReason">Reason</Label>
              <Input
                id="refReason"
                value={refReason}
                onChange={(e) => setRefReason(e.target.value)}
                placeholder="e.g. Customer request, duplicate charge"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refRef">Processor reference (optional)</Label>
              <Input
                id="refRef"
                value={refRef}
                onChange={(e) => setRefRef(e.target.value)}
                placeholder="Yoco / bank reference"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refNotes">Internal notes (optional)</Label>
              <Textarea
                id="refNotes"
                value={refNotes}
                onChange={(e) => setRefNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleLogRefund} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Log refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface StatCardProps {
  icon: typeof CreditCard;
  label: string;
  value: string;
  accent?: boolean;
  muted?: boolean;
}
const StatCard = ({ icon: Icon, label, value, accent, muted }: StatCardProps) => (
  <div className={`rounded-lg border p-4 ${accent ? "bg-primary/5 border-primary/20" : muted ? "bg-muted/30" : "bg-card"}`}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <Icon className={`h-4 w-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
    </div>
    <div className={`text-2xl font-bold ${accent ? "text-primary" : ""}`}>{value}</div>
  </div>
);

export default BillingManagement;
