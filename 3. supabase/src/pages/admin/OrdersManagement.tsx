import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Search, Truck, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import BackHomeBar from "@/components/BackHomeBar";
import AgentNotesBox from "@/components/admin/AgentNotesBox";
import { ORDER_STATUSES, orderStatusBadgeClass } from "@/lib/orderStatus";

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  user_email: string;
  product_name: string;
  total_amount: number;
  status: string;
  payment_method: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  courier_name: string;
  tracking_number: string;
  tracking_url: string;
  ticket_id: string | null;
  created_at: string;
  dispatched_at: string | null;
  delivered_at: string | null;
  agent_notes: string;
}

const formatZAR = (v: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(v || 0);

const OrdersManagement = () => {
  const { user, role } = useAuth();
  const canMutate = role === "support" || role === "executive";
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [newStatus, setNewStatus] = useState("dispatched");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) toast.error(error.message);
    setOrders((data ?? []) as Order[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("orders-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) =>
      o.order_number.toLowerCase().includes(q) ||
      o.user_email.toLowerCase().includes(q) ||
      o.tracking_number.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q),
    );
  }, [orders, search]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => ["pending", "paid", "processing"].includes(o.status)).length,
    inTransit: orders.filter((o) => ["dispatched", "in_transit"].includes(o.status)).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  }), [orders]);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const openTracking = (o: Order) => {
    setActiveOrder(o);
    setCourierName(o.courier_name || "");
    setTrackingNumber(o.tracking_number || "");
    setTrackingUrl(o.tracking_url || "");
    setNewStatus(o.status === "paid" || o.status === "processing" ? "dispatched" : o.status);
    setTrackingOpen(true);
  };

  const saveTracking = async () => {
    if (!canMutate || !activeOrder || !user) return;
    if (!courierName.trim() || !trackingNumber.trim()) {
      return toast.error("Courier name and tracking number required");
    }
    setSubmitting(true);
    try {
      const patch: Record<string, unknown> = {
        courier_name: courierName.trim(),
        tracking_number: trackingNumber.trim(),
        tracking_url: trackingUrl.trim(),
        status: newStatus,
      };
      if (newStatus === "dispatched" && !activeOrder.dispatched_at) {
        patch.dispatched_at = new Date().toISOString();
      }
      if (newStatus === "delivered" && !activeOrder.delivered_at) {
        patch.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase.from("orders").update(patch).eq("id", activeOrder.id);
      if (error) throw error;

      await supabase.from("order_status_history").insert({
        order_id: activeOrder.id,
        from_status: activeOrder.status,
        to_status: newStatus,
        note: `Tracking: ${courierName.trim()} ${trackingNumber.trim()}`,
        actor_id: user.id,
        actor_email: user.email ?? "",
      });

      await supabase.from("audit_logs").insert({
        actor_id: user.id,
        actor_email: user.email ?? "",
        action: "order.update_tracking",
        resource_type: "order",
        resource_id: activeOrder.id,
        metadata: { order_number: activeOrder.order_number, courier: courierName.trim(), tracking_number: trackingNumber.trim(), new_status: newStatus } as never,
      });

      toast.success(`Order ${activeOrder.order_number} updated`);
      setTrackingOpen(false);
      setActiveOrder(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const quickStatusChange = async (o: Order, status: string) => {
    if (!canMutate || !user || status === o.status) return;
    const patch: Record<string, unknown> = { status };
    if (status === "dispatched" && !o.dispatched_at) patch.dispatched_at = new Date().toISOString();
    if (status === "delivered" && !o.delivered_at) patch.delivered_at = new Date().toISOString();

    const { error } = await supabase.from("orders").update(patch).eq("id", o.id);
    if (error) return toast.error(error.message);
    await supabase.from("order_status_history").insert({
      order_id: o.id,
      from_status: o.status,
      to_status: status,
      note: "Status changed inline from Orders page",
      actor_id: user.id,
      actor_email: user.email ?? "",
    });
    toast.success(`Order ${o.order_number} → ${status.replace("_", " ")}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <BackHomeBar />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-black">
            <span className="text-primary">Orders</span> Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Fulfilment & courier tracking only. For customer issues, escalations, refunds use the{" "}
            <a href="/admin/service" className="underline">Service Centre</a>.
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardDescription>Total orders</CardDescription><CardTitle className="text-3xl">{stats.total}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Awaiting dispatch</CardDescription><CardTitle className="text-3xl">{stats.pending}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>In transit</CardDescription><CardTitle className="text-3xl">{stats.inTransit}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Delivered</CardDescription><CardTitle className="text-3xl">{stats.delivered}</CardTitle></CardHeader></Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search order #, email, tracking #…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Courier / Tracking</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline mr-2" />Loading…</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">No orders yet.</TableCell></TableRow>
              ) : (
                filtered.map((o) => (
                  <>
                    <TableRow key={o.id}>
                      <TableCell>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toggleExpand(o.id)} aria-label="Expand">
                          {expanded[o.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{o.order_number}</TableCell>
                      <TableCell className="text-sm">
                        <div>{o.shipping_name || o.user_email}</div>
                        <div className="text-xs text-muted-foreground">{o.user_email}</div>
                      </TableCell>
                      <TableCell className="text-sm">{o.product_name}</TableCell>
                      <TableCell className="font-medium">{formatZAR(Number(o.total_amount))}</TableCell>
                      <TableCell>
                        {canMutate ? (
                          <Select value={o.status} onValueChange={(v) => quickStatusChange(o, v)}>
                            <SelectTrigger className={`h-7 w-[130px] text-xs border ${orderStatusBadgeClass(o.status)}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.map((s) => (
                                <SelectItem key={s} value={s} className="text-xs">
                                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] border ${orderStatusBadgeClass(s)}`}>
                                    {s.replace("_", " ")}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline" className={orderStatusBadgeClass(o.status)}>
                            {o.status.replace("_", " ")}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {o.tracking_number ? (
                          <>
                            <div>{o.courier_name}</div>
                            <div className="font-mono text-muted-foreground">{o.tracking_number}</div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {canMutate && (
                          <Button size="sm" variant="ghost" onClick={() => openTracking(o)}>
                            <Truck className="h-3.5 w-3.5 mr-1" />
                            Tracking
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    {expanded[o.id] && (
                      <TableRow key={`${o.id}-notes`} className="bg-muted/30 hover:bg-muted/30">
                        <TableCell colSpan={8} className="py-3">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="text-xs space-y-1">
                              <div><span className="text-muted-foreground">Ship to:</span> {o.shipping_address || "—"}</div>
                              <div><span className="text-muted-foreground">Phone:</span> {o.shipping_phone || "—"}</div>
                              <div><span className="text-muted-foreground">Created:</span> {new Date(o.created_at).toLocaleString()}</div>
                              {o.dispatched_at && <div><span className="text-muted-foreground">Dispatched:</span> {new Date(o.dispatched_at).toLocaleString()}</div>}
                              {o.delivered_at && <div><span className="text-muted-foreground">Delivered:</span> {new Date(o.delivered_at).toLocaleString()}</div>}
                              {o.ticket_id && (
                                <div>
                                  <span className="text-muted-foreground">Procurement ticket:</span>{" "}
                                  <a href="/admin/service" className="font-mono text-primary underline">{o.ticket_id.slice(0, 8)}…</a>
                                </div>
                              )}
                            </div>
                            {canMutate && (
                              <AgentNotesBox
                                table="orders"
                                rowId={o.id}
                                initialValue={o.agent_notes ?? ""}
                                label="Logistics notes (auto-saved)"
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={trackingOpen} onOpenChange={setTrackingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update tracking & status</DialogTitle>
            <DialogDescription>
              {activeOrder && <>Order <span className="font-mono">{activeOrder.order_number}</span> · {activeOrder.user_email}</>}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="courier">Courier</Label>
              <Input id="courier" value={courierName} onChange={(e) => setCourierName(e.target.value)} placeholder="e.g. Courier Guy, Aramex, RAM" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tracking">Tracking number</Label>
              <Input id="tracking" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Tracking URL (optional)</Label>
              <Input id="url" value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="https://courier.co.za/track/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={saveTracking} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersManagement;
