import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { supabase } from "../services/supabase";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let active = true;
    async function check() {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      if (active) setIsAuthed(!!data.session);
      setLoading(false);
    }
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
    });
    return () => { sub.subscription.unsubscribe(); active = false; };
  }, []);

  if (loading) return <div className="p-6">Verificando acesso...</div>;
  if (!isAuthed) return <Navigate to="/login" replace />;
  return <>{children}</>;
}