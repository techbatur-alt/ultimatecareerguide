import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { User, Mail, Phone, MapPin, Calendar, Shield, Users, Plus, Trash2, Edit2, Save, X, School, BookOpen, Camera } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfileData {
  salutation: string;
  first_name: string;
  last_name: string;
  nickname: string;
  email: string;
  secondary_email: string;
  id_number: string;
  mobile_1: string;
  mobile_2: string | null;
  telephone_home: string | null;
  telephone_work: string | null;
  home_address: string;
  work_address: string | null;
  date_of_birth: string | null;
  role: string;
  profile_picture_url: string | null;
}

interface SubProfile {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  email: string | null;
  mobile_1: string | null;
  mobile_2: string | null;
  telephone_home: string | null;
  telephone_work: string | null;
  home_address: string | null;
  work_address: string | null;
  profile_type: string;
  profile_picture_url: string | null;
  school_name: string;
  school_address: string;
  school_telephone: string;
  grade: string;
  subjects: string[];
}

interface Subscription {
  id: string;
  order_number: string;
  status: string;
  start_date: string;
  end_date: string;
  amount_paid: number;
}

const salutations = ["Mr", "Mrs", "Ms", "Dr", "Prof", "Rev", "Other"];
const grades = ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Post-Matric", "Other"];

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [subProfiles, setSubProfiles] = useState<SubProfile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ProfileData>>({});
  const [loading, setLoading] = useState(true);

  // Sub-profile form state
  const [showSubForm, setShowSubForm] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [subForm, setSubForm] = useState({
    first_name: "", last_name: "", nickname: "", email: "",
    mobile_1: "", mobile_2: "", telephone_home: "",
    school_telephone: "", home_address: "", school_name: "",
    school_address: "", grade: "", subjects: Array(10).fill("") as string[],
  });
  const [subPicFile, setSubPicFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { navigate("/login"); return; }
    if (user) fetchAll();
  }, [user, authLoading]);

  const fetchAll = async () => {
    setLoading(true);
    const [profileRes, subRes, subcrRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user!.id).single(),
      supabase.from("sub_profiles").select("*").eq("account_holder_id", user!.id),
      supabase.from("subscriptions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
    ]);
    if (profileRes.data) {
      const p = profileRes.data as any;
      setProfile(p); setEditForm(p);
    }
    if (subRes.data) setSubProfiles(subRes.data.map((sp: any) => ({ ...sp, subjects: sp.subjects || [] })));
    if (subcrRes.data) setSubscriptions(subcrRes.data as unknown as Subscription[]);
    setLoading(false);
  };

  const handleSave = async () => {
    const { error } = await supabase.from("profiles").update({
      salutation: editForm.salutation,
      first_name: editForm.first_name,
      last_name: editForm.last_name,
      nickname: editForm.nickname,
      secondary_email: (editForm as any).secondary_email || "",
      mobile_1: editForm.mobile_1,
      mobile_2: editForm.mobile_2,
      telephone_home: editForm.telephone_home,
      telephone_work: editForm.telephone_work,
      home_address: editForm.home_address,
      work_address: editForm.work_address,
    }).eq("id", user!.id);
    if (error) toast.error(error.message);
    else { toast.success("Profile updated!"); setEditing(false); fetchAll(); }
  };

  const openSubForm = (sp?: SubProfile) => {
    if (sp) {
      setEditingSubId(sp.id);
      setSubForm({
        first_name: sp.first_name, last_name: sp.last_name,
        nickname: sp.nickname || "", email: sp.email || "",
        mobile_1: sp.mobile_1 || "", mobile_2: sp.mobile_2 || "",
        telephone_home: sp.telephone_home || "",
        school_telephone: sp.school_telephone || "",
        home_address: sp.home_address || "",
        school_name: sp.school_name || "", school_address: sp.school_address || "",
        grade: sp.grade || "",
        subjects: [...(sp.subjects || []), ...Array(10).fill("")].slice(0, 10),
      });
    } else {
      setEditingSubId(null);
      setSubForm({
        first_name: "", last_name: "", nickname: "", email: "",
        mobile_1: "", mobile_2: "", telephone_home: "",
        school_telephone: "", home_address: "", school_name: "",
        school_address: "", grade: "", subjects: Array(10).fill(""),
      });
    }
    setSubPicFile(null);
    setShowSubForm(true);
  };

  const handleSubSave = async () => {
    if (!subForm.first_name || !subForm.last_name) {
      toast.error("First name and surname are required."); return;
    }
    const subjects = subForm.subjects.filter(s => s.trim() !== "");
    let pictureUrl = "";

    if (subPicFile) {
      const ext = subPicFile.name.split(".").pop();
      const path = `sub-profiles/${user!.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("evolumes").upload(path, subPicFile, { upsert: true });
      if (upErr) { toast.error("Failed to upload picture: " + upErr.message); return; }
      const { data: urlData } = supabase.storage.from("evolumes").getPublicUrl(path);
      pictureUrl = urlData.publicUrl;
    }

    const payload: any = {
      first_name: subForm.first_name,
      last_name: subForm.last_name,
      nickname: subForm.nickname,
      email: subForm.email,
      mobile_1: subForm.mobile_1,
      mobile_2: subForm.mobile_2,
      telephone_home: subForm.telephone_home,
      home_address: subForm.home_address,
      school_name: subForm.school_name,
      school_address: subForm.school_address,
      school_telephone: subForm.school_telephone,
      grade: subForm.grade,
      subjects,
    };
    if (pictureUrl) payload.profile_picture_url = pictureUrl;

    if (editingSubId) {
      const { error } = await supabase.from("sub_profiles").update(payload).eq("id", editingSubId);
      if (error) toast.error(error.message);
      else { toast.success("Sub-profile updated!"); setShowSubForm(false); fetchAll(); }
    } else {
      payload.account_holder_id = user!.id;
      payload.profile_type = "student";
      const { error } = await supabase.from("sub_profiles").insert(payload);
      if (error) toast.error(error.message);
      else { toast.success("Sub-profile created!"); setShowSubForm(false); fetchAll(); }
    }
  };

  const handleDeleteSub = async (id: string) => {
    const { error } = await supabase.from("sub_profiles").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Sub-profile deleted."); fetchAll(); }
  };

  const daysRemaining = subscriptions.length > 0 && subscriptions[0].status === "active"
    ? Math.max(0, Math.ceil((new Date(subscriptions[0].end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-display text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero banner */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero-graduates.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 to-primary/80" />
        <div className="container relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary-foreground/20 border-2 border-primary-foreground flex items-center justify-center overflow-hidden">
              {profile?.profile_picture_url ? (
                <img src={profile.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-primary-foreground" />
              )}
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-black text-primary-foreground">
                {profile?.salutation} {profile?.first_name} {profile?.last_name}
              </h1>
              <p className="text-primary-foreground/70">{profile?.email}</p>
              {daysRemaining > 0 && (
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary-foreground/20 text-primary-foreground text-xs font-display font-bold">
                  {daysRemaining} days remaining
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container py-10 max-w-4xl">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="profile" className="font-display"><User className="w-4 h-4 mr-1" /> My Profile</TabsTrigger>
            <TabsTrigger value="sub" className="font-display"><Users className="w-4 h-4 mr-1" /> Sub-Profiles</TabsTrigger>
            <TabsTrigger value="subscription" className="font-display"><Shield className="w-4 h-4 mr-1" /> Subscription</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold">Personal Information</h2>
                {!editing ? (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-1" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave}><Save className="w-4 h-4 mr-1" /> Save</Button>
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setEditForm(profile as ProfileData); }}><X className="w-4 h-4" /></Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Salutation", key: "salutation", icon: User },
                  { label: "First Name(s)", key: "first_name", icon: User },
                  { label: "Surname", key: "last_name", icon: User },
                  { label: "Nickname", key: "nickname", icon: User },
                  { label: "Email (Username)", key: "email", icon: Mail, disabled: true },
                  { label: "Secondary Email", key: "secondary_email", icon: Mail },
                  { label: "ID Number", key: "id_number", icon: Shield, disabled: true },
                  { label: "Mobile 1", key: "mobile_1", icon: Phone },
                  { label: "Mobile 2", key: "mobile_2", icon: Phone },
                  { label: "Tel (Home)", key: "telephone_home", icon: Phone },
                  { label: "Tel (Work)", key: "telephone_work", icon: Phone },
                  { label: "Home Address", key: "home_address", icon: MapPin },
                  { label: "Work Address", key: "work_address", icon: MapPin },
                ].map((field) => (
                  <div key={field.key}>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <field.icon className="w-3 h-3" /> {field.label}
                      {field.disabled && <span className="text-[10px] ml-1">(locked)</span>}
                    </Label>
                    {editing && !field.disabled ? (
                      <Input
                        value={(editForm as any)[field.key] || ""}
                        onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium bg-muted rounded-lg px-3 py-2">
                        {(profile as any)?.[field.key] || "—"}
                      </p>
                    )}
                  </div>
                ))}
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3" /> Date of Birth
                  </Label>
                  <p className="text-sm font-medium bg-muted rounded-lg px-3 py-2">
                    {profile?.date_of_birth || "—"}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Sub-profiles Tab */}
          <TabsContent value="sub">
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold">Student / Learner Profiles</h2>
                {subProfiles.length < 1 && !showSubForm && (
                  <Button size="sm" variant="outline" onClick={() => openSubForm()}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                )}
              </div>

              {showSubForm ? (
                <div className="space-y-6">
                  <h3 className="font-display text-lg font-bold">{editingSubId ? "Edit" : "Add"} Student / Learner</h3>
                  
                  {/* Profile picture */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-muted border-2 border-border flex items-center justify-center overflow-hidden">
                      {subPicFile ? (
                        <img src={URL.createObjectURL(subPicFile)} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <Label>Profile Picture</Label>
                      <Input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
                        if (file) setSubPicFile(file);
                      }} />
                      <p className="text-xs text-muted-foreground mt-1">Max 2MB, JPG/PNG</p>
                    </div>
                  </div>

                  {/* Personal details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>First Name(s) *</Label><Input value={subForm.first_name} onChange={(e) => setSubForm({ ...subForm, first_name: e.target.value })} required /></div>
                    <div><Label>Surname *</Label><Input value={subForm.last_name} onChange={(e) => setSubForm({ ...subForm, last_name: e.target.value })} required /></div>
                    <div><Label>Nickname</Label><Input value={subForm.nickname} onChange={(e) => setSubForm({ ...subForm, nickname: e.target.value })} /></div>
                    <div><Label>Email</Label><Input type="email" value={subForm.email} onChange={(e) => setSubForm({ ...subForm, email: e.target.value })} /></div>
                    <div><Label>Mobile 1</Label><Input value={subForm.mobile_1} onChange={(e) => setSubForm({ ...subForm, mobile_1: e.target.value })} placeholder="+27..." /></div>
                    <div><Label>Mobile 2</Label><Input value={subForm.mobile_2} onChange={(e) => setSubForm({ ...subForm, mobile_2: e.target.value })} placeholder="+27..." /></div>
                    <div><Label>Tel (Home)</Label><Input value={subForm.telephone_home} onChange={(e) => setSubForm({ ...subForm, telephone_home: e.target.value })} /></div>
                    <div><Label>Home Address</Label><Input value={subForm.home_address} onChange={(e) => setSubForm({ ...subForm, home_address: e.target.value })} /></div>
                  </div>

                  {/* School details */}
                  <div className="border-t border-border pt-6">
                    <h4 className="font-display text-base font-bold mb-4 flex items-center gap-2"><School className="w-4 h-4 text-primary" /> School Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label>School Name *</Label><Input value={subForm.school_name} onChange={(e) => setSubForm({ ...subForm, school_name: e.target.value })} /></div>
                      <div><Label>School Address</Label><Input value={subForm.school_address} onChange={(e) => setSubForm({ ...subForm, school_address: e.target.value })} /></div>
                      <div><Label>School Telephone</Label><Input value={subForm.school_telephone} onChange={(e) => setSubForm({ ...subForm, school_telephone: e.target.value })} /></div>
                      <div>
                        <Label>Grade *</Label>
                        <Select value={subForm.grade} onValueChange={(v) => setSubForm({ ...subForm, grade: v })}>
                          <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                          <SelectContent>
                            {grades.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="border-t border-border pt-6">
                    <h4 className="font-display text-base font-bold mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Subjects (up to 10)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {subForm.subjects.map((s, i) => (
                        <div key={i}>
                          <Label className="text-xs text-muted-foreground">Subject {i + 1}</Label>
                          <Input
                            value={s}
                            placeholder={`Subject ${i + 1}`}
                            onChange={(e) => {
                              const updated = [...subForm.subjects];
                              updated[i] = e.target.value;
                              setSubForm({ ...subForm, subjects: updated });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSubSave} className="font-display"><Save className="w-4 h-4 mr-1" /> Save</Button>
                    <Button variant="outline" onClick={() => setShowSubForm(false)}><X className="w-4 h-4 mr-1" /> Cancel</Button>
                  </div>
                </div>
              ) : subProfiles.length === 0 ? (
                <div className="text-center py-12 bg-muted rounded-xl">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No sub-profiles yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">You can add 1 student/learner sub-profile.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subProfiles.map((sp) => (
                    <div key={sp.id} className="bg-muted rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-background border-2 border-border flex items-center justify-center overflow-hidden">
                            {sp.profile_picture_url ? (
                              <img src={sp.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-display font-bold text-lg">{sp.first_name} {sp.last_name}</p>
                            <p className="text-xs text-muted-foreground">{sp.profile_type} • {sp.email || "No email"}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openSubForm(sp)}><Edit2 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSub(sp.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        {sp.school_name && <div><p className="text-xs text-muted-foreground">School</p><p className="font-medium">{sp.school_name}</p></div>}
                        {sp.grade && <div><p className="text-xs text-muted-foreground">Grade</p><p className="font-medium">{sp.grade}</p></div>}
                        {sp.mobile_1 && <div><p className="text-xs text-muted-foreground">Mobile</p><p className="font-medium">{sp.mobile_1}</p></div>}
                        {sp.school_telephone && <div><p className="text-xs text-muted-foreground">School Tel</p><p className="font-medium">{sp.school_telephone}</p></div>}
                      </div>
                      {sp.subjects && sp.subjects.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground mb-1">Subjects</p>
                          <div className="flex flex-wrap gap-1">
                            {sp.subjects.map((subj, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full bg-background text-xs font-medium">{subj}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <h2 className="font-display text-2xl font-bold mb-6">Subscription Status</h2>
              {subscriptions.length === 0 ? (
                <div className="text-center py-12 bg-muted rounded-xl">
                  <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">No active subscription.</p>
                  <Button onClick={() => navigate("/payment")} className="font-display">Buy eUCG</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="bg-muted rounded-xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-display font-bold ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {sub.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">Order: {sub.order_number}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><p className="text-xs text-muted-foreground">Start</p><p className="font-medium">{new Date(sub.start_date).toLocaleDateString()}</p></div>
                        <div><p className="text-xs text-muted-foreground">End</p><p className="font-medium">{new Date(sub.end_date).toLocaleDateString()}</p></div>
                        <div><p className="text-xs text-muted-foreground">Amount</p><p className="font-medium">R{sub.amount_paid}</p></div>
                        <div><p className="text-xs text-muted-foreground">Days Left</p><p className="font-display font-bold text-primary">{daysRemaining}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
