import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS, type AppRole } from "@/lib/roleUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Headphones, Search, Plus, RefreshCw, FileText, User as UserIcon,
  AlertCircle, CheckCircle2, Clock, Loader2, Mail, Phone,
} from "lucide-react";
import { toast } from "sonner";
import AgentNotesBox from "@/components/admin/AgentNotesBox";

// ---------- types ----------
interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  raised_by: string | null;
  raised_by_email: string;
  assigned_to: string | null;
  resolution_notes: string;
  agent_notes: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  target_user_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface ProfileLite {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  nickname: string;
  role: string;
  is_active: boolean;
  mobile_1: string;
  created_at: string;
}

// ---------- helpers ----------
const STATUS_META: Record<string, { label: string; cls: string; icon: typeof Clock }> = {
  open: { label: "Open", cls: "bg-primary/15 text-primary border-primary/30", icon: AlertCircle },
  in_progress: { label: "In Progress", cls: "bg-amber-500/15 text-amber-700 border-amber-500/30", icon: Loader2 },
  resolved: { label: "Resolved", cls: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30", icon: CheckCircle2 },
  closed: { label: "Closed", cls: "bg-muted text-muted-foreground border-border", icon: Clock },
};

const PRIORITY_META: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  normal: "bg-secondary text-secondary-foreground",
  high: "bg-amber-500/20 text-amber-700",
  urgent: "bg-primary/20 text-primary",
};

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString() : "—";

// ============================================================
const ServiceCentre = () => {
  return (
    <div className="bg-muted min-h-[80vh]">
      <section className="bg-secondary text-secondary-foreground py-8 border-b-4 border-primary">
        <div className="container">
          <div className="flex items-center gap-3 mb-2">
            <Headphones className="w-7 h-7 text-primary" />
            <p className="font-display text-sm uppercase tracking-widest text-primary">Service Centre</p>
          </div>
          <h1 className="font-display text-3xl font-black text-primary-foreground">
            Customer Service, Escalations &amp; Refunds
          </h1>
          <p className="text-primary-foreground/70 mt-1 text-sm">
            Track customer journey & timers, assist customers, escalate issues, request cancellations and refunds. <span className="text-primary">Fulfilment & couriers live in <a href="/admin/orders" className="underline">Orders</a>.</span>
          </p>
        </div>
      </section>

      <section className="container py-8">
        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="grid w-full max-w-xl grid-cols-3 h-11 bg-secondary">
            <TabsTrigger value="tickets" className="text-secondary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Headphones className="w-4 h-4 mr-2" /> Tickets
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-secondary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4 mr-2" /> Audit Log
            </TabsTrigger>
            <TabsTrigger value="users" className="text-secondary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <UserIcon className="w-4 h-4 mr-2" /> User Lookup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="mt-6"><TicketsPanel /></TabsContent>
          <TabsContent value="audit" className="mt-6"><AuditPanel /></TabsContent>
          <TabsContent value="users" className="mt-6"><UserLookupPanel /></TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

// ============================================================
// TICKETS
// ============================================================
const TicketsPanel = () => {
  const { user, profile } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    setTickets((data ?? []) as Ticket[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.subject.toLowerCase().includes(q) ||
          t.raised_by_email.toLowerCase().includes(q) ||
          t.id.includes(q)
        );
      }
      return true;
    });
  }, [tickets, statusFilter, search]);

  const counts = useMemo(() => ({
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  }), [tickets]);

  const writeAudit = async (action: string, resourceId: string, meta: Record<string, unknown> = {}) => {
    if (!user) return;
    await supabase.from("audit_logs").insert([{
      actor_id: user.id,
      actor_email: user.email ?? "",
      action,
      resource_type: "ticket",
      resource_id: resourceId,
      metadata: meta as never,
    }]);
  };

  const updateTicketStatus = async (id: string, status: string) => {
    const patch: Partial<Ticket> = { status };
    if (status === "resolved") patch.resolved_at = new Date().toISOString();
    const { error } = await supabase.from("support_tickets").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Ticket marked ${STATUS_META[status]?.label ?? status}`);
    await writeAudit("ticket.status_changed", id, { status });
    load();
  };

  const handleCreate = async (payload: Partial<Ticket>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("support_tickets")
      .insert({
        subject: payload.subject ?? "",
        description: payload.description ?? "",
        priority: payload.priority ?? "normal",
        category: payload.category ?? "general",
        status: "open",
        raised_by_email: payload.raised_by_email ?? "",
        raised_by: payload.raised_by ?? null,
        assigned_to: user.id,
      })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    toast.success("Ticket created");
    await writeAudit("ticket.created", data.id, { subject: data.subject });
    setCreating(false);
    load();
  };

  return (
    <div className="space-y-4">
      {/* Stat row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Open" value={counts.open} accent="primary" />
        <StatCard label="In Progress" value={counts.in_progress} accent="amber" />
        <StatCard label="Resolved" value={counts.resolved} accent="emerald" />
      </div>

      {/* Toolbar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject, email, or ID…"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>

        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger asChild>
            <Button size="sm" className="font-display">
              <Plus className="w-4 h-4 mr-1" /> New Ticket
            </Button>
          </DialogTrigger>
          <NewTicketDialog onSubmit={handleCreate} actorEmail={user?.email ?? ""} />
        </Dialog>
      </div>

      {/* Ticket list */}
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Loading tickets…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">No tickets match your filters.</div>
        ) : (
          filtered.map((t) => <TicketRow key={t.id} ticket={t} onStatusChange={updateTicketStatus} />)
        )}
      </div>
    </div>
  );
};

const TicketRow = ({ ticket, onStatusChange }: { ticket: Ticket; onStatusChange: (id: string, s: string) => void }) => {
  const meta = STATUS_META[ticket.status] ?? STATUS_META.open;
  const Icon = meta.icon;
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border-b border-border last:border-b-0">
      <div className="p-4 flex flex-wrap items-start gap-4 hover:bg-muted/40 transition-colors">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 min-w-[240px] text-left"
        >
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={meta.cls}>
              <Icon className="w-3 h-3 mr-1" /> {meta.label}
            </Badge>
            <Badge variant="secondary" className={PRIORITY_META[ticket.priority] ?? ""}>
              {ticket.priority}
            </Badge>
            <span className="text-xs text-muted-foreground">{ticket.category}</span>
            {ticket.agent_notes && (
              <span className="text-[10px] text-primary">📝 has notes</span>
            )}
          </div>
          <p className="font-display font-bold text-sm">{ticket.subject || "(no subject)"}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{ticket.description}</p>
          <p className="text-xs text-muted-foreground mt-1">
            From <strong>{ticket.raised_by_email || "anonymous"}</strong> • {formatDate(ticket.created_at)}
          </p>
        </button>

        <Select value={ticket.status} onValueChange={(s) => onStatusChange(ticket.id, s)}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {expanded && (
        <div className="px-4 pb-4 bg-muted/20 grid md:grid-cols-2 gap-4">
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="text-foreground font-semibold">Full description</p>
            <p className="whitespace-pre-wrap">{ticket.description || "—"}</p>
            {ticket.resolution_notes && (
              <>
                <p className="text-foreground font-semibold mt-2">Resolution</p>
                <p className="whitespace-pre-wrap">{ticket.resolution_notes}</p>
              </>
            )}
          </div>
          <AgentNotesBox
            table="support_tickets"
            rowId={ticket.id}
            initialValue={ticket.agent_notes ?? ""}
            label="Service agent notes (auto-saved)"
          />
        </div>
      )}
    </div>
  );
};

const NewTicketDialog = ({
  onSubmit, actorEmail,
}: { onSubmit: (p: Partial<Ticket>) => void; actorEmail: string }) => {
  const [form, setForm] = useState({
    subject: "",
    description: "",
    priority: "normal",
    category: "general",
    raised_by_email: "",
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create Support Ticket</DialogTitle>
        <DialogDescription>Logged on behalf of {actorEmail || "you"}.</DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="email">Affected user email</Label>
          <Input id="email" type="email" value={form.raised_by_email} onChange={(e) => setForm({ ...form, raised_by_email: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Priority</Label>
            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="access">Access</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="account">Account</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => onSubmit(form)} disabled={!form.subject}>Create Ticket</Button>
      </DialogFooter>
    </DialogContent>
  );
};

// ============================================================
// AUDIT LOG
// ============================================================
const AuditPanel = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) toast.error(error.message);
    setLogs((data ?? []) as unknown as AuditLog[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!search) return logs;
    const q = search.toLowerCase();
    return logs.filter((l) =>
      l.actor_email.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.resource_type.toLowerCase().includes(q) ||
      l.resource_id.toLowerCase().includes(q)
    );
  }, [logs, search]);

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor, action, or resource…"
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Loading audit log…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            No audit entries yet — they'll appear here as staff perform actions.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3">When</th>
                <th className="text-left p-3">Actor</th>
                <th className="text-left p-3">Action</th>
                <th className="text-left p-3">Resource</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-t border-border hover:bg-muted/40">
                  <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(l.created_at)}</td>
                  <td className="p-3"><span className="font-medium">{l.actor_email || "system"}</span></td>
                  <td className="p-3"><Badge variant="outline">{l.action}</Badge></td>
                  <td className="p-3 text-xs">
                    <span className="text-muted-foreground">{l.resource_type}</span>{" "}
                    <span className="font-mono">{l.resource_id.slice(0, 8)}{l.resource_id.length > 8 ? "…" : ""}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ============================================================
// USER LOOKUP
// ============================================================
const UserLookupPanel = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfileLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ProfileLite | null>(null);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const q = `%${query.trim()}%`;
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,first_name,last_name,nickname,role,is_active,mobile_1,created_at")
      .or(`email.ilike.${q},first_name.ilike.${q},last_name.ilike.${q},nickname.ilike.${q},mobile_1.ilike.${q}`)
      .limit(25);
    if (error) toast.error(error.message);
    setResults((data ?? []) as ProfileLite[]);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Search by email, name, nickname or mobile…"
            className="pl-9"
          />
        </div>
        <Button onClick={search} disabled={loading || !query.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-1" />}
          Search
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl divide-y divide-border min-h-[200px]">
          {results.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground text-sm">
              {loading ? "Searching…" : "Run a search to find users."}
            </div>
          ) : (
            results.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`w-full text-left p-4 hover:bg-muted/40 transition-colors ${selected?.id === p.id ? "bg-muted/60" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-display font-bold text-sm">
                    {p.first_name || p.last_name ? `${p.first_name} ${p.last_name}`.trim() : p.email}
                  </p>
                  <Badge variant={p.is_active ? "default" : "secondary"}>
                    {p.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{p.email}</p>
                <p className="text-xs text-muted-foreground">
                  {ROLE_LABELS[p.role as AppRole] ?? p.role}
                </p>
              </button>
            ))
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          {selected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center text-primary-foreground font-display font-bold">
                  {(selected.first_name || selected.email)[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-display font-bold">
                    {selected.first_name || selected.last_name ? `${selected.first_name} ${selected.last_name}`.trim() : selected.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ROLE_LABELS[selected.role as AppRole] ?? selected.role} • Joined {formatDate(selected.created_at)}
                  </p>
                </div>
              </div>
              <DetailRow icon={Mail} label="Email" value={selected.email} />
              <DetailRow icon={Phone} label="Mobile" value={selected.mobile_1 || "—"} />
              <DetailRow icon={UserIcon} label="Nickname" value={selected.nickname || "—"} />
              <DetailRow icon={FileText} label="Profile ID" value={<span className="font-mono text-xs">{selected.id}</span>} />
            </div>
          ) : (
            <div className="text-center text-muted-foreground text-sm py-10">
              Select a user from the list to see their profile details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- shared bits ----------
const StatCard = ({ label, value, accent }: { label: string; value: number; accent: "primary" | "amber" | "emerald" }) => {
  const cls = accent === "primary" ? "text-primary" : accent === "amber" ? "text-amber-600" : "text-emerald-600";
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className={`font-display text-3xl font-black ${cls}`}>{value}</p>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
};

const DetailRow = ({ icon: Icon, label, value }: { icon: typeof UserIcon; label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-3 text-sm">
    <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
    <div className="flex-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p>{value}</p>
    </div>
  </div>
);

export default ServiceCentre;
