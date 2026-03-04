import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const roleRef = useRef<AppRole | null>(null);
  const fetchingRole = useRef(false);

  const fetchRole = useCallback(async (userId: string) => {
    if (fetchingRole.current) return;
    fetchingRole.current = true;
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      const newRole = data?.role ?? null;
      if (newRole) {
        roleRef.current = newRole;
        setRole(newRole);
      }
    } finally {
      fetchingRole.current = false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!isMounted) return;
        
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === "SIGNED_OUT") {
          roleRef.current = null;
          setRole(null);
          setLoading(false);
          return;
        }

        // Only fetch role on sign-in events, not on every token refresh
        if (newSession?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
          // Use setTimeout to avoid Supabase deadlock warning
          setTimeout(() => {
            if (isMounted) fetchRole(newSession.user.id);
          }, 0);
        }
        
        // For TOKEN_REFRESHED, keep existing role — don't re-fetch
        if (event === "TOKEN_REFRESHED" && roleRef.current) {
          setRole(roleRef.current);
        }
      }
    );

    // Initial load
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!isMounted) return;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          await fetchRole(initialSession.user.id);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchRole]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    roleRef.current = null;
    setRole(null);
  };

  const getDashboardPath = (r: AppRole | null) => {
    switch (r) {
      case "admin": return "/admin/dashboard";
      case "staff": return "/staff/dashboard";
      case "student": return "/student/dashboard";
      default: return "/login";
    }
  };

  return { user, session, role, loading, signUp, signIn, signOut, getDashboardPath };
};
