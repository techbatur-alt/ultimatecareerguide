import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS, ROLES, type AppRole } from "@/lib/roleUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users as UsersIcon, Plus, Search, KeyRound, Power, Trash2, RefreshCw, Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface ProfileRow {
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

const ASSIGNABLE_ROLES: AppRole[] = [
  "subscriber", "stakeholder", "service", "support", "sales_agent", "executive",
];

const roleBadgeCls = (role: string) => {
  const lvl = ROLES[role as AppRole] ?? 0;
  if (lvl >= 6) return "bg-primary text-primary-foreground";
  if (lvl >= 4) return "bg-amber-500/20 text-amber-700 border-amber-500/30";
  if (lvl >= 3) return "bg-emerald-500/20 text-emerald-700 border-emerald-500/30";
  if (lvl >= 2) return "bg-secondary text-secondary-foreground";
  return "bg-muted text-muted-foreground";
};

const AdminUsers = () => {
  const { user, role: callerRole } = useAuth();
  const callerId = user?.id ?? "";
  const isExecutive = callerRole === "executive";

  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: "", first_name: "", last_name: "", role: "subscriber" as AppRole,
  });
  const [creating, setCreating] = useState(false);

  // Edit dialog state
  const [editTarget, setEditTarget] = useState<ProfileRow | null>(null);
  const [editRole, setEditRole] = useState<AppRole>("subscriber");
  const [savingEdit, setSavingEdit] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,first_name,last_name,nickname,role,is_active,mobile_1,created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) toast.error(error.message);
    setRows((data ?? []) as ProfileRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.email, r.first_name, r.last_name, r.nickname, r.mobile_1, r.role]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q)),
    );
  }, [rows, search]);

  const callAdmin = async (action: string, payload: Record<string, unknown> = {}) => {
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action, ...payload },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const handleCreate = async () => {
    if (!createForm.email) {
      toast.error("Email is required");
      return;
    }
    setCreating(true);
    try {
      const result = await callAdmin("create_user", createForm);
      if (result?.invite_sent) {
        toast.success("Invite sent — user will receive an email to set their password");
      } else {
        toast.success("User created. The user can set a password through the password setup flow.");
      }
      setCreateOpen(false);
      setCreateForm({ email: "", first_name: "", last_name: "", role: "subscriber" });
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleResetPassword = async (row: ProfileRow) => {
    setBusyId(row.id);
    try {
      await callAdmin("reset_password", { user_id: row.id });
      toast.success(`Password reset email sent to ${row.email}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = async (row: ProfileRow) => {
    setBusyId(row.id);
    try {
      await callAdmin("toggle_active", { user_id: row.id, is_active: !row.is_active });
      toast.success(row.is_active ? "User deactivated" : "User reactivated");
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (row: ProfileRow) => {
    setBusyId(row.id);
    try {
      await callAdmin("delete_user", { user_id: row.id });
      toast.success("User deleted");
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const openEdit = (row: ProfileRow) => {
    setEditTarget(row);
    setEditRole((row.role as AppRole) || "subscriber");
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    setSavingEdit(true);
    try {
      if (editRole !== editTarget.role) {
        await callAdmin("update_role", { user_id: editTarget.id, role: editRole });
      }
      toast.success("User updated");
      setEditTarget(null);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSavingEdit(false);
    }
  };

  const stats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((r) => r.is_active).length;
    const staff = rows.filter((r) => (ROLES[r.role as AppRole] ?? 0) >= 3).length;
    return { total, active, staff };
  }, [rows]);

  return (
    <div className="bg-muted min-h-[80vh]">
      {/* Header */}
      <section className="bg-secondary text-secondary-foreground py-8 border-b-4 border-primary">
        <div className="container">
          <div className="flex items-center gap-3 mb-2">
            <UsersIcon className="w-7 h-7 text-primary" />
            <p className="font-display text-sm uppercase tracking-widest text-primary">Admin</p>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-primary-foreground">
            User Management
          </h1>
          <p className="text-primary-foreground/70 mt-1">
            Create accounts, assign roles, reset passwords and deactivate users.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <StatBox label="Total Users" value={stats.total} />
            <StatBox label="Active" value={stats.active} />
            <StatBox label="Staff (L3+)" value={stats.staff} />
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="container py-6">
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search email, name, mobile or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4" />
                  New User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create new user</DialogTitle>
                  <DialogDescription>
                    The user will receive an email to set their password.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="c-email">Email *</Label>
                    <Input
                      id="c-email" type="email" value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="c-first">First name</Label>
                      <Input
                        id="c-first" value={createForm.first_name}
                        onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="c-last">Last name</Label>
                      <Input
                        id="c-last" value={createForm.last_name}
                        onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select
                      value={createForm.role}
                      onValueChange={(v) => setCreateForm({ ...createForm, role: v as AppRole })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ASSIGNABLE_ROLES
                          .filter((r) => r !== "executive" || isExecutive)
                          .map((r) => (
                            <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={creating}>
                    {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create &amp; Send Invite
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl mt-4 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No users match your search.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => {
                  const isSelf = row.id === callerId;
                  const fullName = `${row.first_name} ${row.last_name}`.trim() || row.nickname || "—";
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="font-medium">{fullName}</div>
                        {row.nickname && row.nickname !== fullName && (
                          <div className="text-xs text-muted-foreground">@{row.nickname}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{row.email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.mobile_1 || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={roleBadgeCls(row.role)}>
                          {ROLE_LABELS[row.role as AppRole] ?? row.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {row.is_active ? (
                          <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground">
                            Inactive
                          </Badge>
                        )}
                        {isSelf && (
                          <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm" variant="ghost"
                            onClick={() => openEdit(row)}
                            disabled={busyId === row.id}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm" variant="ghost"
                            onClick={() => handleResetPassword(row)}
                            disabled={busyId === row.id}
                            title="Send password reset email"
                          >
                            <KeyRound className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm" variant="ghost"
                                disabled={busyId === row.id || isSelf}
                                title={row.is_active ? "Deactivate" : "Reactivate"}
                              >
                                <Power className={`w-4 h-4 ${row.is_active ? "text-destructive" : "text-emerald-600"}`} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {row.is_active ? "Deactivate user?" : "Reactivate user?"}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {row.is_active
                                    ? `${row.email} will be unable to sign in until reactivated.`
                                    : `${row.email} will regain access immediately.`}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleToggleActive(row)}>
                                  {row.is_active ? "Deactivate" : "Reactivate"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          {isExecutive && !isSelf && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" disabled={busyId === row.id} title="Delete">
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete user permanently?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This permanently removes {row.email} and all associated data. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(row)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>{editTarget?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Role</Label>
              <Select
                value={editRole}
                onValueChange={(v) => setEditRole(v as AppRole)}
                disabled={editTarget?.id === callerId}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES
                    .filter((r) => r !== "executive" || isExecutive)
                    .map((r) => (
                      <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {editTarget?.id === callerId && (
                <p className="text-xs text-muted-foreground mt-1">You cannot change your own role.</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              To update profile details (name, address, etc.), the user can edit their own profile page.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={savingEdit}>
              {savingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const StatBox = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-primary-foreground/10 border border-primary-foreground/20 rounded-xl p-4 text-center">
    <p className="font-display text-3xl font-black text-primary">{value}</p>
    <p className="text-xs text-primary-foreground/70 uppercase tracking-wider">{label}</p>
  </div>
);

export default AdminUsers;
