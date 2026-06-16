import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, Percent, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AgentDashboard = () => {
  const { user } = useAuth();
  const [agent, setAgent] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: ag } = await supabase
        .from("sales_agents").select("*").eq("user_id", user.id).maybeSingle();
      setAgent(ag);
      if (ag) {
        const [c, p] = await Promise.all([
          supabase.from("customers").select("*").eq("owner_agent_id", ag.id),
          supabase.from("projects").select("*").eq("kam_agent_id", ag.id),
        ]);
        setCustomers(c.data ?? []);
        setProjects(p.data ?? []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const pipeline = projects.reduce((s, p) => s + Number(p.value || 0), 0);
  const commission = (pipeline * Number(agent?.commission_rate || 0)) / 100;

  if (loading) return <div className="p-6 text-muted-foreground">Loading...</div>;
  if (!agent) return (
    <div className="p-6">
      <h1 className="font-display text-2xl font-black mb-2">Agent profile not found</h1>
      <p className="text-muted-foreground">Please contact support — your sales agent record is missing.</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-black">Agent Dashboard</h1>
          <p className="text-muted-foreground">Welcome back. Here's your book of business.</p>
        </div>
        <Button asChild variant="outline"><Link to="/profile">Edit profile</Link></Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="My customers" value={customers.length} />
        <StatCard icon={Briefcase} label="My projects" value={projects.length} />
        <StatCard icon={Percent} label="Commission rate" value={`${agent.commission_rate}%`} />
        <StatCard icon={DollarSign} label="Est. commission" value={`R ${commission.toLocaleString()}`} />
      </div>

      <Card>
        <CardHeader><CardTitle>My customers</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Name</TableHead><TableHead>Company</TableHead>
              <TableHead>Email</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No customers yet</TableCell></TableRow>
              ) : customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.company}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell><Badge variant="secondary">{c.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>My projects</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Name</TableHead><TableHead>Type</TableHead>
              <TableHead>Value</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No projects yet</TableCell></TableRow>
              ) : projects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell><Badge variant="outline">{p.project_type}</Badge></TableCell>
                  <TableCell>R {Number(p.value).toLocaleString()}</TableCell>
                  <TableCell><Badge variant="secondary">{p.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: any }) => (
  <Card>
    <CardContent className="p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-xl font-bold">{value}</div>
      </div>
    </CardContent>
  </Card>
);

export default AgentDashboard;
