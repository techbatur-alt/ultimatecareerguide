import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Plus, UserPlus } from "lucide-react";

type Agent = {
  id: string; user_id: string; commission_rate: number; status: string;
  invited_email: string; invited_at: string | null; activated_at: string | null;
  profile?: { first_name: string; last_name: string; email: string } | null;
};
type Customer = {
  id: string; name: string; email: string; phone: string; company: string;
  status: string; owner_agent_id: string | null; notes: string;
};
type Project = {
  id: string; name: string; project_type: string; customer_id: string | null;
  kam_agent_id: string | null; status: string; value: number; description: string;
};

const SalesAgents = () => {
  const [tab, setTab] = useState("agents");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [a, c, p] = await Promise.all([
      supabase.from("sales_agents").select("*").order("created_at", { ascending: false }),
      supabase.from("customers").select("*").order("created_at", { ascending: false }),
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
    ]);
    // Hydrate agent profile names
    const userIds = (a.data ?? []).map((x) => x.user_id);
    let profilesMap: Record<string, { first_name: string; last_name: string; email: string }> = {};
    if (userIds.length) {
      const { data: profs } = await supabase
        .from("profiles").select("id,first_name,last_name,email").in("id", userIds);
      profilesMap = Object.fromEntries((profs ?? []).map((p: any) => [p.id, p]));
    }
    setAgents((a.data ?? []).map((x: any) => ({ ...x, profile: profilesMap[x.user_id] ?? null })));
    setCustomers(c.data ?? []);
    setProjects(p.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black">Sales Agents</h1>
        <p className="text-muted-foreground">Manage agents, customers and KAM projects.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="agents">Agents ({agents.length})</TabsTrigger>
          <TabsTrigger value="customers">Customers ({customers.length})</TabsTrigger>
          <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="agents">
          <AgentsTab agents={agents} loading={loading} reload={load} />
        </TabsContent>
        <TabsContent value="customers">
          <CustomersTab customers={customers} agents={agents} reload={load} />
        </TabsContent>
        <TabsContent value="projects">
          <ProjectsTab projects={projects} customers={customers} agents={agents} reload={load} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ---------- Agents tab ----------
const AgentsTab = ({ agents, loading, reload }: { agents: Agent[]; loading: boolean; reload: () => void }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "", commission_rate: "10" });
  const [busy, setBusy] = useState(false);

  const invite = async () => {
    if (!form.email) { toast.error("Email is required"); return; }
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("invite-sales-agent", {
      body: { ...form, commission_rate: Number(form.commission_rate) },
    });
    setBusy(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error || error?.message || "Invite failed");
      return;
    }
    toast.success(`Invite sent to ${form.email}`);
    setOpen(false);
    setForm({ email: "", first_name: "", last_name: "", commission_rate: "10" });
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="w-4 h-4 mr-2" /> Invite agent</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Invite a sales agent</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Email *</Label><Input type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>First name</Label><Input value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
                <div><Label>Last name</Label><Input value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
              </div>
              <div><Label>Commission rate (%)</Label><Input type="number" step="0.1" value={form.commission_rate}
                onChange={(e) => setForm({ ...form, commission_rate: e.target.value })} /></div>
              <Button onClick={invite} disabled={busy} className="w-full">
                <Mail className="w-4 h-4 mr-2" /> {busy ? "Sending..." : "Send invite"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead><TableHead>Email</TableHead>
              <TableHead>Commission</TableHead><TableHead>Status</TableHead>
              <TableHead>Invited</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
            ) : agents.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No agents yet</TableCell></TableRow>
            ) : agents.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.profile ? `${a.profile.first_name} ${a.profile.last_name}`.trim() || "—" : "—"}</TableCell>
                <TableCell>{a.profile?.email || a.invited_email}</TableCell>
                <TableCell>{a.commission_rate}%</TableCell>
                <TableCell><Badge variant={a.status === "active" ? "default" : "secondary"}>{a.status}</Badge></TableCell>
                <TableCell>{a.invited_at ? new Date(a.invited_at).toLocaleDateString() : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// ---------- Customers tab ----------
const CustomersTab = ({ customers, agents, reload }: { customers: Customer[]; agents: Agent[]; reload: () => void }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Customer>>({ name: "", email: "", phone: "", company: "", notes: "", owner_agent_id: null, status: "active" });

  const save = async () => {
    if (!form.name) { toast.error("Name is required"); return; }
    const { error } = await supabase.from("customers").insert({
      name: form.name, email: form.email || "", phone: form.phone || "",
      company: form.company || "", notes: form.notes || "",
      owner_agent_id: form.owner_agent_id || null, status: form.status || "active",
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Customer added");
    setOpen(false);
    setForm({ name: "", email: "", phone: "", company: "", notes: "", owner_agent_id: null, status: "active" });
    reload();
  };

  const agentName = (id: string | null) => {
    if (!id) return "—";
    const a = agents.find((x) => x.id === id);
    return a ? (a.profile ? `${a.profile.first_name} ${a.profile.last_name}`.trim() : a.invited_email) : "—";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Add customer</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New customer</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name *</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Email</Label><Input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Phone</Label><Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <div><Label>Company</Label><Input value={form.company || ""} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
              <div>
                <Label>Assigned agent</Label>
                <Select value={form.owner_agent_id || "none"} onValueChange={(v) => setForm({ ...form, owner_agent_id: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {agents.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{agentName(a.id)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={save} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Company</TableHead>
            <TableHead>Agent</TableHead><TableHead>Status</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No customers</TableCell></TableRow>
            ) : customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.company}</TableCell>
                <TableCell>{agentName(c.owner_agent_id)}</TableCell>
                <TableCell><Badge variant="secondary">{c.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// ---------- Projects tab ----------
const ProjectsTab = ({ projects, customers, agents, reload }: { projects: Project[]; customers: Customer[]; agents: Agent[]; reload: () => void }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Project>>({
    name: "", project_type: "customer", customer_id: null, kam_agent_id: null,
    status: "active", value: 0, description: "",
  });

  const save = async () => {
    if (!form.name) { toast.error("Name is required"); return; }
    const { error } = await supabase.from("projects").insert({
      name: form.name, project_type: form.project_type || "customer",
      customer_id: form.customer_id || null, kam_agent_id: form.kam_agent_id || null,
      status: form.status || "active", value: Number(form.value) || 0,
      description: form.description || "",
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Project created");
    setOpen(false); reload();
  };

  const agentLabel = (id: string | null) => {
    if (!id) return "—";
    const a = agents.find((x) => x.id === id);
    return a?.profile ? `${a.profile.first_name} ${a.profile.last_name}`.trim() || a.invited_email : (a?.invited_email || "—");
  };
  const customerLabel = (id: string | null) => customers.find((c) => c.id === id)?.name || "—";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> New project</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New project</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Project name *</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div>
                <Label>Type</Label>
                <Select value={form.project_type} onValueChange={(v) => setForm({ ...form, project_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer engagement</SelectItem>
                    <SelectItem value="sponsorship">Sponsorship / school deployment</SelectItem>
                    <SelectItem value="generic">Generic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.project_type === "customer" && (
                <div>
                  <Label>Customer</Label>
                  <Select value={form.customer_id || "none"} onValueChange={(v) => setForm({ ...form, customer_id: v === "none" ? null : v })}>
                    <SelectTrigger><SelectValue placeholder="Choose customer" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label>KAM (sales agent)</Label>
                <Select value={form.kam_agent_id || "none"} onValueChange={(v) => setForm({ ...form, kam_agent_id: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {agents.map((a) => <SelectItem key={a.id} value={a.id}>{agentLabel(a.id)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Value (ZAR)</Label><Input type="number" value={form.value ?? 0} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} /></div>
              <div><Label>Description</Label><Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <Button onClick={save} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Customer</TableHead>
            <TableHead>KAM</TableHead><TableHead>Value</TableHead><TableHead>Status</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No projects</TableCell></TableRow>
            ) : projects.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell><Badge variant="outline">{p.project_type}</Badge></TableCell>
                <TableCell>{customerLabel(p.customer_id)}</TableCell>
                <TableCell>{agentLabel(p.kam_agent_id)}</TableCell>
                <TableCell>R {Number(p.value).toLocaleString()}</TableCell>
                <TableCell><Badge variant="secondary">{p.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SalesAgents;
