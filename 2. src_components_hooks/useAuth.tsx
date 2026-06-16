import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/roleUtils";
import { isRoleIn, isRoleAtLeast } from "@/lib/roleUtils";

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  nickname: string;
  salutation: string;
  role: string;
  is_active: boolean;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
  role: string;
  isRole: (roles: AppRole | AppRole[]) => boolean;
  isAtLeast: (minRole: AppRole) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  profile: null,
  role: "",
  isRole: () => false,
  isAtLeast: () => false,
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) {
      setProfile(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("Unable to load profile", error.message);
        setProfile(null);
        return;
      }

      setProfile(data as Profile | null);
    } catch (error) {
      console.warn("Profile lookup failed", error);
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Defer profile fetch to avoid Supabase client deadlock
          setTimeout(() => fetchProfile(session.user.id), 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const role = profile?.role ?? "";

  const isRole = useCallback(
    (roles: AppRole | AppRole[]) => {
      if (!role) return false;
      const arr = Array.isArray(roles) ? roles : [roles];
      return isRoleIn(role, arr);
    },
    [role]
  );

  const isAtLeast = useCallback(
    (minRole: AppRole) => {
      if (!role) return false;
      return isRoleAtLeast(role, minRole);
    },
    [role]
  );

  return (
    <AuthContext.Provider value={{ user, session, loading, profile, role, isRole, isAtLeast, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
