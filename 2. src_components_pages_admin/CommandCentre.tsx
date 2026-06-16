import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, ShieldAlert, Truck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BackHomeBar from "@/components/BackHomeBar";

type ProjectItem = { name: string; sponsor: string; status: string; progress: number; owner: string };
type LogisticsItem = { name: string; province: string; capacity: string; eta: string };
type RiskSignal = { label: string; value: string; detail: string };

const fallbackProjects: ProjectItem[] = [
  { name: "Careers4Africa SA26", sponsor: "IBX", status: "On track", progress: 72, owner: "Operations" },
  { name: "District Launch Pack", sponsor: "DBE", status: "Planning", progress: 38, owner: "Logistics" },
  { name: "Thusong Outreach", sponsor: "Provincial", status: "Risk watch", progress: 56, owner: "Stakeholder" },
];

const fallbackLogistics: LogisticsItem[] = [
  { name: "Midrand Hub", province: "Gauteng", capacity: "84%", eta: "2h" },
  { name: "Bloemfontein Depot", province: "Free State", capacity: "61%", eta: "5h" },
  { name: "PE Distribution Point", province: "Eastern Cape", capacity: "73%", eta: "7h" },
];

const fallbackSignals: RiskSignal[] = [
  { label: "Open risks", value: "5", detail: "2 high-impact items require escalation" },
  { label: "Deliveries due", value: "18", detail: "Next 72 hours across 6 districts" },
  { label: "Avg. fulfillment cost", value: "R312", detail: "Within planning tolerance" },
];

const CommandCentre = () => {
  const [projects, setProjects] = useState<ProjectItem[]>(fallbackProjects);
  const [logistics, setLogistics] = useState<LogisticsItem[]>(fallbackLogistics);
  const [signals, setSignals] = useState<RiskSignal[]>(fallbackSignals);
  const [sourceLabel, setSourceLabel] = useState("Fallback demo data");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [projectsRes, warehouseRes, risksRes] = await Promise.all([
          supabase.from("sponsor_projects").select("project_name, project_status, budget_total, units_target, units_delivered").order("updated_at", { ascending: false }).limit(3),
          supabase.from("warehouse_nodes").select("name, province, status").limit(3),
          supabase.from("project_risks").select("risk_name, risk_level, status").limit(5),
        ]);

        if (cancelled) return;

        if (projectsRes.error || warehouseRes.error || risksRes.error) {
          throw new Error("Live table query unavailable");
        }

        const liveProjects = (projectsRes.data ?? []).map((row: any, index: number) => ({
          name: row.project_name || `Project ${index + 1}`,
          sponsor: row.sponsor_id ? "Sponsor-linked" : "Unassigned",
          status: row.project_status || "planning",
          progress: Math.min(100, Math.round(((row.units_delivered ?? 0) / Math.max(1, row.units_target ?? 1)) * 100)),
          owner: row.owner_user_id ? "Sponsor owner" : "Operations",
        }));

        const liveLogistics = (warehouseRes.data ?? []).map((row: any) => ({
          name: row.name || "Warehouse",
          province: row.province || "Regional",
          capacity: row.status ? `${row.status}` : "Live",
          eta: "Live",
        }));

        const liveRiskCount = (risksRes.data ?? []).filter((row: any) => (row.status ?? "open") !== "closed").length;

        setProjects(liveProjects.length ? liveProjects : fallbackProjects);
        setLogistics(liveLogistics.length ? liveLogistics : fallbackLogistics);
        setSignals([
          { label: "Open risks", value: String(liveRiskCount || 2), detail: liveRiskCount ? "Live risk count from project_risks" : "No active risks reported yet" },
          { label: "Projects in flight", value: String(liveProjects.length || fallbackProjects.length), detail: "Live sponsor-project coverage" },
          { label: "Fulfillment nodes", value: String(liveLogistics.length || fallbackLogistics.length), detail: "Regional coverage from warehouse_nodes" },
        ]);
        setSourceLabel("Supabase live data");
      } catch {
        if (!cancelled) {
          setProjects(fallbackProjects);
          setLogistics(fallbackLogistics);
          setSignals(fallbackSignals);
          setSourceLabel("Fallback demo data");
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const liveBadge = useMemo(() => (sourceLabel === "Supabase live data" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" : "bg-amber-500/10 text-amber-700 border-amber-500/30"), [sourceLabel]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <BackHomeBar />

      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-black">
            <span className="text-primary">Phase 1</span> Command Centre
          </h1>
          <p className="text-muted-foreground mt-2">Sponsor visibility, logistics readiness, and operational KPIs for the next rollout phase.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={liveBadge}>{sourceLabel}</Badge>
          <Button asChild variant="outline">
            <Link to="/admin/dashboard">Back to Admin Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
        {signals.map((item) => (
          <Card key={item.label} className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground">{item.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Sponsor project pulse</CardTitle>
            <CardDescription>Live-ready view of sponsor-owned rollout workstreams.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.map((project) => (
              <div key={project.name} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{project.name}</p>
                    <p className="text-xs text-muted-foreground">Sponsor: {project.sponsor} · Owner: {project.owner}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">{project.status}</Badge>
                </div>
                <div className="mt-3 h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Progress {project.progress}% complete.</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /> Logistics readiness</CardTitle>
            <CardDescription>Regional fulfillment hubs and delivery capacity view.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {logistics.map((node) => (
              <div key={node.name} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{node.name}</p>
                    <p className="text-xs text-muted-foreground">{node.province}</p>
                  </div>
                  <Badge variant="secondary">ETA {node.eta}</Badge>
                </div>
                <p className="mt-2 text-sm">Capacity in use: {node.capacity}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-primary" /> Risk & escalation</CardTitle>
            <CardDescription>Operational issues that need sponsor or logistics attention.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">This Phase 1 shell is ready to hook into the new sponsor project, fulfillment, and risk tables once the migration is applied to Supabase.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Stakeholder view</CardTitle>
            <CardDescription>Role-based visibility for sponsors, logistics, and staff.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The command centre will evolve into a shared sponsor/logistics planning workspace with role-aware data access in the next iteration.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommandCentre;
