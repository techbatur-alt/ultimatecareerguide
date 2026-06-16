import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail } from "lucide-react";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/create-password`,
      },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Verification link sent! Check your email.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <div className="text-center mb-6">
            <h1 className="font-display text-3xl font-black">
              <span className="text-primary">U</span>CG Sign Up
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {sent ? "Verify your email" : "Step 1 of 3 — Enter your email"}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  We'll send you a verification link valid for 24 hours.
                </p>
              </div>
              <Button type="submit" className="w-full font-display" disabled={loading}>
                {loading ? "Sending..." : "Send Verification Link"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-6 py-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Mail className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold mb-2">Check Your Email</h2>
                <p className="text-muted-foreground text-sm">
                  Welcome to the Ultimate Career Guide! We've sent a verification link to{" "}
                  <strong className="text-foreground">{email}</strong>.
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  This link is valid for 24 hours. Click it to verify your email and continue setting up your account.
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-xs text-muted-foreground text-left">
                <p>• Check your spam/junk folder if you don't see the email</p>
                <p>• The link expires in 24 hours — after that you'll need to sign up again</p>
                <p>• After verifying, you'll create your password and complete your profile</p>
              </div>
              <Button variant="outline" onClick={() => { setSent(false); setEmail(""); }} className="w-full">
                Use a different email
              </Button>
            </div>
          )}

          <p className="text-sm text-muted-foreground mt-4 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
