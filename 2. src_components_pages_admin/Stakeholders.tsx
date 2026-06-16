import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Upload, Trash2, Pencil, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { INSTITUTION_TYPES_BY_CATEGORY, INSTITUTION_CATEGORIES } from "@/lib/institutionTypes";

type Province = { id: string; name: string; code: string };
type District = { id: string; name: string; code: string; province_id: string };
type PBO = { id: string; name: string; registration_number: string; contact_name: string; contact_email: string; contact_phone: string; address: string; notes: string; is_active: boolean };
type NPO = PBO & { pbo_id: string | null };
type School = { id: string; name: string; emis_number: string; province_id: string | null; district_id: string | null; npo_id: string | null; address: string; contact_name: string; contact_email: string; contact_phone: string; learner_count: number; notes: string; is_active: boolean };
type Trainer = { id: string; npo_id: string | null; first_name: string; last_name: string; email: string; phone: string; qualifications: string; notes: string; is_active: boolean };

const Stakeholders = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [pbos, setPbos] = useState<PBO[]>([]);
  const [npos, setNpos] = useState<NPO[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    const [p, d, pb, np, sc, tr] = await Promise.all([
      supabase.from("provinces").select("*").order("name"),
      supabase.from("districts").select("*").order("name"),
      supabase.from("pbos").select("*").order("name"),
      supabase.from("npos").select("*").order("name"),
      supabase.from("schools").select("*").order("name").limit(2000),
      supabase.from("trainers").select("*").order("last_name"),
    ]);
    setProvinces((p.data as Province[]) || []);
    setDistricts((d.data as District[]) || []);
    setPbos((pb.data as PBO[]) || []);
    setNpos((np.data as NPO[]) || []);
    setSchools((sc.data as School[]) || []);
    setTrainers((tr.data as Trainer[]) || []);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  return (
    <div className="container py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-black">Stakeholders CRM</h1>
        <p className="text-muted-foreground text-sm">Manage the PBO → NPO → Trainer → School reporting chain.</p>
      </div>

      <Tabs defaultValue="pbos">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="pbos">PBOs ({pbos.length})</TabsTrigger>
          <TabsTrigger value="npos">NPOs ({npos.length})</TabsTrigger>
          <TabsTrigger value="trainers">Trainers ({trainers.length})</TabsTrigger>
          <TabsTrigger value="schools">Schools ({schools.length})</TabsTrigger>
          <TabsTrigger value="districts">Districts ({districts.length})</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
        </TabsList>

        <TabsContent value="pbos" className="mt-6">
          <PBOTab rows={pbos} reload={loadAll} />
        </TabsContent>
        <TabsContent value="npos" className="mt-6">
          <NPOTab rows={npos} pbos={pbos} reload={loadAll} />
        </TabsContent>
        <TabsContent value="trainers" className="mt-6">
          <TrainerTab rows={trainers} npos={npos} schools={schools} reload={loadAll} />
        </TabsContent>
        <TabsContent value="schools" className="mt-6">
          <SchoolTab rows={schools} provinces={provinces} districts={districts} npos={npos} reload={loadAll} />
        </TabsContent>
        <TabsContent value="districts" className="mt-6">
          <DistrictTab rows={districts} provinces={provinces} reload={loadAll} />
        </TabsContent>
        <TabsContent value="import" className="mt-6">
          <ImportTab provinces={provinces} districts={districts} reload={loadAll} />
        </TabsContent>
      </Tabs>
      {loading && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}
    </div>
  );
};

/* ---------- PBOs ---------- */
const PBOTab = ({ rows, reload }: { rows: PBO[]; reload: () => void }) => {
  const blank = { name: "", registration_number: "", contact_name: "", contact_email: "", contact_phone: "", address: "", notes: "", is_active: true };
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const save = async () => {
    if (!editing.name) return toast({ title: "Name is required", variant: "destructive" });
    const { id, ...payload } = editing;
    const res = id
      ? await supabase.from("pbos").update(payload).eq("id", id)
      : await supabase.from("pbos").insert(payload);
    if (res.error) return toast({ title: res.error.message, variant: "destructive" });
    toast({ title: id ? "PBO updated" : "PBO added" });
    setOpen(false); reload();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this PBO?")) return;
    const { error } = await supabase.from("pbos").delete().eq("id", id);
    if (error) return toast({ title: error.message, variant: "destructive" });
    toast({ title: "PBO deleted" }); reload();
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => { setEditing(blank); setOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Add PBO</Button>
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Reg #</TableHead><TableHead>Contact</TableHead><TableHead>Email</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{r.registration_number}</TableCell>
                <TableCell>{r.contact_name}</TableCell>
                <TableCell>{r.contact_email}</TableCell>
                <TableCell className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No PBOs yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "Add"} PBO</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Name *</Label><Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><Label>Registration #</Label><Input value={editing.registration_number} onChange={e => setEditing({ ...editing, registration_number: e.target.value })} /></div>
              <div><Label>Contact name</Label><Input value={editing.contact_name} onChange={e => setEditing({ ...editing, contact_name: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={editing.contact_email} onChange={e => setEditing({ ...editing, contact_email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={editing.contact_phone} onChange={e => setEditing({ ...editing, contact_phone: e.target.value })} /></div>
              <div className="col-span-2"><Label>Address</Label><Input value={editing.address} onChange={e => setEditing({ ...editing, address: e.target.value })} /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea value={editing.notes} onChange={e => setEditing({ ...editing, notes: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ---------- NPOs ---------- */
const NPOTab = ({ rows, pbos, reload }: { rows: NPO[]; pbos: PBO[]; reload: () => void }) => {
  const blank: any = { pbo_id: null, name: "", registration_number: "", contact_name: "", contact_email: "", contact_phone: "", address: "", notes: "", is_active: true };
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const save = async () => {
    if (!editing.name) return toast({ title: "Name is required", variant: "destructive" });
    const { id, ...payload } = editing;
    const res = id ? await supabase.from("npos").update(payload).eq("id", id) : await supabase.from("npos").insert(payload);
    if (res.error) return toast({ title: res.error.message, variant: "destructive" });
    toast({ title: id ? "NPO updated" : "NPO added" });
    setOpen(false); reload();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this NPO?")) return;
    const { error } = await supabase.from("npos").delete().eq("id", id);
    if (error) return toast({ title: error.message, variant: "destructive" });
    toast({ title: "NPO deleted" }); reload();
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => { setEditing(blank); setOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Add NPO</Button>
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Reports to (PBO)</TableHead><TableHead>Contact</TableHead><TableHead>Email</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{pbos.find(p => p.id === r.pbo_id)?.name || "—"}</TableCell>
                <TableCell>{r.contact_name}</TableCell>
                <TableCell>{r.contact_email}</TableCell>
                <TableCell className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No NPOs yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "Add"} NPO</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Name *</Label><Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="col-span-2"><Label>Reports to (PBO)</Label>
                <Select value={editing.pbo_id || "none"} onValueChange={v => setEditing({ ...editing, pbo_id: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue placeholder="Select PBO" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None —</SelectItem>
                    {pbos.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Registration #</Label><Input value={editing.registration_number} onChange={e => setEditing({ ...editing, registration_number: e.target.value })} /></div>
              <div><Label>Contact name</Label><Input value={editing.contact_name} onChange={e => setEditing({ ...editing, contact_name: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={editing.contact_email} onChange={e => setEditing({ ...editing, contact_email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={editing.contact_phone} onChange={e => setEditing({ ...editing, contact_phone: e.target.value })} /></div>
              <div className="col-span-2"><Label>Address</Label><Input value={editing.address} onChange={e => setEditing({ ...editing, address: e.target.value })} /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea value={editing.notes} onChange={e => setEditing({ ...editing, notes: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ---------- Trainers ---------- */
const TrainerTab = ({ rows, npos, schools, reload }: { rows: Trainer[]; npos: NPO[]; schools: School[]; reload: () => void }) => {
  const blank: any = { npo_id: null, first_name: "", last_name: "", email: "", phone: "", qualifications: "", notes: "", is_active: true };
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [assignFor, setAssignFor] = useState<Trainer | null>(null);
  const [assigned, setAssigned] = useState<string[]>([]);

  const save = async () => {
    if (!editing.first_name && !editing.last_name) return toast({ title: "Name required", variant: "destructive" });
    const { id, ...payload } = editing;
    const res = id ? await supabase.from("trainers").update(payload).eq("id", id) : await supabase.from("trainers").insert(payload);
    if (res.error) return toast({ title: res.error.message, variant: "destructive" });
    toast({ title: id ? "Trainer updated" : "Trainer added" });
    setOpen(false); reload();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this trainer?")) return;
    const { error } = await supabase.from("trainers").delete().eq("id", id);
    if (error) return toast({ title: error.message, variant: "destructive" });
    toast({ title: "Trainer deleted" }); reload();
  };
  const openAssign = async (t: Trainer) => {
    setAssignFor(t);
    const { data } = await supabase.from("trainer_schools").select("school_id").eq("trainer_id", t.id);
    setAssigned((data || []).map((r: any) => r.school_id));
  };
  const toggleSchool = (sid: string) => {
    setAssigned(prev => prev.includes(sid) ? prev.filter(x => x !== sid) : [...prev, sid]);
  };
  const saveAssignments = async () => {
    if (!assignFor) return;
    await supabase.from("trainer_schools").delete().eq("trainer_id", assignFor.id);
    if (assigned.length) {
      await supabase.from("trainer_schools").insert(assigned.map(sid => ({ trainer_id: assignFor.id, school_id: sid })));
    }
    toast({ title: "Assignments saved" });
    setAssignFor(null);
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => { setEditing(blank); setOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Add Trainer</Button>
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>NPO</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.first_name} {r.last_name}</TableCell>
                <TableCell>{npos.find(n => n.id === r.npo_id)?.name || "—"}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.phone}</TableCell>
                <TableCell className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => openAssign(r)}>Schools</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No trainers yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "Add"} Trainer</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-3">
              <div><Label>First name</Label><Input value={editing.first_name} onChange={e => setEditing({ ...editing, first_name: e.target.value })} /></div>
              <div><Label>Last name</Label><Input value={editing.last_name} onChange={e => setEditing({ ...editing, last_name: e.target.value })} /></div>
              <div className="col-span-2"><Label>NPO</Label>
                <Select value={editing.npo_id || "none"} onValueChange={v => setEditing({ ...editing, npo_id: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None —</SelectItem>
                    {npos.map(n => <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Email</Label><Input value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} /></div>
              <div className="col-span-2"><Label>Qualifications</Label><Input value={editing.qualifications} onChange={e => setEditing({ ...editing, qualifications: e.target.value })} /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea value={editing.notes} onChange={e => setEditing({ ...editing, notes: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!assignFor} onOpenChange={(o) => !o && setAssignFor(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Assign schools to {assignFor?.first_name} {assignFor?.last_name}</DialogTitle></DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-1 border rounded p-3">
            {schools.length === 0 && <p className="text-sm text-muted-foreground">No schools yet — add or import schools first.</p>}
            {schools.map(s => (
              <label key={s.id} className="flex items-center gap-2 text-sm hover:bg-muted/50 p-1 rounded cursor-pointer">
                <input type="checkbox" checked={assigned.includes(s.id)} onChange={() => toggleSchool(s.id)} />
                <span>{s.name}</span>
              </label>
            ))}
          </div>
          <DialogFooter><Button onClick={saveAssignments}>Save assignments</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ---------- Schools ---------- */
const SchoolTab = ({ rows, provinces, districts, npos, reload }: { rows: School[]; provinces: Province[]; districts: District[]; npos: NPO[]; reload: () => void }) => {
  const blank: any = { name: "", emis_number: "", province_id: null, district_id: null, npo_id: null, address: "", contact_name: "", contact_email: "", contact_phone: "", learner_count: 0, notes: "", is_active: true };
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [filterProvince, setFilterProvince] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = rows.filter(r =>
    (filterProvince === "all" || r.province_id === filterProvince) &&
    (!search || r.name.toLowerCase().includes(search.toLowerCase()))
  );

  const save = async () => {
    if (!editing.name) return toast({ title: "Name is required", variant: "destructive" });
    const { id, ...payload } = editing;
    const res = id ? await supabase.from("schools").update(payload).eq("id", id) : await supabase.from("schools").insert(payload);
    if (res.error) return toast({ title: res.error.message, variant: "destructive" });
    toast({ title: id ? "School updated" : "School added" });
    setOpen(false); reload();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this school?")) return;
    const { error } = await supabase.from("schools").delete().eq("id", id);
    if (error) return toast({ title: error.message, variant: "destructive" });
    toast({ title: "School deleted" }); reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end">
        <Button onClick={() => { setEditing(blank); setOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Add School</Button>
        <div className="ml-auto flex gap-2">
          <Input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="w-48" />
          <Select value={filterProvince} onValueChange={setFilterProvince}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All provinces</SelectItem>
              {provinces.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Showing {filtered.length} of {rows.length}</p>
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Province</TableHead><TableHead>District</TableHead><TableHead>NPO</TableHead><TableHead>Learners</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.slice(0, 500).map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{provinces.find(p => p.id === r.province_id)?.name || "—"}</TableCell>
                <TableCell>{districts.find(d => d.id === r.district_id)?.name || "—"}</TableCell>
                <TableCell>{npos.find(n => n.id === r.npo_id)?.name || "—"}</TableCell>
                <TableCell>{r.learner_count}</TableCell>
                <TableCell className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No schools.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "Add"} School</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Name *</Label><Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><Label>EMIS #</Label><Input value={editing.emis_number} onChange={e => setEditing({ ...editing, emis_number: e.target.value })} /></div>
              <div><Label>Learners</Label><Input type="number" value={editing.learner_count} onChange={e => setEditing({ ...editing, learner_count: parseInt(e.target.value) || 0 })} /></div>
              <div><Label>Province</Label>
                <Select value={editing.province_id || "none"} onValueChange={v => setEditing({ ...editing, province_id: v === "none" ? null : v, district_id: null })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None —</SelectItem>
                    {provinces.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>District</Label>
                <Select value={editing.district_id || "none"} onValueChange={v => setEditing({ ...editing, district_id: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None —</SelectItem>
                    {districts.filter(d => !editing.province_id || d.province_id === editing.province_id).map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label>NPO (owner)</Label>
                <Select value={editing.npo_id || "none"} onValueChange={v => setEditing({ ...editing, npo_id: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None —</SelectItem>
                    {npos.map(n => <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label>Address</Label><Input value={editing.address} onChange={e => setEditing({ ...editing, address: e.target.value })} /></div>
              <div><Label>Contact name</Label><Input value={editing.contact_name} onChange={e => setEditing({ ...editing, contact_name: e.target.value })} /></div>
              <div><Label>Contact email</Label><Input value={editing.contact_email} onChange={e => setEditing({ ...editing, contact_email: e.target.value })} /></div>
              <div className="col-span-2"><Label>Contact phone</Label><Input value={editing.contact_phone} onChange={e => setEditing({ ...editing, contact_phone: e.target.value })} /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea value={editing.notes} onChange={e => setEditing({ ...editing, notes: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ---------- Districts ---------- */
const DistrictTab = ({ rows, provinces, reload }: { rows: District[]; provinces: Province[]; reload: () => void }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [provinceId, setProvinceId] = useState("");

  const add = async () => {
    if (!name || !provinceId) return toast({ title: "Name and province required", variant: "destructive" });
    const { error } = await supabase.from("districts").insert({ name, code, province_id: provinceId });
    if (error) return toast({ title: error.message, variant: "destructive" });
    setName(""); setCode(""); reload();
    toast({ title: "District added" });
  };
  const remove = async (id: string) => {
    if (!confirm("Delete district?")) return;
    const { error } = await supabase.from("districts").delete().eq("id", id);
    if (error) return toast({ title: error.message, variant: "destructive" });
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end border rounded-lg p-4">
        <div><Label>Province *</Label>
          <Select value={provinceId} onValueChange={setProvinceId}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{provinces.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>District name *</Label><Input value={name} onChange={e => setName(e.target.value)} className="w-56" /></div>
        <div><Label>Code</Label><Input value={code} onChange={e => setCode(e.target.value)} className="w-32" /></div>
        <Button onClick={add}><Plus className="w-4 h-4 mr-2" /> Add</Button>
      </div>
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>District</TableHead><TableHead>Province</TableHead><TableHead>Code</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{provinces.find(p => p.id === r.province_id)?.name}</TableCell>
                <TableCell>{r.code}</TableCell>
                <TableCell><Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No districts yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

/* ---------- Importer ---------- */
type ImportTarget = "schools" | "npos" | "trainers" | "districts";

const TARGET_CONFIG: Record<ImportTarget, { label: string; required: string[]; columns: string[]; sample: string[] }> = {
  schools: {
    label: "Schools",
    required: ["school_name"],
    columns: ["province", "district", "school_name", "emis_number", "address", "contact_name", "contact_email", "contact_phone", "learner_count"],
    sample: ["Gauteng", "Tshwane North", "Example Primary", "700123456", "123 Main St", "Jane Doe", "principal@example.co.za", "0123456789", "850"],
  },
  npos: {
    label: "NPOs",
    required: ["name"],
    columns: ["name", "registration_number", "contact_name", "contact_email", "contact_phone", "address", "notes"],
    sample: ["Example NPO", "NPO-123-456", "John Smith", "info@example.org", "0211234567", "1 Long St, Cape Town", ""],
  },
  trainers: {
    label: "Trainers",
    required: ["first_name", "last_name"],
    columns: ["first_name", "last_name", "email", "phone", "qualifications", "notes"],
    sample: ["Thandi", "Mokoena", "thandi@example.co.za", "0731234567", "B.Ed Hons", ""],
  },
  districts: {
    label: "Districts",
    required: ["province", "district"],
    columns: ["province", "district", "code"],
    sample: ["Gauteng", "Tshwane North", "TSN"],
  },
};

const ImportTab = ({ provinces, districts, reload }: { provinces: Province[]; districts: District[]; reload: () => void }) => {
  const [target, setTarget] = useState<ImportTarget>("schools");
  const [institutionType, setInstitutionType] = useState<string>("");
  const [preview, setPreview] = useState<any[]>([]);
  const [filename, setFilename] = useState("");

  const cfg = TARGET_CONFIG[target];

  const resetFile = () => { setPreview([]); setFilename(""); };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([cfg.columns, cfg.sample]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, cfg.label);
    XLSX.writeFile(wb, `${target}-template.xlsx`);
  };

  const handleFile = async (file: File) => {
    setFilename(file.name);
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<any>(ws, { defval: "" });
    setPreview(rows);
  };

  const resolveInstType = () => {
    if (!institutionType) return { institution_type: "", institution_category: "" };
    for (const cat of INSTITUTION_CATEGORIES) {
      const found = INSTITUTION_TYPES_BY_CATEGORY[cat].find(t => t.name === institutionType);
      if (found) return { institution_type: found.name, institution_category: found.category };
    }
    return { institution_type: institutionType, institution_category: "" };
  };

  const importNow = async () => {
    if (!preview.length) return;
    const tag = resolveInstType();
    let inserted = 0, skipped = 0;

    if (target === "schools") {
      const provinceMap = new Map(provinces.map(p => [p.name.toLowerCase().trim(), p.id]));
      const districtMap = new Map(districts.map(d => [`${d.province_id}|${d.name.toLowerCase().trim()}`, d.id]));
      const newDistricts: { name: string; province_id: string }[] = [];
      const payload: any[] = [];
      for (const r of preview) {
        const provinceName = String(r.province || "").trim();
        const districtName = String(r.district || "").trim();
        const schoolName = String(r.school_name || "").trim();
        if (!schoolName) { skipped++; continue; }
        const province_id = provinceMap.get(provinceName.toLowerCase()) || null;
        let district_id: string | null = null;
        if (province_id && districtName) {
          const key = `${province_id}|${districtName.toLowerCase()}`;
          district_id = districtMap.get(key) || null;
          if (!district_id && !newDistricts.find(d => d.name.toLowerCase() === districtName.toLowerCase() && d.province_id === province_id)) {
            newDistricts.push({ name: districtName, province_id });
          }
        }
        payload.push({
          name: schoolName,
          emis_number: String(r.emis_number || ""),
          province_id, district_id,
          address: String(r.address || ""),
          contact_name: String(r.contact_name || ""),
          contact_email: String(r.contact_email || ""),
          contact_phone: String(r.contact_phone || ""),
          learner_count: parseInt(String(r.learner_count || "0")) || 0,
          ...tag,
          _districtName: districtName,
        });
      }
      if (newDistricts.length) {
        const { data: created, error } = await supabase.from("districts").insert(newDistricts).select();
        if (error) return toast({ title: "District insert failed: " + error.message, variant: "destructive" });
        for (const d of created || []) districtMap.set(`${d.province_id}|${d.name.toLowerCase()}`, d.id);
      }
      for (const row of payload) {
        if (!row.district_id && row.province_id && row._districtName) {
          row.district_id = districtMap.get(`${row.province_id}|${row._districtName.toLowerCase()}`) || null;
        }
        delete row._districtName;
      }
      for (let i = 0; i < payload.length; i += 500) {
        const chunk = payload.slice(i, i + 500);
        const { error } = await supabase.from("schools").insert(chunk);
        if (error) return toast({ title: `Insert failed at row ${i}: ${error.message}`, variant: "destructive" });
        inserted += chunk.length;
      }
    } else if (target === "npos") {
      const payload = preview
        .filter(r => String(r.name || "").trim())
        .map(r => ({
          name: String(r.name).trim(),
          registration_number: String(r.registration_number || ""),
          contact_name: String(r.contact_name || ""),
          contact_email: String(r.contact_email || ""),
          contact_phone: String(r.contact_phone || ""),
          address: String(r.address || ""),
          notes: String(r.notes || ""),
          ...tag,
        }));
      skipped = preview.length - payload.length;
      for (let i = 0; i < payload.length; i += 500) {
        const chunk = payload.slice(i, i + 500);
        const { error } = await supabase.from("npos").insert(chunk);
        if (error) return toast({ title: `Insert failed: ${error.message}`, variant: "destructive" });
        inserted += chunk.length;
      }
    } else if (target === "trainers") {
      const payload = preview
        .filter(r => String(r.first_name || r.last_name || "").trim())
        .map(r => ({
          first_name: String(r.first_name || ""),
          last_name: String(r.last_name || ""),
          email: String(r.email || ""),
          phone: String(r.phone || ""),
          qualifications: String(r.qualifications || ""),
          notes: String(r.notes || ""),
          ...tag,
        }));
      skipped = preview.length - payload.length;
      for (let i = 0; i < payload.length; i += 500) {
        const chunk = payload.slice(i, i + 500);
        const { error } = await supabase.from("trainers").insert(chunk);
        if (error) return toast({ title: `Insert failed: ${error.message}`, variant: "destructive" });
        inserted += chunk.length;
      }
    } else if (target === "districts") {
      const provinceMap = new Map(provinces.map(p => [p.name.toLowerCase().trim(), p.id]));
      const payload: any[] = [];
      for (const r of preview) {
        const pName = String(r.province || "").trim();
        const dName = String(r.district || "").trim();
        if (!dName) { skipped++; continue; }
        const province_id = provinceMap.get(pName.toLowerCase());
        if (!province_id) { skipped++; continue; }
        payload.push({ name: dName, code: String(r.code || ""), province_id, ...tag });
      }
      for (let i = 0; i < payload.length; i += 500) {
        const chunk = payload.slice(i, i + 500);
        const { error } = await supabase.from("districts").insert(chunk);
        if (error) return toast({ title: `Insert failed: ${error.message}`, variant: "destructive" });
        inserted += chunk.length;
      }
    }

    toast({ title: `Imported ${inserted} ${cfg.label.toLowerCase()}`, description: skipped ? `Skipped ${skipped} invalid rows.` : undefined });
    resetFile(); reload();
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="font-display text-lg font-bold">Bulk import stakeholders</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Import into</Label>
            <Select value={target} onValueChange={(v) => { setTarget(v as ImportTarget); resetFile(); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="schools">Schools</SelectItem>
                <SelectItem value="npos">NPOs</SelectItem>
                <SelectItem value="trainers">Trainers</SelectItem>
                <SelectItem value="districts">Districts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tag with institution type (optional)</Label>
            <Select value={institutionType || "none"} onValueChange={(v) => setInstitutionType(v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Select institution type" /></SelectTrigger>
              <SelectContent className="max-h-96">
                <SelectItem value="none">— None —</SelectItem>
                {INSTITUTION_CATEGORIES.map(cat => (
                  <div key={cat}>
                    <div className="px-2 py-1.5 text-xs font-bold uppercase text-muted-foreground bg-muted/50">{cat}</div>
                    {INSTITUTION_TYPES_BY_CATEGORY[cat].map(t => (
                      <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Required column{cfg.required.length > 1 ? "s" : ""}: <code>{cfg.required.join(", ")}</code>.
          Optional: <code>{cfg.columns.filter(c => !cfg.required.includes(c)).join(", ")}</code>.
          {target === "schools" && " Missing districts will be auto-created under the matching province."}
        </p>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={downloadTemplate}><Download className="w-4 h-4 mr-2" /> Download template (.xlsx)</Button>
          <label className="inline-flex">
            <input type="file" accept=".csv,.xlsx,.xls" hidden onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <Button asChild><span><Upload className="w-4 h-4 mr-2" /> Choose file</span></Button>
          </label>
          {filename && <span className="text-sm self-center text-muted-foreground">{filename} — {preview.length} rows parsed</span>}
        </div>
      </div>

      {preview.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="p-4 flex justify-between items-center bg-muted">
            <span className="font-medium">
              Preview (first 20 rows) → <strong>{cfg.label}</strong>
              {institutionType && <span className="text-muted-foreground"> · tagged as {institutionType}</span>}
            </span>
            <Button onClick={importNow}>Import {preview.length} rows</Button>
          </div>
          <div className="overflow-x-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow>{Object.keys(preview[0]).slice(0, 8).map(k => <TableHead key={k}>{k}</TableHead>)}</TableRow>
              </TableHeader>
              <TableBody>
                {preview.slice(0, 20).map((r, i) => (
                  <TableRow key={i}>
                    {Object.keys(preview[0]).slice(0, 8).map(k => <TableCell key={k} className="text-xs">{String(r[k] ?? "")}</TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stakeholders;
