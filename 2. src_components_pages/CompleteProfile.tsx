import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

const salutations = ["Mr", "Mrs", "Ms", "Dr", "Prof", "Rev", "Other"];

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    salutation: "",
    firstName: "",
    lastName: "",
    nickname: "",
    idNumber: "",
    mobile1: "",
    mobile2: "",
    telephoneHome: "",
    telephoneWork: "",
    homeAddress: "",
    workAddress: "",
    dateOfBirth: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const age = form.dateOfBirth
    ? Math.floor((Date.now() - new Date(form.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Session expired. Please sign in again.");
      navigate("/login");
      return;
    }
    if (age < 18) { toast.error("You must be 18 years or older to register."); return; }
    if (form.idNumber.length < 6) { toast.error("Please enter a valid ID number."); return; }

    setLoading(true);
    const { error } = await supabase.from("profiles").update({
      salutation: form.salutation,
      first_name: form.firstName,
      last_name: form.lastName,
      nickname: form.nickname,
      id_number: form.idNumber,
      mobile_1: form.mobile1,
      mobile_2: form.mobile2,
      telephone_home: form.telephoneHome,
      telephone_work: form.telephoneWork,
      home_address: form.homeAddress,
      work_address: form.workAddress,
      date_of_birth: form.dateOfBirth,
    }).eq("id", user.id);
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      await refreshProfile();
      toast.success("Profile completed! Welcome to UCG.");
      navigate("/");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10">
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <div className="text-center mb-6">
            <h1 className="font-display text-3xl font-black">
              <span className="text-primary">U</span>CG Complete Profile
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Step 3 of 3 — Personal details</p>
          </div>

          <div className="flex items-center gap-2 mb-4 bg-accent border border-border rounded-lg p-3">
            <CheckCircle className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm text-foreground">Account secured! Just one more step.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Salutation *</Label>
                <Select value={form.salutation} onValueChange={(v) => update("salutation", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {salutations.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date of Birth *</Label>
                <Input type="date" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>First Name(s) *</Label><Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} required /></div>
              <div><Label>Surname *</Label><Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} required /></div>
            </div>
            <div><Label>Nickname *</Label><Input value={form.nickname} onChange={(e) => update("nickname", e.target.value)} required /></div>
            <div><Label>SA ID Number *</Label><Input value={form.idNumber} onChange={(e) => update("idNumber", e.target.value)} required maxLength={13} /></div>

            <div className="grid grid-cols-2 gap-4">
              <div><Label>Mobile 1 *</Label><Input value={form.mobile1} onChange={(e) => update("mobile1", e.target.value)} required placeholder="+27..." /></div>
              <div><Label>Mobile 2</Label><Input value={form.mobile2} onChange={(e) => update("mobile2", e.target.value)} placeholder="+27..." /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Telephone (Home)</Label><Input value={form.telephoneHome} onChange={(e) => update("telephoneHome", e.target.value)} /></div>
              <div><Label>Telephone (Work)</Label><Input value={form.telephoneWork} onChange={(e) => update("telephoneWork", e.target.value)} /></div>
            </div>
            <div><Label>Home Address *</Label><Input value={form.homeAddress} onChange={(e) => update("homeAddress", e.target.value)} required /></div>
            <div><Label>Work/Study Address</Label><Input value={form.workAddress} onChange={(e) => update("workAddress", e.target.value)} /></div>

            <Button type="submit" className="w-full font-display" disabled={loading}>
              {loading ? "Saving..." : "Complete Registration"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
