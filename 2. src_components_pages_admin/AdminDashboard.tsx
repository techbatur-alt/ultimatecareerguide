import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Users, CreditCard, DollarSign, TicketCheck, ArrowRight, TrendingUp, Package, Radio } from "lucide-react";
import BackHomeBar from "@/components/BackHomeBar";

type SignupPoint = { date: string; signups: number; print: number; subscription: number; combo: number };

interface DashboardData {
  totalUsers: number;
  newUsers30d: number;
  activeSubs: number;
  expiringSoon: number;
  subscriptionRevenueAll: number;
  subscriptionRevenue30d: number;
  productRevenueAll: number;
  productRevenue30d: number;
  ordersTotal: number;
  ordersOpen: number;
  openTickets: number;
  ticketsBreakdown: { open: number; in_progress: number; resolved: number; closed: number };
  signupSeries: SignupPoint[];
  recentTickets: Array<{
    id: string;
    subject: string;
    status: string;
    priority: string;
    raised_by_email: string;
    created_at: string;
  }>;
}

const chartConfig = {
  signups: { label: "Sign-ups", color: "hsl(var(--primary))" },
  print: { label: "UCG Print", color: "hsl(220 70% 50%)" },
  subscription: { label: "Subscription", color: "hsl(160 60% 45%)" },
  combo: { label: "Combo", color: "hsl(35 90% 55%)" },
} satisfies ChartConfig;

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);

const buildSeries = (
  signupRows: Array<{ created_at: string }>,
  orderRows: Array<{ created_at: string; product_name: string }>,
): SignupPoint[] => {
  const days = 30;
  const today = new Date();
  const map = new Map<string, { signups: number; print: number; subscription: number; combo: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    map.set(d.toISOString().slice(0, 10), { signups: 0, print: 0, subscription: 0, combo: 0 });
  }
  signupRows.forEach((r) => {
    const key = new Date(r.created_at).toISOString().slice(0, 10);
    const e = map.get(key);
    if (e) e.signups += 1;
  });
  orderRows.forEach((r) => {
    const key = new Date(r.created_at).toISOString().slice(0, 10);
    const e = map.get(key);
    if (!e) return;
    const n = (r.product_name || "").toLowerCase();
    if (n.includes("combo")) e.combo += 1;
    else if (n.includes("subscription") || n.includes("digital")) e.subscription += 1;
    else e.print += 1;
  });
  return Array.from(map.entries()).map(([date, v]) => ({
    date: new Date(date).toLocaleDateString("en-ZA", { month: "short", day: "numeric" }),
    ...v,
  }));
};

const OPEN_ORDER_STATUSES = ["pending", "paid", "processing", "dispatched", "in_transit", "delayed"];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    open: "bg-destructive/10 text-destructive border-destructive/30",
    in_progress: "bg-primary/10 text-primary border-primary/30",
    resolved: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
    closed: "bg-muted text-muted-foreground border-border",
  };
  return map[status] ?? "bg-muted text-muted-foreground border-border";
};

const priorityBadge = (p: string) => {
  const map: Record<string, string> = {
    urgent: "bg-destructive text-destructive-foreground",
    high: "bg-orange-500 text-white",
    normal: "bg-secondary text-secondary-foreground",
    low: "bg-muted text-muted-foreground",
  };
  return map[p] ?? "bg-secondary text-secondary-foreground";
};

const StatCard = ({
  icon: Icon, label, value, hint, loading,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  hint?: string;
  loading: boolean;
}) => (
  <Card className="border-l-4 border-l-primary">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      <Icon className="h-4 w-4 text-primary" />
    </CardHeader>
    <CardContent>
      {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-3xl font-black text-foreground">{value}</div>}
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const cancelledRef = useRef(false);

  const loadData = useCallback(async () => {
    try {
      const now = new Date();
      const cutoff30 = new Date(now);
      cutoff30.setDate(now.getDate() - 30);
      const cutoff30Iso = cutoff30.toISOString();
      const in7 = new Date(now);
      in7.setDate(now.getDate() + 7);

      const [
        profilesAll, profilesRecent, subsActive, subsAllPaid, subs30dPaid, subsExpiring,
        ordersAllPaid, orders30dPaid, ordersCount, ordersOpenCount,
        ticketsAll, ticketsRecent, orders30dForChart,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("created_at").gte("created_at", cutoff30Iso).order("created_at", { ascending: true }),
        supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("subscriptions").select("amount_paid"),
        supabase.from("subscriptions").select("amount_paid").gte("created_at", cutoff30Iso),
        supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active").lte("end_date", in7.toISOString()),
        supabase.from("orders").select("total_amount").in("status", ["paid", "processing", "dispatched", "in_transit", "delivered"]),
        supabase.from("orders").select("total_amount").gte("created_at", cutoff30Iso).in("status", ["paid", "processing", "dispatched", "in_transit", "delivered"]),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).in("status", OPEN_ORDER_STATUSES),
        supabase.from("support_tickets").select("status"),
        supabase.from("support_tickets").select("id, subject, status, priority, raised_by_email, created_at").order("created_at", { ascending: false }).limit(8),
        supabase.from("orders").select("created_at, product_name").gte("created_at", cutoff30Iso),
      ]);

      if (cancelledRef.current) return;

      const sum = (rows: Array<{ amount_paid?: number | null; total_amount?: number | null }> | null, key: "amount_paid" | "total_amount") =>
        (rows ?? []).reduce((acc, r) => acc + Number((r as Record<string, number | null>)[key] ?? 0), 0);

      const breakdown = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
      (ticketsAll.data ?? []).forEach((t: { status: string }) => {
        if (t.status in breakdown) breakdown[t.status as keyof typeof breakdown]++;
      });

      setData({
        totalUsers: profilesAll.count ?? 0,
        newUsers30d: profilesRecent.data?.length ?? 0,
        activeSubs: subsActive.count ?? 0,
        expiringSoon: subsExpiring.count ?? 0,
        subscriptionRevenueAll: sum(subsAllPaid.data, "amount_paid"),
        subscriptionRevenue30d: sum(subs30dPaid.data, "amount_paid"),
        productRevenueAll: sum(ordersAllPaid.data, "total_amount"),
        productRevenue30d: sum(orders30dPaid.data, "total_amount"),
        ordersTotal: ordersCount.count ?? 0,
        ordersOpen: ordersOpenCount.count ?? 0,
        openTickets: breakdown.open + breakdown.in_progress,
        ticketsBreakdown: breakdown,
        signupSeries: buildSeries(profilesRecent.data ?? [], (orders30dForChart.data ?? []) as Array<{ created_at: string; product_name: string }>),
        recentTickets: (ticketsRecent.data ?? []) as DashboardData["recentTickets"],
      });
      setError(null);
    } catch (e) {
      if (!cancelledRef.current) setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      if (!cancelledRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    loadData();

    // Realtime subscription — any insert/update on these tables refreshes the dashboard.
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleRefresh = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => { loadData(); }, 400);
    };

    const channel = supabase
      .channel("admin-dashboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "subscriptions" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "support_tickets" }, scheduleRefresh)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setLive(true);
        if (status === "CLOSED" || status === "CHANNEL_ERROR") setLive(false);
      });

    return () => {
      cancelledRef.current = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  const totalSignups30d = useMemo(
    () => data?.signupSeries.reduce((a, p) => a + p.signups, 0) ?? 0,
    [data],
  );
  const totalRevenue = (data?.productRevenueAll ?? 0) + (data?.subscriptionRevenueAll ?? 0);
  const totalRevenue30d = (data?.productRevenue30d ?? 0) + (data?.subscriptionRevenue30d ?? 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <BackHomeBar />

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-black">
            <span className="text-primary">Admin</span> Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Real-time platform metrics and recent activity.</p>
        </div>
        <Badge variant="outline" className={live ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" : "text-muted-foreground"}>
          <Radio className={`h-3 w-3 mr-1.5 ${live ? "animate-pulse" : ""}`} />
          {live ? "Live" : "Connecting…"}
        </Badge>
      </div>

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6 text-destructive text-sm">Error: {error}</CardContent>
        </Card>
      )}

      {/* Top stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={data?.totalUsers ?? 0}
          hint={`+${data?.newUsers30d ?? 0} in last 30 days`}
          loading={loading}
        />
        <StatCard
          icon={CreditCard}
          label="Active Subscriptions"
          value={data?.activeSubs ?? 0}
          hint={`${data?.expiringSoon ?? 0} expiring within 7 days`}
          loading={loading}
        />
        <StatCard
          icon={Package}
          label="Product Orders"
          value={data?.ordersTotal ?? 0}
          hint={`${data?.ordersOpen ?? 0} in progress`}
          loading={loading}
        />
        <StatCard
          icon={TicketCheck}
          label="Open Tickets"
          value={data?.openTickets ?? 0}
          hint={`${data?.ticketsBreakdown.resolved ?? 0} resolved · ${data?.ticketsBreakdown.closed ?? 0} closed`}
          loading={loading}
        />
      </div>

      {/* Revenue split */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={DollarSign}
          label="Product Revenue (UCG Sets)"
          value={formatCurrency(data?.productRevenueAll ?? 0)}
          hint={`${formatCurrency(data?.productRevenue30d ?? 0)} in last 30 days`}
          loading={loading}
        />
        <StatCard
          icon={DollarSign}
          label="Subscription Revenue"
          value={formatCurrency(data?.subscriptionRevenueAll ?? 0)}
          hint={`${formatCurrency(data?.subscriptionRevenue30d ?? 0)} in last 30 days`}
          loading={loading}
        />
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          hint={`${formatCurrency(totalRevenue30d)} in last 30 days`}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Sign-ups & Orders Over Time
                </CardTitle>
                <CardDescription>Last 30 days · {totalSignups30d} new accounts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <AreaChart data={data?.signupSeries ?? []} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" minTickGap={32} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Area type="monotone" dataKey="signups" name="Sign-ups" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#signupGradient)" />
                  <Line type="monotone" dataKey="print" name="UCG Print" stroke="hsl(220 70% 50%)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="subscription" name="Subscription" stroke="hsl(160 60% 45%)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="combo" name="Combo" stroke="hsl(35 90% 55%)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Status</CardTitle>
            <CardDescription>Current support queue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : (
              <>
                {(["open", "in_progress", "resolved", "closed"] as const).map((s) => (
                  <div key={s} className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-muted/40 transition-colors">
                    <span className="capitalize text-sm font-medium">{s.replace("_", " ")}</span>
                    <Badge variant="outline" className={statusBadge(s)}>
                      {data?.ticketsBreakdown[s] ?? 0}
                    </Badge>
                  </div>
                ))}
                <Button asChild variant="outline" size="sm" className="w-full mt-2">
                  <Link to="/admin/service">
                    Open Service Centre <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Tickets</CardTitle>
              <CardDescription>Latest 8 support tickets across the platform</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/service">View all <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : data?.recentTickets.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No tickets yet.</p>
          ) : (
            <div className="divide-y">
              {data?.recentTickets.map((t) => (
                <div key={t.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{t.subject || "(no subject)"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t.raised_by_email || "unknown"} · {new Date(t.created_at).toLocaleString("en-ZA")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={priorityBadge(t.priority)}>{t.priority}</Badge>
                    <Badge variant="outline" className={statusBadge(t.status)}>
                      {t.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
