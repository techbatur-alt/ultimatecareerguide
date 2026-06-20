import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Flag, TrendingUp } from "lucide-react";
import { calculateProgress, formatCurrency, getProgressLabel, safeCount } from "@/lib/phase2";

type MilestoneRow = {
  id: string;
  name: string;
  phase?: string | null;
  status?: string | null;
  target_date?: string | null;
  actual_date?: string | null;
};

type KPIRow = {
  id: string;
  metric_name: string;
  metric_value?: number | null;
  period_start?: string | null;
  period_end?: string | null;
};

const ReportingOperations = () => {
  const [milestones, setMilestones] = useState<MilestoneRow[]>([]);
  const [kpis, setKpis] = useState<KPIRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [milestonesRes, kpisRes] = await Promise.all([
        supabase.from("project_milestones").select("*").order("target_date", { ascending: true }).limit(8),
        supabase.from("project_kpis").select("*").order("period_end", { ascending: false }).limit(8),
      ]);

      setMilestones((milestonesRes.data ?? []) as MilestoneRow[]);
      setKpis((kpisRes.data ?? []) as KPIRow[]);
      setLoading(false);
    };

    void load();
  }, []);

  const summary = useMemo(() => ({
    completed: milestones.filter((m) => (m.status ?? "").toLowerCase() === "completed").length,
    atRisk: milestones.filter((m) => (m.status ?? "").toLowerCase() === "delayed").length,
    kpiCount: safeCount({ count: kpis.length }),
  }), [kpis.length, milestones]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">Reporting</p>
        <h1 className="font-display text-3xl font-black">Milestones & KPI reporting</h1>
        <p className="text-muted-foreground">Track rollout milestones, flag risk, and surface the latest KPI snapshot.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Completed milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{summary.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">At-risk milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{summary.atRisk}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">KPI entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{summary.kpiCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Flag className="h-5 w-5 text-primary" /> Milestone tracker</CardTitle>
            <CardDescription>Current rollout delivery progress and ownership.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phase</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Target</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
                  ) : milestones.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No milestones yet</TableCell></TableRow>
                  ) : milestones.map((milestone) => {
                    const progress = calculateProgress(milestone.actual_date ? 1 : 0, milestone.target_date ? 1 : 0);
                    return (
                      <TableRow key={milestone.id}>
                        <TableCell>{milestone.name}</TableCell>
                        <TableCell>{milestone.phase || "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{getProgressLabel(milestone.status)}</Badge>
                            {milestone.status === "delayed" && <Badge variant="secondary">Risk</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>{milestone.target_date ? new Date(milestone.target_date).toLocaleDateString() : "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> KPI snapshot</CardTitle>
            <CardDescription>Latest registered operational KPIs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : kpis.length === 0 ? (
              <p className="text-sm text-muted-foreground">No KPI entries yet.</p>
            ) : kpis.map((kpi) => (
              <div key={kpi.id} className="rounded-lg border bg-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{kpi.metric_name}</p>
                  <Badge variant="outline">{formatCurrency(kpi.metric_value ?? 0)}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{kpi.period_start ? new Date(kpi.period_start).toLocaleDateString() : "—"} → {kpi.period_end ? new Date(kpi.period_end).toLocaleDateString() : "—"}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportingOperations;
