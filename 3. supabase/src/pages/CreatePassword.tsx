import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, RefreshCw, CheckCircle } from "lucide-react";

const generatePassword = () => {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const symbols = "!@#$%&*";
  const all = upper + lower + digits + symbols;
  const pw = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];
  for (let i = 4; i < 12; i++) pw.push(all[Math.floor(Math.random() * all.length)]);
  return pw.sort(() => Math.random() - 0.5).join("");
};

const validatePassword = (pw: string) => {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(pw)) return "Password must contain an uppercase letter.";
  if (!/[a-z]/.test(pw)) return "Password must contain a lowercase letter.";
  if (!/[0-9]/.test(pw)) return "Password must contain a number.";
  if (!/[!@#$%&*]/.test(pw)) return "Password must contain a symbol (!@#$%&*).";
  return null;
};

const CreatePassword = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verify the user is authenticated (via magic link)
  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("Verification link is invalid or has expired. Please sign up again.");
        navigate("/signup");
        return;
      }
      setEmail(session.user.email ?? "");
      setChecking(false);
    };
    check();
  }, [navigate]);

  const handleAutoGenerate = () => {
    const pw = generatePassword();
    setPassword(pw);
    setConfirm(pw);
    setShowPassword(true);
    toast.success("Password generated! Make sure to copy it.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validatePassword(password);
    if (err) { toast.error(err); return; }
    if (password !== confirm) { toast.error("Passwords do not match."); return; }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    // Check if this is a sales agent invite
    const { data: { user } } = await supabase.auth.getUser();
    const isAgent =
      user?.user_metadata?.role === "sales_agent" ||
      new URLSearchParams(window.location.search).get("role") === "sales_agent";

    if (isAgent && user) {
      await supabase
        .from("sales_agents")
        .update({ status: "active", activated_at: new Date().toISOString() })
        .eq("user_id", user.id);
      setLoading(false);
      toast.success("Welcome aboard! Redirecting to your dashboard.");
      navigate("/agent/dashboard");
      return;
    }

    setLoading(false);
    toast.success("Password set! Now complete your profile.");
    navigate("/complete-profile");
  };

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Verifying...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <div className="text-center mb-6">
            <h1 className="font-display text-3xl font-black">
              <span className="text-primary">U</span>CG Create Password
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Step 2 of 3 — Set your password</p>
          </div>

          <div className="flex items-center gap-2 mb-4 bg-accent border border-border rounded-lg p-3">
            <CheckCircle className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm text-foreground">
              Email verified: <strong>{email}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Password *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">Min 8 chars, upper, lower, number & symbol</p>
                <button
                  type="button"
                  onClick={handleAutoGenerate}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Auto-generate
                </button>
              </div>
            </div>
            <div>
              <Label>Confirm Password *</Label>
              <Input
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full font-display" disabled={loading}>
              {loading ? "Saving..." : "Set Password & Continue"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePassword;
