import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      toast.error("Invalid password reset link.");
      navigate("/login");
    }
  }, [navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Passwords do not match."); return; }
    if (password.length < 8) { toast.error("Min 8 characters."); return; }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) { toast.error(error.message); }
    else { toast.success("Password updated!"); navigate("/login"); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10">
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-8 shadow-lg">
        <h1 className="font-display text-2xl font-bold text-center mb-6">Reset Password</h1>
        <form onSubmit={handleReset} className="space-y-4">
          <div><Label>New Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} /></div>
          <div><Label>Confirm Password</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></div>
          <Button type="submit" className="w-full font-display" disabled={loading}>{loading ? "Updating..." : "Update Password"}</Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
