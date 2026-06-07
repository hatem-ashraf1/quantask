import { useState } from 'react';
import { Zap, Eye, EyeOff, ArrowRight, Github, Mail, Lock, User, Building2, CheckCircle2 } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'join';

interface AuthScreenProps {
  onAuth: () => void;
  mode?: AuthMode;
  inviteToken?: string;
}

export function AuthScreen({ onAuth, mode: initialMode = 'login', inviteToken }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>(inviteToken ? 'join' : initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [joinAccepted, setJoinAccepted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mode === 'join') {
        setJoinAccepted(true);
        setTimeout(onAuth, 1500);
      } else {
        onAuth();
      }
    }, 900);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--background)', fontFamily: 'var(--font-family-body)' }}
    >
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-12"
        style={{ background: '#0d0d12' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm"
            style={{ background: 'var(--primary)', fontFamily: 'var(--font-family-mono)' }}
          >
            QT
          </div>
          <span className="text-white text-lg">QuanTask</span>
        </div>

        {/* Feature highlights */}
        <div className="space-y-6">
          <h2 className="text-white" style={{ fontSize: '28px', lineHeight: 1.25 }}>
            The AI-native<br />project engine for<br />developer teams.
          </h2>
          <div className="space-y-4">
            {[
              { icon: '✦', text: 'AI skill-matching assigns the right developer automatically' },
              { icon: '⟡', text: 'Real-time Kanban with concurrency conflict detection' },
              { icon: '◈', text: 'GitHub activity powers sprint velocity analytics' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <span className="text-indigo-400 mt-0.5 text-base flex-shrink-0">{icon}</span>
                <p className="text-sm" style={{ color: '#8888aa', lineHeight: 1.6 }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer quote */}
        <div className="border-l-2 border-indigo-500 pl-4">
          <p className="text-sm italic" style={{ color: '#6666aa' }}>
            "From GitHub commits to sprint insights — in seconds."
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs"
              style={{ background: 'var(--primary)', fontFamily: 'var(--font-family-mono)' }}
            >
              QT
            </div>
            <span className="text-[var(--foreground)]">QuanTask</span>
          </div>

          {/* Join Workspace success state */}
          {joinAccepted ? (
            <div className="text-center py-12">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--secondary)' }}
              >
                <CheckCircle2 size={32} className="text-[var(--primary)]" />
              </div>
              <h2 className="text-xl text-[var(--foreground)] mb-2">Welcome to QuanTask HQ!</h2>
              <p className="text-sm text-[var(--muted-foreground)]">Redirecting you to the workspace…</p>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div className="mb-8">
                {mode === 'join' ? (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center text-white text-xs"
                        style={{ background: 'var(--primary)', fontFamily: 'var(--font-family-mono)' }}
                      >
                        QT
                      </div>
                      <span className="text-xs text-[var(--muted-foreground)]">QuanTask HQ</span>
                    </div>
                    <h1 className="text-2xl text-[var(--foreground)] mb-1">You're invited!</h1>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Accept your invitation to join{' '}
                      <strong className="text-[var(--foreground)]">QuanTask HQ</strong> workspace.
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl text-[var(--foreground)] mb-1">
                      {mode === 'login' ? 'Sign in' : 'Create account'}
                    </h1>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {mode === 'login'
                        ? 'Welcome back. Enter your credentials to continue.'
                        : 'Start your 14-day free trial. No credit card required.'}
                    </p>
                  </>
                )}
              </div>

              {/* GitHub SSO */}
              {mode !== 'join' && (
                <>
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border text-sm transition-colors hover:bg-[var(--muted)]"
                    style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  >
                    <Github size={16} />
                    Continue with GitHub
                  </button>
                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t" style={{ borderColor: 'var(--border)' }} />
                    </div>
                    <div className="relative flex justify-center">
                      <span
                        className="px-3 text-xs bg-[var(--background)] text-[var(--muted-foreground)]"
                      >
                        or
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Full name</label>
                    <div className="relative">
                      <User
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                      />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Rivera"
                        required
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none border transition-colors"
                        style={{
                          background: 'var(--input-background)',
                          borderColor: 'var(--border)',
                          color: 'var(--foreground)',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                        onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Email</label>
                  <div className="relative">
                    <Mail
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.dev"
                      required
                      defaultValue={mode === 'join' ? 'dev@company.dev' : ''}
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none border transition-colors"
                      style={{
                        background: 'var(--input-background)',
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                    />
                  </div>
                </div>

                {mode !== 'join' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-[var(--muted-foreground)]">Password</label>
                      {mode === 'login' && (
                        <button type="button" className="text-xs text-[var(--primary)] hover:underline">
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                      />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm outline-none border transition-colors"
                        style={{
                          background: 'var(--input-background)',
                          borderColor: 'var(--border)',
                          color: 'var(--foreground)',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                        onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'join' && (
                  <div
                    className="p-3 rounded-lg flex items-start gap-3"
                    style={{ background: 'var(--secondary)' }}
                  >
                    <Building2 size={14} className="text-[var(--primary)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-[var(--foreground)]">
                        You're joining as a <strong>Developer</strong>
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        Your role can be changed later by a workspace owner.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm text-white transition-all"
                  style={{
                    background: loading ? 'var(--muted)' : 'var(--primary)',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                      />
                      {mode === 'join' ? 'Accepting…' : mode === 'login' ? 'Signing in…' : 'Creating account…'}
                    </span>
                  ) : (
                    <>
                      {mode === 'join' ? 'Accept Invitation' : mode === 'login' ? 'Sign in' : 'Create account'}
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              {/* Switch mode */}
              {mode !== 'join' && (
                <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    className="text-[var(--primary)] hover:underline"
                  >
                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
