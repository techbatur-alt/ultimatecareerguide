import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { calculateProgress, formatCurrency, getStatusTone, safeCount } from "@/lib/phase2";
import { ArrowRight, Package, Truck, GraduationCap, Building2, BarChart3 } from "lucide-react";

interface Phase2Summary {
  schools: number;
  warehouses: number;
  shipments: number;
  activeTraining: number;
  topMilestone: string;
  budget: number;
}

const Phase2Operations = () => {
  const [summary, setSummary] = useState<Phase2Summary>({
    schools: 0,
    warehouses: 0,
    shipments: 0,
    activeTraining: 0,
    topMilestone: "Awaiting sync",
    budget: 0,
  });

  useEffect(() => {
    const load = async () => {
      const [schoolsRes, warehousesRes, shipmentsRes, trainingsRes, milestonesRes, sponsorsRes] = await Promise.all([
        supabase.from("schools").select("id", { count: "exact", head: true }).catch(() => ({ count: 0, data: [] } as any)),
        supabase.from("warehouses").select("id", { count: "exact", head: true }).catch(() => ({ count: 0, data: [] } as any)),
        supabase.from("shipments").select("id", { count: "exact", head: true }).catch(() => ({ count: 0, data: [] } as any)),
        supabase.from("training_sessions").select("id", { count: "exact", head: true }).eq("status", "planned").catch(() => ({ count: 0, data: [] } as any)),
        supabase.from("project_milestones").select("name, status").order("target_date", { ascending: true }).limit(3).catch(() => ({ data: [] } as any)),
        supabase.from("sponsors").select("funding_commitment").catch(() => ({ data: [] } as any)),
      ]);

      const budget = (sponsorsRes.data ?? []).reduce((sum: number, row: any) => sum + Number(row.funding_commitment ?? 0), 0);
      setSummary({
        schools: safeCount(schoolsRes),
        warehouses: safeCount(warehousesRes),
        shipments: safeCount(shipmentsRes),
        activeTraining: safeCount(trainingsRes),
        topMilestone: milestonesRes.data?.[0]?.name ?? "No milestones yet",
        budget,
      });
    };

    load();
  }, []);

  const progress = useMemo(() => calculateProgress(summary.shipments, 24), [summary.shipments]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between mb-8">
        <div>
          <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">Phase 2</p>
          <h1 className="font-display text-4xl md:text-5xl font-black">Operations Command Suite</h1>
          <p className="text-muted-foreground mt-2">Distribution, training, sponsor visibility, and milestone tracking in one working view.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/admin/command-centre">Open command centre <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Schools tracked</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-black">{summary.schools}</div><p className="text-xs text-muted-foreground mt-1">Active school records</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Warehouses</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-black">{summary.warehouses}</div><p className="text-xs text-muted-foreground mt-1">Regional rollout nodes</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Shipments</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-black">{summary.shipments}</div><p className="text-xs text-muted-foreground mt-1">Active fulfilment records</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Training sessions</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-black">{summary.activeTraining}</div><p className="text-xs text-muted-foreground mt-1">Planned workshops</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Rollout progress</CardTitle>
            <CardDescription>Phase 2 operational delivery coverage.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
              <span>{progress}% of planned distribution milestones reached</span>
              <span>{summary.topMilestone}</span>
            </div>
            <div className="mt-5 rounded-lg border bg-card p-4 text-sm">
              <strong>Budget visibility:</strong> {formatCurrency(summary.budget)} committed across active sponsors.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Phase 2 modules</CardTitle>
            <CardDescription>Core services now represented in the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border p-3 flex items-center justify-between"><span className="flex items-center gap-2"><Truck className="h-4 w-4" /> Fulfillment tracking</span><Badge variant="outline" className={getStatusTone("active")}>Live</Badge></div>
            <div className="rounded-lg border p-3 flex items-center justify-between"><span className="flex items-center gap-2"><Package className="h-4 w-4" /> Inventory visibility</span><Badge variant="outline" className={getStatusTone("active")}>Ready</Badge></div>
            <div className="rounded-lg border p-3 flex items-center justify-between"><span className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Training coordination</span><Badge variant="outline" className={getStatusTone("planning")}>Seeded</Badge></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Phase2Operations;
