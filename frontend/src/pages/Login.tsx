import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const userEmail = data.session?.user?.email ?? null;
      setSessionEmail(userEmail);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user?.email ?? null);
    });
    return () => { sub.subscription.unsubscribe(); active = false; };
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setMessage(error.message);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <div className="p-6 max-w-md">
      <h2 className="text-xl font-semibold">Login</h2>
      {sessionEmail ? (
        <div className="mt-3 space-y-2">
          <p className="text-gray-600">Logado como <span className="font-medium">{sessionEmail}</span></p>
          <button className="px-3 py-2 bg-gray-200 rounded" onClick={handleLogout}>Sair</button>
        </div>
      ) : (
        <form className="mt-3 space-y-3" onSubmit={handleLogin}>
          <input
            className="w-full border rounded p-2"
            type="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full border rounded p-2"
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="px-3 py-2 bg-blue-600 text-white rounded" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          {message && <p className="text-sm text-red-600">{message}</p>}
        </form>
      )}
    </div>
  );
}