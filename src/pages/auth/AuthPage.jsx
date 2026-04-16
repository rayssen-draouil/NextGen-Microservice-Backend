import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { clearSession, getRoleLabel, getStoredSession, loginUser, normalizeRole, registerUser, saveSession } from '@/services/userApi';

const emptyRegisterForm = {
  name: '',
  email: '',
  password: '',
  role: 'client',
};

const roleOptions = [
  { value: 'client', label: 'Client' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'livreur', label: 'Livreur' },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [session, setSession] = useState(() => getStoredSession());

  useEffect(() => {
    if (!session) {
      return;
    }

    setLoginForm({ email: session.user?.email || '', password: '' });
  }, [session]);

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((current) => ({ ...current, [name]: value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await loginUser(loginForm);
      const nextSession = {
        accessToken: response.access_token,
        user: response.user,
      };

      saveSession(nextSession);
      setSession(nextSession);
      setMessage('Connection successful.');
      if (normalizeRole(nextSession.user?.role) === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      await registerUser(registerForm);
      setMessage('User created. You can now sign in.');
      setMode('login');
      setLoginForm({ email: registerForm.email, password: '' });
      setRegisterForm(emptyRegisterForm);
    } catch (requestError) {
      setError(requestError.message || 'Unable to create the account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setMessage('Session cleared.');
  };

  return (
    <section className="relative overflow-hidden px-4 md:px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0.72),_rgba(255,248,235,0.96))]" />

      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-primary shadow-sm">
            <Icon icon="lucide:user-round" />
            User microservice integration
          </span>
          <h1 className="max-w-xl text-5xl md:text-6xl font-heading font-black leading-tight text-primary">
            Sign in, register, and manage real Foodly users.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground leading-8">
            Create an account, sign in, and access your Foodly workspace.
          </p>
        </div>

        <div className="rounded-[2rem] border border-border bg-card/95 shadow-2xl p-6 md:p-8 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${mode === 'login' ? 'bg-primary text-primary-foreground' : 'bg-muted text-primary'}`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${mode === 'register' ? 'bg-primary text-primary-foreground' : 'bg-muted text-primary'}`}
            >
              Register
            </button>
          </div>

          {message && <div className="mb-4 rounded-2xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm font-medium text-secondary-foreground">{message}</div>}
          {error && <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</div>}

          {session ? (
            <div className="space-y-4">
              <div className="rounded-3xl border border-border bg-muted/50 p-5">
                <p className="text-sm text-muted-foreground">Connected as</p>
                <p className="mt-1 text-2xl font-heading font-bold text-primary">{session.user?.name || session.user?.email || 'User'}</p>
                <p className="text-sm text-muted-foreground">{session.user?.email}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-primary/70 mt-1">{getRoleLabel(session.user?.role)}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => navigate(normalizeRole(session.user?.role) === 'admin' ? '/admin/users' : '/')} className="flex-1 rounded-2xl bg-primary px-5 py-3 font-bold text-primary-foreground transition-transform hover:scale-[1.01]">
                  {normalizeRole(session.user?.role) === 'admin' ? 'Open user admin' : 'Go to home'}
                </button>
                <button type="button" onClick={handleLogout} className="flex-1 rounded-2xl border border-border bg-card px-5 py-3 font-bold text-primary">
                  Clear session
                </button>
              </div>
            </div>
          ) : mode === 'login' ? (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary" htmlFor="login-email">Email</label>
                <input id="login-email" name="email" type="email" value={loginForm.email} onChange={handleLoginChange} required className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="you@foodly.app" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary" htmlFor="login-password">Password</label>
                <input id="login-password" name="password" type="password" value={loginForm.password} onChange={handleLoginChange} required className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="••••••••" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-primary px-5 py-3 font-bold text-primary-foreground transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary" htmlFor="register-name">Name</label>
                <input id="register-name" name="name" type="text" value={registerForm.name} onChange={handleRegisterChange} required className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Amina Ben Ali" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary" htmlFor="register-email">Email</label>
                <input id="register-email" name="email" type="email" value={registerForm.email} onChange={handleRegisterChange} required className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="amina@foodly.app" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary" htmlFor="register-password">Password</label>
                <input id="register-password" name="password" type="password" value={registerForm.password} onChange={handleRegisterChange} required minLength={6} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Minimum 6 characters" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary" htmlFor="register-role">Role</label>
                <select id="register-role" name="role" value={registerForm.role} onChange={handleRegisterChange} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-primary px-5 py-3 font-bold text-primary-foreground transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}