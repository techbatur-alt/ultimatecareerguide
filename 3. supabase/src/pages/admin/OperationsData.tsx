import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Building2, School, Warehouse } from "lucide-react";

type EntityRow = {
  id: string;
  entity_type: string;
  entity_name: string;
  province?: string | null;
  district?: string | null;
  municipality?: string | null;
  city?: string | null;
  status?: string | null;
  created_at?: string | null;
};

type SchoolRow = {
  id: string;
  entity_name?: string | null;
  emis_number?: string | null;
  school_type?: string | null;
  phase?: string | null;
  principal_name?: string | null;
  principal_contact?: string | null;
  number_of_learners?: number | null;
  number_of_educators?: number | null;
  department_region?: string | null;
  circuit?: string | null;
  follow_up_required?: boolean | null;
  last_visit_date?: string | null;
};

type WarehouseRow = {
  id: string;
  entity_name?: string | null;
  warehouse_code?: string | null;
  warehouse_tier?: number | null;
  storage_capacity_sqm?: number | null;
  current_stock_level_ucg_sets?: number | null;
  manager_name?: string | null;
  manager_phone?: string | null;
  manager_email?: string | null;
};

const OperationsData = () => {
  const [tab, setTab] = useState("entities");
  const [entities, setEntities] = useState<EntityRow[]>([]);
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [entitiesRes, schoolsRes, warehousesRes] = await Promise.all([
      supabase.from("entities").select("*").order("created_at", { ascending: false }),
      supabase.from("schools").select("*, entities!schools_id_fkey(entity_name)").order("created_at", { ascending: false }),
      supabase.from("warehouses").select("*, entities!warehouses_id_fkey(entity_name)").order("created_at", { ascending: false }),
    ]);

    const entityRows = (entitiesRes.data ?? []) as EntityRow[];
    const schoolRows = (schoolsRes.data ?? []).map((row: any) => ({
      ...row,
      entity_name: row.entities?.entity_name ?? null,
    })) as SchoolRow[];
    const warehouseRows = (warehousesRes.data ?? []).map((row: any) => ({
      ...row,
      entity_name: row.entities?.entity_name ?? null,
    })) as WarehouseRow[];

    setEntities(entityRows);
    setSchools(schoolRows);
    setWarehouses(warehouseRows);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const summary = useMemo(() => ({
    schools: schools.length,
    warehouses: warehouses.length,
    entities: entities.length,
  }), [entities.length, schools.length, warehouses.length]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">Operations data</p>
        <h1 className="font-display text-3xl font-black">Master data</h1>
        <p className="text-muted-foreground">Create and view the first operational records for schools, warehouses, and supporting entities.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Entities" value={summary.entities} icon={Building2} />
        <StatCard title="Schools" value={summary.schools} icon={School} />
        <StatCard title="Warehouses" value={summary.warehouses} icon={Warehouse} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="schools">Schools</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
        </TabsList>

        <TabsContent value="entities" className="mt-4">
          <EntitiesTab entities={entities} loading={loading} reload={load} />
        </TabsContent>
        <TabsContent value="schools" className="mt-4">
          <SchoolsTab schools={schools} loading={loading} reload={load} />
        </TabsContent>
        <TabsContent value="warehouses" className="mt-4">
          <WarehousesTab warehouses={warehouses} loading={loading} reload={load} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon }: { title: string; value: number; icon: typeof Building2 }) => (
  <div className="rounded-xl border bg-card p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
      <div className="rounded-lg bg-primary/10 p-2 text-primary">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

const EntitiesTab = ({ entities, loading, reload }: { entities: EntityRow[]; loading: boolean; reload: () => void }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ entity_type: "school", entity_name: "", province: "", district: "", municipality: "", city: "", postal_code: "", status: "active" });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!form.entity_name) {
      toast.error("Entity name is required");
      return;
    }

    setBusy(true);
    const { data, error } = await supabase.from("entities").insert({
      entity_type: form.entity_type,
      entity_name: form.entity_name,
      province: form.province || null,
      district: form.district || null,
      municipality: form.municipality || null,
      city: form.city || null,
      postal_code: form.postal_code || null,
      status: form.status,
    }).select().single();
    setBusy(false);

    if (error || !data) {
      toast.error(error?.message || "Could not create entity");
      return;
    }

    toast.success(`${form.entity_name} created`);
    setOpen(false);
    setForm({ entity_type: "school", entity_name: "", province: "", district: "", municipality: "", city: "", postal_code: "", status: "active" });
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New entity</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create entity</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Type</Label>
                <Select value={form.entity_type} onValueChange={(value) => setForm({ ...form, entity_type: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="sponsor">Sponsor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Entity name *</Label><Input value={form.entity_name} onChange={(e) => setForm({ ...form, entity_name: e.target.value })} /></div>
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>Province</Label><Input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} /></div>
                <div><Label>District</Label><Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /></div>
                <div><Label>Municipality</Label><Input value={form.municipality} onChange={(e) => setForm({ ...form, municipality: e.target.value })} /></div>
                <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              </div>
              <div><Label>Postal code</Label><Input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} /></div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={save} disabled={busy} className="w-full">{busy ? "Saving..." : "Save entity"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
            ) : entities.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No entities yet</TableCell></TableRow>
            ) : entities.map((entity) => (
              <TableRow key={entity.id}>
                <TableCell>{entity.entity_name}</TableCell>
                <TableCell><Badge variant="outline">{entity.entity_type}</Badge></TableCell>
                <TableCell>{[entity.province, entity.district, entity.city].filter(Boolean).join(", ") || "—"}</TableCell>
                <TableCell><Badge variant={entity.status === "active" ? "default" : "secondary"}>{entity.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const SchoolsTab = ({ schools, loading, reload }: { schools: SchoolRow[]; loading: boolean; reload: () => void }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ entity_name: "", province: "", district: "", municipality: "", city: "", postal_code: "", emis_number: "", school_type: "public", phase: "secondary", principal_name: "", principal_contact: "", number_of_learners: "", number_of_educators: "", department_region: "", circuit: "", follow_up_required: false, last_visit_date: "" });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!form.entity_name) {
      toast.error("School name is required");
      return;
    }

    setBusy(true);
    const { data: entityData, error: entityError } = await supabase.from("entities").insert({
      entity_type: "school",
      entity_name: form.entity_name,
      province: form.province || null,
      district: form.district || null,
      municipality: form.municipality || null,
      city: form.city || null,
      postal_code: form.postal_code || null,
      status: "active",
    }).select().single();

    if (entityError || !entityData) {
      setBusy(false);
      toast.error(entityError?.message || "Could not create school entity");
      return;
    }

    const { error: schoolError } = await supabase.from("schools").insert({
      id: entityData.id,
      emis_number: form.emis_number || null,
      school_type: form.school_type || null,
      phase: form.phase || null,
      principal_name: form.principal_name || null,
      principal_contact: form.principal_contact || null,
      number_of_learners: form.number_of_learners ? Number(form.number_of_learners) : null,
      number_of_educators: form.number_of_educators ? Number(form.number_of_educators) : null,
      department_region: form.department_region || null,
      circuit: form.circuit || null,
      follow_up_required: form.follow_up_required,
      last_visit_date: form.last_visit_date || null,
    });

    setBusy(false);

    if (schoolError) {
      toast.error(schoolError.message);
      return;
    }

    toast.success(`${form.entity_name} saved`);
    setOpen(false);
    setForm({ entity_name: "", province: "", district: "", municipality: "", city: "", postal_code: "", emis_number: "", school_type: "public", phase: "secondary", principal_name: "", principal_contact: "", number_of_learners: "", number_of_educators: "", department_region: "", circuit: "", follow_up_required: false, last_visit_date: "" });
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add school</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>New school</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>School name *</Label><Input value={form.entity_name} onChange={(e) => setForm({ ...form, entity_name: e.target.value })} /></div>
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>EMIS number</Label><Input value={form.emis_number} onChange={(e) => setForm({ ...form, emis_number: e.target.value })} /></div>
                <div>
                  <Label>Type</Label>
                  <Select value={form.school_type} onValueChange={(value) => setForm({ ...form, school_type: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="special">Special</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Phase</Label>
                  <Select value={form.phase} onValueChange={(value) => setForm({ ...form, phase: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="combined">Combined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Department region</Label><Input value={form.department_region} onChange={(e) => setForm({ ...form, department_region: e.target.value })} /></div>
                <div><Label>Circuit</Label><Input value={form.circuit} onChange={(e) => setForm({ ...form, circuit: e.target.value })} /></div>
                <div><Label>Last visit date</Label><Input type="date" value={form.last_visit_date} onChange={(e) => setForm({ ...form, last_visit_date: e.target.value })} /></div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>Principal</Label><Input value={form.principal_name} onChange={(e) => setForm({ ...form, principal_name: e.target.value })} /></div>
                <div><Label>Principal contact</Label><Input value={form.principal_contact} onChange={(e) => setForm({ ...form, principal_contact: e.target.value })} /></div>
                <div><Label>Learners</Label><Input type="number" value={form.number_of_learners} onChange={(e) => setForm({ ...form, number_of_learners: e.target.value })} /></div>
                <div><Label>Educators</Label><Input type="number" value={form.number_of_educators} onChange={(e) => setForm({ ...form, number_of_educators: e.target.value })} /></div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>Province</Label><Input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} /></div>
                <div><Label>District</Label><Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /></div>
                <div><Label>Municipality</Label><Input value={form.municipality} onChange={(e) => setForm({ ...form, municipality: e.target.value })} /></div>
                <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={form.follow_up_required} onCheckedChange={(checked) => setForm({ ...form, follow_up_required: checked === true })} />
                <Label>Follow-up required</Label>
              </div>
              <Button onClick={save} disabled={busy} className="w-full">{busy ? "Saving..." : "Save school"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>School</TableHead>
              <TableHead>EMIS</TableHead>
              <TableHead>Phase</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Follow-up</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
            ) : schools.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No schools yet</TableCell></TableRow>
            ) : schools.map((school) => (
              <TableRow key={school.id}>
                <TableCell>{school.entity_name || "—"}</TableCell>
                <TableCell>{school.emis_number || "—"}</TableCell>
                <TableCell>{school.phase || "—"}</TableCell>
                <TableCell>{[school.department_region, school.circuit].filter(Boolean).join(", ") || "—"}</TableCell>
                <TableCell><Badge variant={school.follow_up_required ? "destructive" : "secondary"}>{school.follow_up_required ? "Required" : "No"}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const WarehousesTab = ({ warehouses, loading, reload }: { warehouses: WarehouseRow[]; loading: boolean; reload: () => void }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ entity_name: "", province: "", district: "", municipality: "", city: "", postal_code: "", warehouse_code: "", warehouse_tier: "2", storage_capacity_sqm: "", current_stock_level_ucg_sets: "", manager_name: "", manager_phone: "", manager_email: "" });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!form.entity_name) {
      toast.error("Warehouse name is required");
      return;
    }

    setBusy(true);
    const { data: entityData, error: entityError } = await supabase.from("entities").insert({
      entity_type: "warehouse",
      entity_name: form.entity_name,
      province: form.province || null,
      district: form.district || null,
      municipality: form.municipality || null,
      city: form.city || null,
      postal_code: form.postal_code || null,
      status: "active",
    }).select().single();

    if (entityError || !entityData) {
      setBusy(false);
      toast.error(entityError?.message || "Could not create warehouse entity");
      return;
    }

    const { error: warehouseError } = await supabase.from("warehouses").insert({
      id: entityData.id,
      warehouse_code: form.warehouse_code || null,
      warehouse_tier: form.warehouse_tier ? Number(form.warehouse_tier) : null,
      storage_capacity_sqm: form.storage_capacity_sqm ? Number(form.storage_capacity_sqm) : null,
      current_stock_level_ucg_sets: form.current_stock_level_ucg_sets ? Number(form.current_stock_level_ucg_sets) : 0,
      manager_name: form.manager_name || null,
      manager_phone: form.manager_phone || null,
      manager_email: form.manager_email || null,
    });

    setBusy(false);

    if (warehouseError) {
      toast.error(warehouseError.message);
      return;
    }

    toast.success(`${form.entity_name} saved`);
    setOpen(false);
    setForm({ entity_name: "", province: "", district: "", municipality: "", city: "", postal_code: "", warehouse_code: "", warehouse_tier: "2", storage_capacity_sqm: "", current_stock_level_ucg_sets: "", manager_name: "", manager_phone: "", manager_email: "" });
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add warehouse</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>New warehouse</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Warehouse name *</Label><Input value={form.entity_name} onChange={(e) => setForm({ ...form, entity_name: e.target.value })} /></div>
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>Warehouse code</Label><Input value={form.warehouse_code} onChange={(e) => setForm({ ...form, warehouse_code: e.target.value })} /></div>
                <div>
                  <Label>Tier</Label>
                  <Select value={form.warehouse_tier} onValueChange={(value) => setForm({ ...form, warehouse_tier: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Tier 1</SelectItem>
                      <SelectItem value="2">Tier 2</SelectItem>
                      <SelectItem value="3">Tier 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Storage capacity (sqm)</Label><Input type="number" value={form.storage_capacity_sqm} onChange={(e) => setForm({ ...form, storage_capacity_sqm: e.target.value })} /></div>
                <div><Label>Current stock (UCG sets)</Label><Input type="number" value={form.current_stock_level_ucg_sets} onChange={(e) => setForm({ ...form, current_stock_level_ucg_sets: e.target.value })} /></div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>Manager</Label><Input value={form.manager_name} onChange={(e) => setForm({ ...form, manager_name: e.target.value })} /></div>
                <div><Label>Manager phone</Label><Input value={form.manager_phone} onChange={(e) => setForm({ ...form, manager_phone: e.target.value })} /></div>
                <div><Label>Manager email</Label><Input type="email" value={form.manager_email} onChange={(e) => setForm({ ...form, manager_email: e.target.value })} /></div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>Province</Label><Input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} /></div>
                <div><Label>District</Label><Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /></div>
                <div><Label>Municipality</Label><Input value={form.municipality} onChange={(e) => setForm({ ...form, municipality: e.target.value })} /></div>
                <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              </div>
              <div><Label>Postal code</Label><Input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} /></div>
              <Button onClick={save} disabled={busy} className="w-full">{busy ? "Saving..." : "Save warehouse"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Warehouse</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Manager</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
            ) : warehouses.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No warehouses yet</TableCell></TableRow>
            ) : warehouses.map((warehouse) => (
              <TableRow key={warehouse.id}>
                <TableCell>{warehouse.entity_name || "—"}</TableCell>
                <TableCell>{warehouse.warehouse_code || "—"}</TableCell>
                <TableCell>{warehouse.warehouse_tier || "—"}</TableCell>
                <TableCell>{warehouse.current_stock_level_ucg_sets ?? 0}</TableCell>
                <TableCell>{warehouse.manager_name || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OperationsData;
