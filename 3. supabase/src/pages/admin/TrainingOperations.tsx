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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, GraduationCap, Users } from "lucide-react";

type SessionRow = {
  id: string;
  session_title: string;
  session_type?: string | null;
  province?: string | null;
  district?: string | null;
  venue_name?: string | null;
  scheduled_at?: string | null;
  status?: string | null;
  attendee_count?: number | null;
  organizer_name?: string | null;
};

type AttendeeRow = {
  id: string;
  session_id: string;
  school_name?: string | null;
  attendance_status?: string | null;
  registered_at?: string | null;
};

type ProgrammeRow = {
  id: string;
  name: string;
  sponsor_name?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
};

const TrainingOperations = () => {
  const [tab, setTab] = useState("sessions");
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [attendees, setAttendees] = useState<AttendeeRow[]>([]);
  const [programmes, setProgrammes] = useState<ProgrammeRow[]>([]);
  const [entities, setEntities] = useState<{ id: string; entity_name: string }[]>([]);
  const [schools, setSchools] = useState<{ id: string; entity_name: string }[]>([]);
  const [sponsors, setSponsors] = useState<{ id: string; entity_name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [sessionsRes, attendeesRes, programmesRes, entitiesRes, schoolsRes, sponsorsRes] = await Promise.all([
      supabase.from("training_sessions").select("*, entities!training_sessions_organizer_id_fkey(entity_name)").order("scheduled_at", { ascending: false }),
      supabase.from("training_attendees").select("*, schools!training_attendees_school_id_fkey(id, entities!schools_id_fkey(entity_name))").order("registered_at", { ascending: false }),
      supabase.from("event_programmes").select("*, sponsors!event_programmes_sponsor_id_fkey(id, entities!sponsors_id_fkey(entity_name))").order("start_date", { ascending: false }),
      supabase.from("entities").select("id, entity_name").order("created_at", { ascending: false }),
      supabase.from("schools").select("id, entities!schools_id_fkey(entity_name)").order("created_at", { ascending: false }),
      supabase.from("sponsors").select("id, entities!sponsors_id_fkey(entity_name)").order("created_at", { ascending: false }),
    ]);

    const mappedSessions = (sessionsRes.data ?? []).map((row: any) => ({
      ...row,
      organizer_name: row.entities?.entity_name ?? null,
    })) as SessionRow[];

    const mappedAttendees = (attendeesRes.data ?? []).map((row: any) => ({
      ...row,
      school_name: row.schools?.entities?.entity_name ?? null,
    })) as AttendeeRow[];

    const mappedProgrammes = (programmesRes.data ?? []).map((row: any) => ({
      ...row,
      sponsor_name: row.sponsors?.entities?.entity_name ?? null,
    })) as ProgrammeRow[];

    setSessions(mappedSessions);
    setAttendees(mappedAttendees);
    setProgrammes(mappedProgrammes);
    setEntities((entitiesRes.data ?? []).map((row: any) => ({ id: row.id, entity_name: row.entity_name })));
    setSchools((schoolsRes.data ?? []).map((row: any) => ({ id: row.id, entity_name: row.entities?.entity_name ?? "" })));
    setSponsors((sponsorsRes.data ?? []).map((row: any) => ({ id: row.id, entity_name: row.entities?.entity_name ?? "" })));
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">Training & engagement</p>
        <h1 className="font-display text-3xl font-black">Training operations</h1>
        <p className="text-muted-foreground">Plan sessions, capture school attendance, and manage sponsor programmes.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="attendees">Attendees</TabsTrigger>
          <TabsTrigger value="programmes">Programmes</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-4">
          <SessionsTab sessions={sessions} entities={entities} loading={loading} reload={load} />
        </TabsContent>
        <TabsContent value="attendees" className="mt-4">
          <AttendeesTab attendees={attendees} schools={schools} loading={loading} reload={load} />
        </TabsContent>
        <TabsContent value="programmes" className="mt-4">
          <ProgrammesTab programmes={programmes} sponsors={sponsors} loading={loading} reload={load} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const SessionsTab = ({ sessions, entities, loading, reload }: { sessions: SessionRow[]; entities: { id: string; entity_name: string }[]; loading: boolean; reload: () => void }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ organizer_id: "", session_title: "", session_type: "workshop", province: "", district: "", venue_name: "", scheduled_at: "", status: "planned", attendee_count: "0" });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!form.session_title) {
      toast.error("Session title is required");
      return;
    }

    setBusy(true);
    const { error } = await supabase.from("training_sessions").insert({
      organizer_id: form.organizer_id || null,
      session_title: form.session_title,
      session_type: form.session_type,
      province: form.province || null,
      district: form.district || null,
      venue_name: form.venue_name || null,
      scheduled_at: form.scheduled_at || null,
      status: form.status,
      attendee_count: Number(form.attendee_count) || 0,
    });
    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Training session saved");
    setOpen(false);
    setForm({ organizer_id: "", session_title: "", session_type: "workshop", province: "", district: "", venue_name: "", scheduled_at: "", status: "planned", attendee_count: "0" });
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add session</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>New training session</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Session title *</Label><Input value={form.session_title} onChange={(e) => setForm({ ...form, session_title: e.target.value })} /></div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Organizer</Label>
                  <Select value={form.organizer_id} onValueChange={(value) => setForm({ ...form, organizer_id: value })}>
                    <SelectTrigger><SelectValue placeholder="Choose organizer" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {entities.map((entity) => <SelectItem key={entity.id} value={entity.id}>{entity.entity_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Session type</Label>
                  <Select value={form.session_type} onValueChange={(value) => setForm({ ...form, session_type: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="launch">Launch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Province</Label><Input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} /></div>
                <div><Label>District</Label><Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /></div>
                <div><Label>Venue</Label><Input value={form.venue_name} onChange={(e) => setForm({ ...form, venue_name: e.target.value })} /></div>
                <div><Label>Scheduled at</Label><Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} /></div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Expected attendees</Label><Input type="number" value={form.attendee_count} onChange={(e) => setForm({ ...form, attendee_count: e.target.value })} /></div>
              </div>
              <Button onClick={save} disabled={busy} className="w-full">{busy ? "Saving..." : "Save session"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Organizer</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
            ) : sessions.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No sessions yet</TableCell></TableRow>
            ) : sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>{session.session_title}</TableCell>
                <TableCell>{session.organizer_name || "—"}</TableCell>
                <TableCell>{[session.province, session.district, session.venue_name].filter(Boolean).join(", ") || "—"}</TableCell>
                <TableCell><Badge variant={session.status === "completed" ? "default" : "secondary"}>{session.status}</Badge></TableCell>
                <TableCell>{session.scheduled_at ? new Date(session.scheduled_at).toLocaleString() : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const AttendeesTab = ({ attendees, schools, loading, reload }: { attendees: AttendeeRow[]; schools: { id: string; entity_name: string }[]; loading: boolean; reload: () => void }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ session_id: "", school_id: "", attendance_status: "registered" });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!form.school_id) {
      toast.error("School is required");
      return;
    }

    setBusy(true);
    const { error } = await supabase.from("training_attendees").insert({
      school_id: form.school_id,
      attendance_status: form.attendance_status,
    });
    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Attendee registered");
    setOpen(false);
    setForm({ session_id: "", school_id: "", attendance_status: "registered" });
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Register attendee</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New attendee</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>School</Label><Select value={form.school_id} onValueChange={(value) => setForm({ ...form, school_id: value })}><SelectTrigger><SelectValue placeholder="Choose school" /></SelectTrigger><SelectContent>{schools.map((school) => <SelectItem key={school.id} value={school.id}>{school.entity_name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Status</Label><Select value={form.attendance_status} onValueChange={(value) => setForm({ ...form, attendance_status: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="registered">Registered</SelectItem><SelectItem value="attended">Attended</SelectItem><SelectItem value="absent">Absent</SelectItem></SelectContent></Select></div>
              <Button onClick={save} disabled={busy} className="w-full">{busy ? "Saving..." : "Save attendee"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>School</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
            ) : attendees.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No attendees yet</TableCell></TableRow>
            ) : attendees.map((attendee) => (
              <TableRow key={attendee.id}>
                <TableCell>{attendee.school_name || "—"}</TableCell>
                <TableCell><Badge variant={attendee.attendance_status === "attended" ? "default" : "secondary"}>{attendee.attendance_status}</Badge></TableCell>
                <TableCell>{attendee.registered_at ? new Date(attendee.registered_at).toLocaleString() : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const ProgrammesTab = ({ programmes, sponsors, loading, reload }: { programmes: ProgrammeRow[]; sponsors: { id: string; entity_name: string }[]; loading: boolean; reload: () => void }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ sponsor_id: "", name: "", start_date: "", end_date: "", status: "planned" });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!form.name) {
      toast.error("Programme name is required");
      return;
    }

    setBusy(true);
    const { error } = await supabase.from("event_programmes").insert({
      sponsor_id: form.sponsor_id || null,
      name: form.name,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      status: form.status,
    });
    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Programme saved");
    setOpen(false);
    setForm({ sponsor_id: "", name: "", start_date: "", end_date: "", status: "planned" });
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add programme</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New programme</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Programme name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div>
                <Label>Sponsor</Label>
                <Select value={form.sponsor_id} onValueChange={(value) => setForm({ ...form, sponsor_id: value })}>
                  <SelectTrigger><SelectValue placeholder="Choose sponsor" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {sponsors.map((sponsor) => <SelectItem key={sponsor.id} value={sponsor.id}>{sponsor.entity_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>Start date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
                <div><Label>End date</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={save} disabled={busy} className="w-full">{busy ? "Saving..." : "Save programme"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Sponsor</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
            ) : programmes.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No programmes yet</TableCell></TableRow>
            ) : programmes.map((programme) => (
              <TableRow key={programme.id}>
                <TableCell>{programme.name}</TableCell>
                <TableCell>{programme.sponsor_name || "—"}</TableCell>
                <TableCell>{[programme.start_date, programme.end_date].filter(Boolean).join(" → ") || "—"}</TableCell>
                <TableCell><Badge variant={programme.status === "completed" ? "default" : "secondary"}>{programme.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TrainingOperations;
