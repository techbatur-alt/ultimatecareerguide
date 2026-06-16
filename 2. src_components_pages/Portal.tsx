import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS, type AppRole } from "@/lib/roleUtils";
import {
  Users, CreditCard, Wrench, BarChart3, AlertTriangle,
  Handshake, Target, Heart, Shield, UserPlus, Headphones,
} from "lucide-react";

interface Tile {
  to: string;
  label: string;
  desc: string;
  icon: typeof Users;
  roles?: AppRole[];
}

const tiles: Tile[] = [
  { to: "/admin/users", label: "User Management", desc: "Create, edit and manage user accounts", icon: UserPlus },
  { to: "/admin/dashboard", label: "Dashboard", desc: "Operational overview and key metrics", icon: BarChart3 },
  { to: "/admin/billing", label: "Billing", desc: "Subscriptions, payments and refunds", icon: CreditCard },
  { to: "/admin/service", label: "Service Centre", desc: "Tickets, audit logs and tooling", icon: Headphones },
  { to: "/admin-data", label: "Admin Data", desc: "Data management and exports", icon: Wrench, roles: ["support", "executive"] },
  { to: "/admin/api-console", label: "API Console", desc: "Direct API tooling for support", icon: Wrench, roles: ["support", "executive"] },
  { to: "/admin/escalations", label: "Escalations", desc: "L6 escalation queue", icon: AlertTriangle, roles: ["executive"] },
  { to: "/portal/partners", label: "Our Partners", desc: "Strategic partners directory", icon: Handshake },
  { to: "/portal/ucg-project", label: "UCG Project", desc: "Project goals and roadmap", icon: Target },
  { to: "/portal/sponsorship", label: "Sponsorship", desc: "Sponsor management", icon: Heart },
  { to: "/portal/sponsorship-tracker", label: "Sponsorship Tracker", desc: "Funds raised and allocation", icon: BarChart3 },
];

const Portal = () => {
  const { user, profile, role, isRole } = useAuth();
  const [stats, setStats] = useState({ users: 0, activeSubs: 0, sponsors: 0 });

  useEffect(() => {
    const load = async () => {
      const [u, s, sp] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("sponsors").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        users: u.count ?? 0,
        activeSubs: s.count ?? 0,
        sponsors: sp.count ?? 0,
      });
    };
    load();
  }, []);

  const visibleTiles = tiles.filter((t) => !t.roles || isRole(t.roles));

  return (
    <div className="bg-muted min-h-[80vh]">
      {/* Admin hero */}
      <section className="bg-secondary text-secondary-foreground py-10 border-b-4 border-primary">
        <div className="container">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-7 h-7 text-primary" />
            <p className="font-display text-sm uppercase tracking-widest text-primary">Admin & Support Portal</p>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-primary-foreground">
            Welcome, {profile?.first_name || user?.email}
          </h1>
          <p className="text-primary-foreground/70 mt-1">
            Signed in as <strong>{ROLE_LABELS[role as AppRole] || role}</strong> — you have administrator access.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <StatBox label="Users" value={stats.users} />
            <StatBox label="Active Subscriptions" value={stats.activeSubs} />
            <StatBox label="Sponsors" value={stats.sponsors} />
          </div>
        </div>
      </section>

      {/* Tiles */}
      <section className="container py-10">
        <h2 className="font-display text-2xl font-bold mb-6">Operations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleTiles.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary hover:shadow-lg transition-all group"
            >
              <div className="w-11 h-11 rounded-lg gradient-brand flex items-center justify-center mb-3">
                <t.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-display text-base font-bold mb-1 group-hover:text-primary transition-colors">{t.label}</h3>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

const StatBox = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-primary-foreground/10 border border-primary-foreground/20 rounded-xl p-4 text-center">
    <p className="font-display text-3xl font-black text-primary">{value}</p>
    <p className="text-xs text-primary-foreground/70 uppercase tracking-wider">{label}</p>
  </div>
);

export default Portal;
