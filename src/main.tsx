import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { supabase } from './lib/supabase';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Sparkles } from 'lucide-react';

function Root() {
  const [loading, setLoading] = React.useState(true);
  const [authed, setAuthed] = React.useState(false);
  const [recovery, setRecovery] = React.useState(false);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecovery(true);
        setAuthed(false);
      } else {
        setAuthed(!!session);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;
  if (recovery) return <ResetPasswordScreen onDone={() => { setRecovery(false); setAuthed(true); }} />;
  if (!authed) return <AuthScreen/>;
  return <App/>;
}

function PasswordStrength({ value }: { value: string }) {
  const score = React.useMemo(() => {
    let s = 0;
    if (value.length >= 8) s += 1;
    if (/[A-Z]/.test(value)) s += 1;
    if (/[a-z]/.test(value)) s += 1;
    if (/\d/.test(value)) s += 1;
    if (/[^A-Za-z0-9]/.test(value)) s += 1;
    return s;
  }, [value]);
  const colors = ['bg-red-500','bg-orange-500','bg-yellow-500','bg-green-500','bg-emerald-600'];
  return (
    <div className="mt-1 h-1.5 w-full bg-white/10 rounded">
      <div className={`h-1.5 rounded ${colors[Math.max(0, score-1)]}`} style={{ width: `${(score/5)*100}%` }} />
    </div>
  );
}

function AuthScreen() {
  const [mode, setMode] = React.useState<'signin'|'signup'>('signin');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [error, setError] = React.useState<string>('');
  const [msg, setMsg] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  const signIn = async () => {
    setLoading(true); setError(''); setMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else {
      try { const derived = (username.trim() || email.split('@')[0]); localStorage.setItem('last_username', derived); } catch {}
      try { const perm = await Notification.requestPermission(); if (perm==='granted') new Notification("You've got a greeting from Bilel Jammazi!"); } catch {}
    }
    setLoading(false);
  };

  const signUp = async () => {
    setLoading(true); setError(''); setMsg('');
    try {
      const derived = username.trim() || email.split('@')[0];
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      const { error: upsertErr } = await supabase.from('users').insert({ email, username: derived, full_name: fullName || null, avatar_url: null });
      if (upsertErr) throw upsertErr;
      try { localStorage.setItem('last_username', derived); } catch {}
      setMsg('Check your email to confirm your account before signing in.');
      setMode('signin');
    } catch (e: any) {
      setError(e?.message || 'Failed to sign up');
    }
    setLoading(false);
  };

  const magicLink = async () => {
    setLoading(true); setError(''); setMsg('');
    try {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
      if (error) throw error;
      setMsg('Magic link sent. Check your email.');
    } catch (e: any) { setError(e?.message || 'Failed to send magic link'); }
    setLoading(false);
  };

  const forgotPassword = async () => {
    setLoading(true); setError(''); setMsg('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
      if (error) throw error;
      setMsg('Password reset email sent. Open the link from your email to set a new password.');
    } catch (e: any) { setError(e?.message || 'Failed to start reset'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-br from-[#0b141a] via-[#101820] to-[#0b141a] text-white overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute w-72 h-72 rounded-full blur-3xl bg-emerald-600/30 -top-10 -left-10"/>
        <div className="absolute w-80 h-80 rounded-full blur-3xl bg-blue-600/30 bottom-0 right-0"/>
      </div>
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center"><Sparkles className="w-5 h-5"/></div>
            <div className="text-sm font-semibold">Welcome</div>
          </div>
          <div className="text-xs bg-white/10 px-2 py-1 rounded">Bilel Jammazi AI</div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button onClick={()=>setMode('signin')} className={`px-3 py-2 rounded border ${mode==='signin'?'border-emerald-500 bg-emerald-600/20':'border-white/10 bg-white/5'}`}>Sign In</button>
          <button onClick={()=>setMode('signup')} className={`px-3 py-2 rounded border ${mode==='signup'?'border-blue-500 bg-blue-600/20':'border-white/10 bg-white/5'}`}>Sign Up</button>
        </div>
        {error && <div className="text-red-400 text-xs mb-2">{error}</div>}
        {msg && <div className="text-emerald-400 text-xs mb-2">{msg}</div>}
        {mode==='signup' && (
          <>
            <div className="mb-2">
              <label className="block text-xs text-gray-400 mb-1">Full name</label>
              <div className="flex items-center gap-2 bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm">
                <UserIcon className="w-4 h-4 text-gray-400"/>
                <input type="text" value={fullName} onChange={(e)=>setFullName(e.target.value)} placeholder="Your name" className="bg-transparent outline-none flex-1"/>
              </div>
            </div>
            <div className="mb-2">
              <label className="block text-xs text-gray-400 mb-1">Username</label>
              <div className="flex items-center gap-2 bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm">
                <UserIcon className="w-4 h-4 text-gray-400"/>
                <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Choose a username" className="bg-transparent outline-none flex-1"/>
              </div>
            </div>
          </>
        )}
        <div className="mb-2">
          <label className="block text-xs text-gray-400 mb-1">Email</label>
          <div className="flex items-center gap-2 bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm">
            <Mail className="w-4 h-4 text-gray-400"/>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" className="bg-transparent outline-none flex-1"/>
          </div>
        </div>
        <div className="mb-2">
          <label className="block text-xs text-gray-400 mb-1">Password</label>
          <div className="flex items-center gap-2 bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm">
            <Lock className="w-4 h-4 text-gray-400"/>
            <input type={showPass ? 'text' : 'password'} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder={mode==='signup'? 'Create a strong password' : 'Your password'} className="bg-transparent outline-none flex-1"/>
            <button onClick={()=>setShowPass(p=>!p)} type="button" className="text-gray-400 hover:text-white">{showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button>
          </div>
          {mode==='signup' && <PasswordStrength value={password} />}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <label className="flex items-center gap-2"><input type="checkbox"/> Remember me</label>
          <button onClick={forgotPassword} className="hover:text-white">Forgot password?</button>
        </div>
        {mode==='signin' ? (
          <>
            <button onClick={signIn} disabled={loading} className="w-full btn-primary px-3 py-2 rounded mb-2 disabled:opacity-50">Sign In</button>
            <button onClick={magicLink} disabled={loading} className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 disabled:opacity-50">Send Magic Link</button>
          </>
        ) : (
          <button onClick={signUp} disabled={loading} className="w-full px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50">Create Account</button>
        )}
      </div>
    </div>
  );
}

function ResetPasswordScreen({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = React.useState('');
  const [password2, setPassword2] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);
  const [msg, setMsg] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const submit = async () => {
    if (password.length < 8 || password !== password2) { setError('Passwords must match and be at least 8 chars'); return; }
    setLoading(true); setError(''); setMsg('');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMsg('Password updated. You can continue.');
      onDone();
    } catch (e: any) { setError(e?.message || 'Failed to update password'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0b141a] via-[#101820] to-[#0b141a] text-white">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="text-sm font-semibold mb-2">Reset your password</div>
        {error && <div className="text-red-400 text-xs mb-2">{error}</div>}
        {msg && <div className="text-emerald-400 text-xs mb-2">{msg}</div>}
        <div className="mb-2">
          <label className="block text-xs text-gray-400 mb-1">New password</label>
          <div className="flex items-center gap-2 bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm">
            <Lock className="w-4 h-4 text-gray-400"/>
            <input type={showPass ? 'text' : 'password'} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="New password" className="bg-transparent outline-none flex-1"/>
            <button onClick={()=>setShowPass(p=>!p)} type="button" className="text-gray-400 hover:text-white">{showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button>
          </div>
          <PasswordStrength value={password} />
        </div>
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">Confirm password</label>
          <div className="flex items-center gap-2 bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm">
            <Lock className="w-4 h-4 text-gray-400"/>
            <input type={showPass ? 'text' : 'password'} value={password2} onChange={(e)=>setPassword2(e.target.value)} placeholder="Confirm password" className="bg-transparent outline-none flex-1"/>
          </div>
        </div>
        <button onClick={submit} disabled={loading} className="w-full btn-primary px-3 py-2 rounded disabled:opacity-50">Update Password</button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);