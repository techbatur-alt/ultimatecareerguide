import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, BookOpen, User, LogOut, Info, Home, Quote, ShoppingCart, Shield, LogIn, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS, type AppRole } from "@/lib/roleUtils";
import BackHomeBar from "@/components/BackHomeBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode;
}

// Public nav items — visible to EVERYONE (subscribers and visitors)
// "Home" path is computed dynamically per user (see homePath below).
const publicNavItems = [
  { key: "home", label: "Home", icon: Home },
  { key: "volumes", path: "/volumes", label: "eVolumes", icon: BookOpen },
  { key: "about", path: "/about", label: "About", icon: Info },
  { key: "testimonials", path: "/testimonials", label: "Testimonials", icon: Quote },
] as const;

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, isAtLeast } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const showAdminNav = isAtLeast("service");
  const isAdminContext = showAdminNav && location.pathname.startsWith("/portal");

  // "Home" routes by user type:
  //  - Visitors  → public landing (/)
  //  - Subscribers → personal dashboard (/profile)
  //  - Staff/Admin → admin portal (/portal)
  const homePath = !user ? "/" : showAdminNav ? "/portal" : "/profile";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Logged-in banner */}
      {user && (
        <div className="bg-primary text-primary-foreground text-center py-1.5 text-xs font-display font-medium">
          Logged in as <strong>{user.email}</strong>
          {role && (
            <span className="ml-2 opacity-75">
              • {ROLE_LABELS[role as AppRole] || role}
            </span>
          )}
        </div>
      )}

      <header className={`sticky top-0 z-50 border-b border-border shadow-sm ${isAdminContext ? "bg-secondary" : "bg-card"}`}>
        <div className="container flex items-center justify-between py-2">
          {/* Left: Logo — links to user's "home" (dashboard for subscribers, portal for staff) */}
          <Link to={homePath} className="flex-shrink-0">
            <img src="/images/ucg-logo.png" alt="Ultimate Career Guide" className="h-10 object-contain" />
          </Link>

          {/* Center: Title */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center leading-tight">
            <p className={`font-display text-lg sm:text-2xl font-bold ${isAdminContext ? "text-primary-foreground" : "text-foreground"}`}>
              Ultimate Career Guide
            </p>
            <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
              powered by
              <img src="/images/ibatur-logo.jpg" alt="IBATUR Education" className="h-3.5 object-contain inline" />
              IBATUR Education CC
            </p>
          </div>

          {/* Right: Auth buttons / Buy + Menu */}
          <div className="flex items-center gap-2">
            {!user && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="font-display text-xs hidden sm:flex"
                >
                  <LogIn className="w-4 h-4 mr-1" /> Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/signup")}
                  className="font-display text-xs hidden sm:flex"
                >
                  <UserPlus className="w-4 h-4 mr-1" /> Sign Up
                </Button>
              </>
            )}

            {/* Subscribers see Buy button (admins/staff don't need it) */}
            {user && !showAdminNav && (
              <Button size="sm" onClick={() => navigate("/payment")} className="font-display text-xs hidden sm:flex">
                <ShoppingCart className="w-4 h-4 mr-1" /> Buy eUCG
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={isAdminContext ? "text-primary-foreground" : "text-foreground"}>
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {!user && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/login")} className="sm:hidden">
                      <LogIn className="w-4 h-4 mr-2" /> Sign In
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/signup")} className="sm:hidden">
                      <UserPlus className="w-4 h-4 mr-2" /> Sign Up
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="sm:hidden" />
                  </>
                )}

                {user && !showAdminNav && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/payment")} className="sm:hidden">
                      <ShoppingCart className="w-4 h-4 mr-2" /> Buy eUCG
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="sm:hidden" />
                  </>
                )}

                {/* Public nav — visible to everyone */}
                {publicNavItems.map((item) => {
                  const path = item.key === "home" ? homePath : item.path!;
                  return (
                    <DropdownMenuItem
                      key={item.key}
                      onClick={() => navigate(path)}
                      className={location.pathname === path ? "bg-accent font-medium" : ""}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </DropdownMenuItem>
                  );
                })}

                {/* Admin / Support portal entry — service+ only */}
                {showAdminNav && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Staff
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => navigate("/portal")}
                      className={location.pathname === "/portal" ? "bg-accent font-medium" : ""}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Portal
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                {user ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="w-4 h-4 mr-2" /> My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Back / Home bar — hidden on / and /profile */}
      <BackHomeBar />

      <main className="flex-1">{children}</main>

      <footer className="bg-secondary text-secondary-foreground py-8 border-t border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <img src="/images/ucg-logo.png" alt="UCG" className="h-8 object-contain" />
                <h3 className="font-display text-lg font-bold text-primary-foreground">Ultimate Career Guide</h3>
              </div>
              <p className="text-sm text-muted-foreground">"Linking People and Careers, Finding Future Solutions"</p>
              <p className="text-xs text-muted-foreground mt-2">8th Edition • 13 Volumes • 1,600+ Pages</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-muted-foreground">powered by</span>
                <img src="/images/ibatur-logo.jpg" alt="IBATUR" className="h-4 object-contain" />
              </div>
            </div>
            <div>
              <h4 className="font-display text-sm font-bold text-primary-foreground mb-2">Contact</h4>
              <p className="text-sm text-muted-foreground">IBATUR Education CC</p>
              <p className="text-sm text-muted-foreground">PO Box 636, Lonehill 2062</p>
              <p className="text-sm text-muted-foreground">+27 83 332 9584</p>
              <p className="text-sm text-muted-foreground">info@ibatur.co.za</p>
              <a href="https://careers4africa.com" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">careers4africa.com</a>
            </div>
            <div>
              <h4 className="font-display text-sm font-bold text-primary-foreground mb-2">Quick Links</h4>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-primary block">About</Link>
              <Link to="/about?tab=terms" className="text-sm text-muted-foreground hover:text-primary block">Terms & Conditions</Link>
              <Link to="/testimonials" className="text-sm text-muted-foreground hover:text-primary block">Testimonials</Link>
              <Link to="/volumes" className="text-sm text-muted-foreground hover:text-primary block">eVolumes</Link>
            </div>
          </div>
          <div className="border-t border-border mt-6 pt-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} IBATUR Education CC. All rights reserved. Intellectual Property Protected.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
