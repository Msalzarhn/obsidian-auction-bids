import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  logia: string;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function loadForUser(u: User | null) {
      if (!u) {
        setProfile(null);
        setIsAdmin(false);
        return;
      }
      setTimeout(() => {
        supabase.from("profiles").select("*").eq("id", u.id).maybeSingle()
          .then(({ data }) => setProfile(data as Profile | null));
        supabase.from("user_roles").select("role").eq("user_id", u.id).eq("role", "admin").maybeSingle()
          .then(({ data }) => setIsAdmin(!!data));
      }, 0);
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      loadForUser(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      loadForUser(data.session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user, profile, isAdmin, loading };
}
