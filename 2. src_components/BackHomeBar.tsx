import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Renders a small Back + Home action bar on every page EXCEPT the home page (/)
 * and the user's dashboard (/profile). "Home" sends authenticated users to their
 * dashboard (/profile) and unauthenticated users to the public home (/).
 */
const HIDDEN_PATHS = new Set(["/", "/profile"]);

const BackHomeBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAtLeast } = useAuth();

  if (HIDDEN_PATHS.has(location.pathname)) return null;

  const homePath = !user ? "/" : isAtLeast("service") ? "/portal" : "/profile";

  return (
    <div className="border-b border-border bg-card">
      <div className="container flex items-center gap-2 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="font-display text-xs"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(homePath)}
          className="font-display text-xs"
        >
          <Home className="w-4 h-4 mr-1" /> Home
        </Button>
      </div>
    </div>
  );
};

export default BackHomeBar;
