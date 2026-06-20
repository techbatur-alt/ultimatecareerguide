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
import { Plus, Package, Truck, ClipboardList } from "lucide-react";

type InventoryRow = {
  id: string;
  item_type: string;
  item_code: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_dispatched: number;
  unit_cost: number;
  warehouse_id: string | null;
  warehouse_name?: string | null;
};

type ShipmentRow = {
  id: string;
  shipment_code: string;
  status: string;
  shipment_type: string;
  sender_warehouse_id: string | null;
  recipient_entity_id: string | null;
  tracking_reference?: string | null;
  expected_delivery_at?: string | null;
  delivered_at?: string | null;
  warehouse_name?: string | null;
  recipient_name?: string | null;
};

type EventRow = {
  id: string;
  shipment_id: string;
  event_type: string;
  occurred_at: string;
  actor_name?: string | null;
  notes?: string | null;
};

const FulfillmentOperations = () => {
  const [tab, setTab] = useState("inventory");
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [shipments, setShipments] = useState<ShipmentRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; entity_name: string }[]>([]);
  const [entities, setEntities] = useState<{ id: string; entity_name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [inventoryRes, shipmentsRes, eventsRes, warehousesRes, entitiesRes] = await Promise.all([
      supabase.from("inventory_items").select("*, warehouses!inventory_items_warehouse_id_fkey(id, entities!warehouses_id_fkey(entity_name))").order("created_at", { ascending: false }),
      supabase.from("shipments").select("*, warehouses!shipments_sender_warehouse_id_fkey(id, entities!warehouses_id_fkey(entity_name)), entities!shipments_recipient_entity_id_fkey(id, entity_name)").order("created_at", { ascending: false }),
      supabase.from("delivery_events").select("*").order("occurred_at", { ascending: false }),
      supabase.from("warehouses").select("id, entities!warehouses_id_fkey(entity_name)").order("created_at", { ascending: false }),
      supabase.from("entities").select("id, entity_name").order("created_at", { ascending: false }),
    ]);

    const mappedInventory = (inventoryRes.data ?? []).map((row: any) => ({
      ...row,
      warehouse_name: row.warehouses?.entities?.entity_name ?? null,
    })) as InventoryRow[];

    const mappedShipments = (shipmentsRes.data ?? []).map((row: any) => ({
      ...row,
      warehouse_name: row.warehouses?.entities?.entity_name ?? null,
      recipient_name: row.entities?.entity_name ?? null,
    })) as ShipmentRow[];

    setInventory(mappedInventory);
    setShipments(mappedShipments);
    setEvents(eventsRes.data ?? []);
    setWarehouses((warehousesRes.data ?? []).map((row: any) => ({ id: row.id, entity_name: row.entities?.entity_name ?? "" })));
    setEntities((entitiesRes.data ?? []).map((row: any) => ({ id: row.id, entity_name: row.entity_name })));
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">Fulfillment</p>
        <h1 className="font-display text-3xl font-black">Distribution operations</h1>
        <p className="text-muted-foreground">Track stock, dispatch shipments, and log delivery events from one workspace.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
          <TabsTrigger value="events">Delivery events</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-4">
          <InventoryTab inventory={inventory} warehouses={warehouses} loading={loading} reload={load} />
        </TabsContent>
        <TabsContent value="shipments" className="mt-4">
          <ShipmentsTab shipments={shipments} warehouses={warehouses} entities={entities} loading={loading} reload={load} />
        </TabsContent>
        <TabsContent value="events" className="mt-4">
          <EventsTab events={events} shipments={shipments} loading={loading} reload={load} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const InventoryTab = ({ inventory, warehouses, loading, reload }: { inventory: InventoryRow[]; warehouses: { id: string; entity_name: string }[]; loading: boolean; reload: () => void }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ warehouse_id: "", item_type: "UCG Set", item_code: "", quantity_available: "0", quantity_reserved: "0", quantity_dispatched: "0", unit_cost: "" });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!form.item_code) {
      toast.error("Item code is required");
      return;
    }

    setBusy(true);
    const { error } = await supabase.from("inventory_items").insert({
      warehouse_id: form.warehouse_id || null,
      item_type: form.item_type,
      item_code: form.item_code,
      quantity_available: Number(form.quantity_available) || 0,
      quantity_reserved: Number(form.quantity_reserved) || 0,
      quantity_dispatched: Number(form.quantity_dispatched) || 0,
      unit_cost: Number(form.unit_cost) || null,
    });
    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Inventory item saved");
    setOpen(false);
    setForm({ warehouse_id: "", item_type: "UCG Set", item_code: "", quantity_available: "0", quantity_reserved: "0", quantity_dispatched: "0", unit_cost: "" });
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add inventory item</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New inventory item</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Item code *</Label><Input value={form.item_code} onChange={(e) => setForm({ ...form, item_code: e.target.value })} /></div>
              <div><Label>Item type</Label><Input value={form.item_type} onChange={(e) => setForm({ ...form, item_type: e.target.value })} /></div>
              <div>
                <Label>Warehouse</Label>
                <Select value={form.warehouse_id} onValueChange={(value) => setForm({ ...form, warehouse_id: value })}>
                  <SelectTrigger><SelectValue placeholder="Choose warehouse" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {warehouses.map((warehouse) => <SelectItem key={warehouse.id} value={warehouse.id}>{warehouse.entity_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>Available</Label><Input type="number" value={form.quantity_available} onChange={(e) => setForm({ ...form, quantity_available: e.target.value })} /></div>
                <div><Label>Reserved</Label><Input type="number" value={form.quantity_reserved} onChange={(e) => setForm({ ...form, quantity_reserved: e.target.value })} /></div>
                <div><Label>Dispatched</Label><Input type="number" value={form.quantity_dispatched} onChange={(e) => setForm({ ...form, quantity_dispatched: e.target.value })} /></div>
                <div><Label>Unit cost</Label><Input type="number" value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost: e.target.value })} /></div>
              </div>
              <Button onClick={save} disabled={busy} className="w-full">{busy ? "Saving..." : "Save item"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Reserved</TableHead>
              <TableHead>Dispatched</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
            ) : inventory.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No inventory items yet</TableCell></TableRow>
            ) : inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.item_code} <span className="text-muted-foreground">({item.item_type})</span></TableCell>
                <TableCell>{item.warehouse_name || "—"}</TableCell>
                <TableCell>{item.quantity_available}</TableCell>
                <TableCell>{item.quantity_reserved}</TableCell>
                <TableCell>{item.quantity_dispatched}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const ShipmentsTab = ({ shipments, warehouses, entities, loading, reload }: { shipments: ShipmentRow[]; warehouses: { id: string; entity_name: string }[]; entities: { id: string; entity_name: string }[]; loading: boolean; reload: () => void }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ shipment_code: "", sender_warehouse_id: "", recipient_entity_id: "", shipment_type: "distribution", status: "planned", tracking_reference: "", expected_delivery_at: "" });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!form.shipment_code) {
      toast.error("Shipment code is required");
      return;
    }

    setBusy(true);
    const { error } = await supabase.from("shipments").insert({
      shipment_code: form.shipment_code,
      sender_warehouse_id: form.sender_warehouse_id || null,
      recipient_entity_id: form.recipient_entity_id || null,
      shipment_type: form.shipment_type,
      status: form.status,
      tracking_reference: form.tracking_reference || null,
      expected_delivery_at: form.expected_delivery_at || null,
    });
    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Shipment created");
    setOpen(false);
    setForm({ shipment_code: "", sender_warehouse_id: "", recipient_entity_id: "", shipment_type: "distribution", status: "planned", tracking_reference: "", expected_delivery_at: "" });
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Create shipment</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New shipment</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Shipment code *</Label><Input value={form.shipment_code} onChange={(e) => setForm({ ...form, shipment_code: e.target.value })} /></div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Sender warehouse</Label>
                  <Select value={form.sender_warehouse_id} onValueChange={(value) => setForm({ ...form, sender_warehouse_id: value })}>
                    <SelectTrigger><SelectValue placeholder="Choose warehouse" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {warehouses.map((warehouse) => <SelectItem key={warehouse.id} value={warehouse.id}>{warehouse.entity_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Recipient</Label>
                  <Select value={form.recipient_entity_id} onValueChange={(value) => setForm({ ...form, recipient_entity_id: value })}>
                    <SelectTrigger><SelectValue placeholder="Choose recipient" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {entities.map((entity) => <SelectItem key={entity.id} value={entity.id}>{entity.entity_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Shipment type</Label>
                  <Select value={form.shipment_type} onValueChange={(value) => setForm({ ...form, shipment_type: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distribution">Distribution</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="returns">Returns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="dispatched">Dispatched</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>Tracking reference</Label><Input value={form.tracking_reference} onChange={(e) => setForm({ ...form, tracking_reference: e.target.value })} /></div>
                <div><Label>Expected delivery</Label><Input type="datetime-local" value={form.expected_delivery_at} onChange={(e) => setForm({ ...form, expected_delivery_at: e.target.value })} /></div>
              </div>
              <Button onClick={save} disabled={busy} className="w-full">{busy ? "Saving..." : "Create shipment"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Delivery</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
            ) : shipments.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No shipments yet</TableCell></TableRow>
            ) : shipments.map((shipment) => (
              <TableRow key={shipment.id}>
                <TableCell>{shipment.shipment_code}</TableCell>
                <TableCell>{shipment.warehouse_name || "—"}</TableCell>
                <TableCell>{shipment.recipient_name || "—"}</TableCell>
                <TableCell><Badge variant={shipment.status === "delivered" ? "default" : "secondary"}>{shipment.status}</Badge></TableCell>
                <TableCell>{shipment.expected_delivery_at ? new Date(shipment.expected_delivery_at).toLocaleString() : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const EventsTab = ({ events, shipments, loading, reload }: { events: EventRow[]; shipments: ShipmentRow[]; loading: boolean; reload: () => void }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ shipment_id: "", event_type: "dispatched", actor_name: "", notes: "" });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!form.shipment_id) {
      toast.error("Shipment is required");
      return;
    }

    setBusy(true);
    const { error } = await supabase.from("delivery_events").insert({
      shipment_id: form.shipment_id,
      event_type: form.event_type,
      actor_name: form.actor_name || null,
      notes: form.notes || null,
    });
    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Delivery event logged");
    setOpen(false);
    setForm({ shipment_id: "", event_type: "dispatched", actor_name: "", notes: "" });
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Log delivery event</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New delivery event</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Shipment</Label>
                <Select value={form.shipment_id} onValueChange={(value) => setForm({ ...form, shipment_id: value })}>
                  <SelectTrigger><SelectValue placeholder="Choose shipment" /></SelectTrigger>
                  <SelectContent>
                    {shipments.map((shipment) => <SelectItem key={shipment.id} value={shipment.id}>{shipment.shipment_code}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Event type</Label>
                <Select value={form.event_type} onValueChange={(value) => setForm({ ...form, event_type: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dispatched">Dispatched</SelectItem>
                    <SelectItem value="in_transit">In transit</SelectItem>
                    <SelectItem value="arrived">Arrived</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Actor</Label><Input value={form.actor_name} onChange={(e) => setForm({ ...form, actor_name: e.target.value })} /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={save} disabled={busy} className="w-full">{busy ? "Saving..." : "Save event"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shipment</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Occurred at</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
            ) : events.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No delivery events yet</TableCell></TableRow>
            ) : events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{shipments.find((shipment) => shipment.id === event.shipment_id)?.shipment_code || "—"}</TableCell>
                <TableCell>{event.event_type}</TableCell>
                <TableCell>{event.actor_name || "—"}</TableCell>
                <TableCell>{new Date(event.occurred_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FulfillmentOperations;
