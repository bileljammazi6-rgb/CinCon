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
  const [error, setError] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  const signIn = async () => {
    setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };
  const signUp = async () => {
    setLoading(true); setError('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b141a] text-white">
      <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-xl p-4">
        <h1 className="text-lg font-bold mb-2">Sign in</h1>
        {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
        <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="w-full mb-2 bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" className="w-full mb-3 bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
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