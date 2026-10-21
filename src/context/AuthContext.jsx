import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  function signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  function signUp({ email, password, fullName, phone }) {
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    });
  }

  function resetPassword(email) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  }

  function updatePassword(password) {
    return supabase.auth.updateUser({ password });
  }

  function signOut() {
    return supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
