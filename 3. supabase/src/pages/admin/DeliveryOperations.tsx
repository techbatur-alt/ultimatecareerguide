import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, PackageCheck, Clock3 } from "lucide-react";
import { formatCurrency, getDeliveryStatusTone, safeCount } from "@/lib/phase2";

type DeliveryRow = {
  id: string;
  shipment_code: string;
  status?: string | null;
  expected_delivery_at?: string | null;
  delivered_at?: string | null;
  tracking_reference?: string | null;
  shipment_type?: string | null;
};

type EventRow = {
  id: string;
  shipment_id?: string | null;
  event_type?: string | null;
  occurred_at?: string | null;
  notes?: string | null;
};

const DeliveryOperations = () => {
  const [deliveries, setDeliveries] = useState<DeliveryRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [deliveriesRes, eventsRes] = await Promise.all([
        supabase.from("shipments").select("*").order("expected_delivery_at", { ascending: true }).limit(8),
        supabase.from("delivery_events").select("*").order("occurred_at", { ascending: false }).limit(8),
      ]);

      setDeliveries((deliveriesRes.data ?? []) as DeliveryRow[]);
      setEvents((eventsRes.data ?? []) as EventRow[]);
      setLoading(false);
    };

    void load();
  }, []);

  const summary = useMemo(() => ({
    pending: deliveries.filter((d) => (d.status ?? "").toLowerCase() !== "delivered").length,
    delivered: deliveries.filter((d) => (d.status ?? "").toLowerCase() === "delivered").length,
    events: safeCount({ count: events.length }),
  }), [deliveries, events.length]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">Fulfillment</p>
        <h1 className="font-display text-3xl font-black">Delivery operations</h1>
        <p className="text-muted-foreground">Review in-transit shipments and the latest delivery events.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending deliveries</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-black">{summary.pending}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Delivered</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-black">{summary.delivered}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Delivery events</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-black">{summary.events}</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /> Shipment watchlist</CardTitle>
            <CardDescription>Recent fulfillment activity for distribution shipments.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Tracking</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
                  ) : deliveries.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No shipments yet</TableCell></TableRow>
                  ) : deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>{delivery.shipment_code}</TableCell>
                      <TableCell><Badge variant="outline" className={getDeliveryStatusTone(delivery.status)}>{delivery.status || "planned"}</Badge></TableCell>
                      <TableCell>{delivery.expected_delivery_at ? new Date(delivery.expected_delivery_at).toLocaleDateString() : "—"}</TableCell>
                      <TableCell>{delivery.tracking_reference || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PackageCheck className="h-5 w-5 text-primary" /> Delivery events</CardTitle>
            <CardDescription>Latest timestamps, scan events, and delivery notes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No delivery events yet.</p>
            ) : events.map((event) => (
              <div key={event.id} className="rounded-lg border bg-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{event.event_type || "Event"}</p>
                  <Badge variant="secondary"><Clock3 className="mr-1 h-3 w-3" />{event.occurred_at ? new Date(event.occurred_at).toLocaleString() : "—"}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{event.notes || "No notes recorded"}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryOperations;
