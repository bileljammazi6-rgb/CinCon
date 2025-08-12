import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { supabase } from './lib/supabase';

function Root() {
  const [loading, setLoading] = React.useState(true);
  const [authed, setAuthed] = React.useState(false);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setAuthed(!!s);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;
  if (!authed) return <AuthScreen/>;
  return <App/>;
}

function AuthScreen() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [error, setError] = React.useState<string>('');
  const [msg, setMsg] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  const signIn = async () => {
    setLoading(true); setError(''); setMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };
  const signUp = async () => {
    setLoading(true); setError(''); setMsg('');
    try {
      const derived = username.trim() || email.split('@')[0];
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      const { error: upsertErr } = await supabase.from('users').insert({ email, username: derived, full_name: null, avatar_url: null });
      if (upsertErr) throw upsertErr;
      setMsg('Check your email to confirm your account before signing in.');
    } catch (e: any) {
      setError(e?.message || 'Failed to sign up');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b141a] text-white">
      <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-xl p-4">
        <h1 className="text-lg font-bold mb-2">Create account</h1>
        {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
        {msg && <div className="text-emerald-400 text-sm mb-2">{msg}</div>}
        <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="w-full mb-2 bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" className="w-full mb-2 bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
        <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Username (optional)" className="w-full mb-3 bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
        <div className="flex gap-2">
          <button onClick={signIn} disabled={loading} className="btn-primary px-3 py-2 rounded disabled:opacity-50">Sign In</button>
          <button onClick={signUp} disabled={loading} className="px-3 py-2 rounded bg-white/5 border border-white/10 disabled:opacity-50">Sign Up</button>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);