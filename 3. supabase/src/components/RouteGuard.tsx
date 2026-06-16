import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { AppRole } from "@/lib/roleUtils";

interface RouteGuardProps {
  children: ReactNode;
  /** If provided, user must have one of these roles */
  allowedRoles?: AppRole[];
  /** If provided, user must be at least this role level */
  minRole?: AppRole;
  /** Require authentication only (no role check) */
  authOnly?: boolean;
}

const RouteGuard = ({ children, allowedRoles, minRole, authOnly }: RouteGuardProps) => {
  const { user, loading, isRole, isAtLeast } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Must be authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Auth-only check (no role requirement)
  if (authOnly) {
    return <>{children}</>;
  }

  // Role-based check
  if (allowedRoles && !isRole(allowedRoles)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <h1 className="font-display text-3xl font-black text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to view this page.</p>
          <a href="/" className="text-primary hover:underline text-sm">← Return to Home</a>
        </div>
      </div>
    );
  }

  if (minRole && !isAtLeast(minRole)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <h1 className="font-display text-3xl font-black text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to view this page.</p>
          <a href="/" className="text-primary hover:underline text-sm">← Return to Home</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RouteGuard;
