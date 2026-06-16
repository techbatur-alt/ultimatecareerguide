import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Package, TrendingUp, Users, DollarSign, Filter, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Sponsor { id: string; name: string; organization: string; tier: string; amount_pledged: number; amount_paid: number; status: string; }
interface Allocation { id: string; sponsor_id: string; category: string; description: string; quantity: number; amount: number; status: string; }
interface Province { id: string; name: string; }
interface District { id: string; name: string; province_id: string; }
interface School { id: string; name: string; province_id: string | null; district_id: string | null; npo_id: string | null; learner_count: number; }
interface SponsorSchool { sponsor_id: string; school_id: string; }

const tierColors: Record<string, string> = {
  diamond: "bg-blue-100 text-blue-800 border-blue-200",
  platinum: "bg-muted text-foreground border-border",
  gold: "bg-yellow-50 text-yellow-800 border-yellow-200",
  silver: "bg-muted text-muted-foreground border-border",
  bronze: "bg-orange-50 text-orange-800 border-orange-200",
};

const SponsorshipTracker = () => {
  const { isRole } = useAuth();
  const isStaff = isRole(["support", "sales_agent", "executive"]);

  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [sponsorSchools, setSponsorSchools] = useState<SponsorSchool[]>([]);
  const [loading, setLoading] = useState(true);

  const [fProvince, setFProvince] = useState("all");
  const [fDistrict, setFDistrict] = useState("all");
  const [fSchool, setFSchool] = useState("all");
  const [fSponsor, setFSponsor] = useState("all");

  const [linkFor, setLinkFor] = useState<Sponsor | null>(null);
  const [linkSelected, setLinkSelected] = useState<string[]>([]);

  const fetchAll = async () => {
    setLoading(true);
    const [s, a, p, d, sc, ss] = await Promise.all([
      supabase.from("sponsors").select("*").order("amount_pledged", { ascending: false }),
      supabase.from("sponsorship_allocations").select("*"),
      supabase.from("provinces").select("*").order("name"),
      supabase.from("districts").select("*").order("name"),
      supabase.from("schools").select("id,name,province_id,district_id,npo_id,learner_count").limit(2000),
      supabase.from("sponsor_schools").select("*"),
    ]);
    setSponsors((s.data as Sponsor[]) || []);
    setAllocations((a.data as Allocation[]) || []);
    setProvinces((p.data as Province[]) || []);
    setDistricts((d.data as District[]) || []);
    setSchools((sc.data as School[]) || []);
    setSponsorSchools((ss.data as SponsorSchool[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Filter chain
  const matchingSchoolIds = useMemo(() => {
    return schools.filter(s =>
      (fProvince === "all" || s.province_id === fProvince) &&
      (fDistrict === "all" || s.district_id === fDistrict) &&
      (fSchool === "all" || s.id === fSchool)
    ).map(s => s.id);
  }, [schools, fProvince, fDistrict, fSchool]);

  const filteredSponsorIds = useMemo(() => {
    if (fProvince === "all" && fDistrict === "all" && fSchool === "all" && fSponsor === "all") {
      return new Set(sponsors.map(s => s.id));
    }
    const linkedSponsors = new Set(sponsorSchools.filter(ss => matchingSchoolIds.includes(ss.school_id)).map(ss => ss.sponsor_id));
    if (fSponsor !== "all") return new Set([...linkedSponsors].filter(id => id === fSponsor));
    if (fProvince === "all" && fDistrict === "all" && fSchool === "all") return new Set(sponsors.map(s => s.id));
    return linkedSponsors;
  }, [sponsorSchools, matchingSchoolIds, fProvince, fDistrict, fSchool, fSponsor, sponsors]);

  const visibleSponsors = sponsors.filter(s => filteredSponsorIds.has(s.id));
  const totalPledged = visibleSponsors.reduce((sum, s) => sum + Number(s.amount_pledged), 0);
  const totalPaid = visibleSponsors.reduce((sum, s) => sum + Number(s.amount_paid), 0);
  const targetAmount = 438_600_000;
  const progressPercent = totalPledged > 0 ? Math.min(100, (totalPledged / targetAmount) * 100) : 0;

  const visibleAllocations = allocations.filter(a => filteredSponsorIds.has(a.sponsor_id));
  const visibleSchools = matchingSchoolIds;

  const openLink = async (sp: Sponsor) => {
    setLinkFor(sp);
    setLinkSelected(sponsorSchools.filter(ss => ss.sponsor_id === sp.id).map(ss => ss.school_id));
  };
  const saveLinks = async () => {
    if (!linkFor) return;
    await supabase.from("sponsor_schools").delete().eq("sponsor_id", linkFor.id);
    if (linkSelected.length) {
      const { error } = await supabase.from("sponsor_schools").insert(linkSelected.map(school_id => ({ sponsor_id: linkFor.id, school_id })));
      if (error) return toast({ title: error.message, variant: "destructive" });
    }
    toast({ title: "Sponsor schools updated" });
    setLinkFor(null);
    fetchAll();
  };

  const districtsForProvince = districts.filter(d => fProvince === "all" || d.province_id === fProvince);
  const schoolsForFilter = schools.filter(s =>
    (fProvince === "all" || s.province_id === fProvince) &&
    (fDistrict === "all" || s.district_id === fDistrict)
  );

  return (
    <div>
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 gradient-brand" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/images/hero-graduates.jpg')", backgroundSize: "cover" }} />
        <div className="container relative z-10">
          <Link to="/ucg-project" className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to UCG Project
          </Link>
          <h1 className="font-display text-3xl md:text-5xl font-black text-primary-foreground">UCG-2026 Sponsorship Tracker</h1>
          <p className="text-primary-foreground/80 mt-2">Filter by province, district, school or sponsor for an overview or detailed breakdown.</p>
        </div>
      </section>

      <div className="container py-12 max-w-6xl">
        {/* Filters */}
        <div className="bg-card border rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4" /><span className="font-display font-bold text-sm">Filters</span>
            {(fProvince !== "all" || fDistrict !== "all" || fSchool !== "all" || fSponsor !== "all") && (
              <Button size="sm" variant="ghost" onClick={() => { setFProvince("all"); setFDistrict("all"); setFSchool("all"); setFSponsor("all"); }}>Clear</Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select value={fProvince} onValueChange={(v) => { setFProvince(v); setFDistrict("all"); setFSchool("all"); }}>
              <SelectTrigger><SelectValue placeholder="Province" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All provinces</SelectItem>
                {provinces.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fDistrict} onValueChange={(v) => { setFDistrict(v); setFSchool("all"); }}>
              <SelectTrigger><SelectValue placeholder="District" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All districts</SelectItem>
                {districtsForProvince.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fSchool} onValueChange={setFSchool}>
              <SelectTrigger><SelectValue placeholder="School" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All schools</SelectItem>
                {schoolsForFilter.slice(0, 500).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fSponsor} onValueChange={setFSponsor}>
              <SelectTrigger><SelectValue placeholder="Sponsor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sponsors</SelectItem>
                {sponsors.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
          {[
            { icon: Users, label: "Sponsors", value: visibleSponsors.length.toString(), color: "text-primary" },
            { icon: DollarSign, label: "Pledged", value: `R${(totalPledged / 1_000_000).toFixed(1)}M`, color: "text-primary" },
            { icon: TrendingUp, label: "Paid", value: `R${(totalPaid / 1_000_000).toFixed(1)}M`, color: "text-success" },
            { icon: Package, label: "Allocations", value: visibleAllocations.length.toString(), color: "text-primary" },
            { icon: Users, label: "Schools matched", value: visibleSchools.length.toString(), color: "text-primary" },
          ].map((card) => (
            <div key={card.label} className="bg-card border rounded-xl p-6 text-center">
              <card.icon className={`w-8 h-8 mx-auto mb-2 ${card.color}`} />
              <p className={`font-display text-2xl font-black ${card.color}`}>{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border rounded-xl p-6 mb-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold">Campaign Progress (filtered)</h3>
            <span className="text-sm text-muted-foreground">{progressPercent.toFixed(1)}% of R438.6M target</span>
          </div>
          <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
            <div className="gradient-brand h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16"><div className="animate-pulse text-muted-foreground font-display">Loading…</div></div>
        ) : visibleSponsors.length === 0 ? (
          <div className="text-center py-16 bg-card border rounded-xl">
            <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-display text-xl font-bold text-muted-foreground mb-2">No sponsors match the current filters</h3>
            <p className="text-muted-foreground text-sm">Try widening the filter or clear it.</p>
          </div>
        ) : (
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="font-display text-xl font-bold">Sponsors {fSponsor !== "all" || fProvince !== "all" || fDistrict !== "all" || fSchool !== "all" ? "(filtered)" : ""}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 font-display font-bold">Sponsor</th>
                    <th className="text-left p-4 font-display font-bold">Tier</th>
                    <th className="text-right p-4 font-display font-bold">Pledged</th>
                    <th className="text-right p-4 font-display font-bold">Paid</th>
                    <th className="text-center p-4 font-display font-bold">Schools</th>
                    <th className="text-center p-4 font-display font-bold">Status</th>
                    {isStaff && <th className="p-4"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visibleSponsors.map((s) => {
                    const linkedCount = sponsorSchools.filter(ss => ss.sponsor_id === s.id).length;
                    return (
                      <tr key={s.id} className="hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.organization}</p>
                        </td>
                        <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-display font-bold border ${tierColors[s.tier] || tierColors.bronze}`}>{s.tier.charAt(0).toUpperCase() + s.tier.slice(1)}</span></td>
                        <td className="p-4 text-right font-display font-bold">R{Number(s.amount_pledged).toLocaleString()}</td>
                        <td className="p-4 text-right font-display font-bold text-success">R{Number(s.amount_paid).toLocaleString()}</td>
                        <td className="p-4 text-center">{linkedCount}</td>
                        <td className="p-4 text-center"><span className={`px-2 py-1 rounded-full text-xs font-bold ${s.status === 'confirmed' ? 'bg-success/20 text-success' : s.status === 'pending' ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'}`}>{s.status}</span></td>
                        {isStaff && <td className="p-4 text-right"><Button size="sm" variant="outline" onClick={() => openLink(s)}><Link2 className="w-3 h-3 mr-1" /> Link schools</Button></td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Link sponsor → schools */}
      <Dialog open={!!linkFor} onOpenChange={(o) => !o && setLinkFor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Link {linkFor?.name} to schools</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Select schools funded or supported by this sponsor.</p>
          <div className="max-h-96 overflow-y-auto border rounded p-3 space-y-1">
            {schools.length === 0 && <p className="text-sm text-muted-foreground">No schools yet — add or import schools first.</p>}
            {schools.map(s => (
              <label key={s.id} className="flex items-center gap-2 text-sm hover:bg-muted/50 p-1 rounded cursor-pointer">
                <input type="checkbox" checked={linkSelected.includes(s.id)} onChange={() => setLinkSelected(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])} />
                <span>{s.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{provinces.find(p => p.id === s.province_id)?.name || ""}</span>
              </label>
            ))}
          </div>
          <DialogFooter><Button onClick={saveLinks}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SponsorshipTracker;
