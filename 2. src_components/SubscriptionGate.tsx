import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SubscriptionGateProps {
  children: ReactNode;
}

/**
 * Allows access only to users with an active subscription, OR to staff
 * (service / support / sales_agent / executive). Everyone else is redirected
 * to the payment page.
 */
const SubscriptionGate = ({ children }: SubscriptionGateProps) => {
  const { user, loading: authLoading, isAtLeast } = useAuth();
  const [checking, setChecking] = useState(true);
  const [hasActive, setHasActive] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!user) {
        setChecking(false);
        return;
      }
      const { data } = await supabase
        .from("subscriptions")
        .select("id, end_date, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gte("end_date", new Date().toISOString())
        .limit(1);
      setHasActive(Boolean(data && data.length > 0));
      setChecking(false);
    };
    if (!authLoading) check();
  }, [user, authLoading]);

  if (authLoading || checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (isAtLeast("service")) return <>{children}</>;
  if (!hasActive) return <Navigate to="/payment" replace />;

  return <>{children}</>;
};

export default SubscriptionGate;
