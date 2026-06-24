import { type FormEvent, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Github,
  KeyRound,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import {
  acceptInvitation,
  confirmEmail,
  forgotPassword,
  login,
  register,
  resendEmailConfirmation,
  resetPassword,
} from '../api/client';

type AuthMode = 'login' | 'register' | 'join' | 'confirm' | 'forgot' | 'reset';

interface AuthScreenProps {
  onAuth: () => void;
  mode?: AuthMode;
  inviteToken?: string;
  invitationPending?: boolean;
}

function modeTitle(mode: AuthMode) {
  if (mode === 'register') return 'Create account';
  if (mode === 'join') return "You're invited!";
  if (mode === 'confirm') return 'Confirm email';
  if (mode === 'forgot') return 'Forgot password';
  if (mode === 'reset') return 'Reset password';
  return 'Sign in';
}

function modeDescription(mode: AuthMode) {
  if (mode === 'register') return 'Create your QuanTask account.';
  if (mode === 'join') return 'Accept your invitation to join the workspace.';
  if (mode === 'confirm') return 'Enter the confirmation token sent to your email.';
  if (mode === 'forgot') return 'Enter your email to receive a password reset OTP.';
  if (mode === 'reset') return 'Enter the OTP and choose a new password.';
  return 'Welcome back. Enter your credentials to continue.';
}

function submitLabel(mode: AuthMode) {
  if (mode === 'register') return 'Create account';
  if (mode === 'join') return 'Accept invitation';
  if (mode === 'confirm') return 'Confirm email';
  if (mode === 'forgot') return 'Send reset OTP';
  if (mode === 'reset') return 'Reset password';
  return 'Sign in';
}

function loadingLabel(mode: AuthMode) {
  if (mode === 'register') return 'Creating account...';
  if (mode === 'join') return 'Accepting...';
  if (mode === 'confirm') return 'Confirming...';
  if (mode === 'forgot') return 'Sending...';
  if (mode === 'reset') return 'Resetting...';
  return 'Signing in...';
}

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { label: 'One uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'One lowercase letter', test: (value: string) => /[a-z]/.test(value) },
  { label: 'One number', test: (value: string) => /[0-9]/.test(value) },
  { label: 'One special character', test: (value: string) => /[^a-zA-Z0-9]/.test(value) },
];

const GITHUB_HANDLE_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

function validateSignup(
  fullName: string,
  password: string,
  confirmPassword: string,
  gitHubHandle: string,
) {
  if (!fullName.trim()) return 'Full name is required.';

  const normalizedGitHubHandle = gitHubHandle.trim();
  if (normalizedGitHubHandle && !GITHUB_HANDLE_PATTERN.test(normalizedGitHubHandle)) {
    return 'GitHub handle may contain only letters, numbers, and hyphens, and cannot start or end with a hyphen.';
  }

  const missingRule = PASSWORD_RULES.find((rule) => !rule.test(password));
  if (missingRule) return `Password must include: ${missingRule.label.toLowerCase()}.`;

  if (password !== confirmPassword) return 'Passwords do not match.';
  return '';
}

function authErrorMessage(error: unknown, fallback = 'Request failed. Please try again.') {
  const message = error instanceof Error ? error.message : fallback;
  if (message.includes('Unable to reach the backend')) {
    return 'Cannot reach the backend right now. Please check the deployment URL and try again.';
  }
  if (message.toLowerCase().includes('failed to fetch')) {
    return 'Network request failed. Please check your connection and try again.';
  }
  return message || fallback;
}

export function AuthScreen({
  onAuth,
  mode: initialMode = 'login',
  inviteToken,
  invitationPending = false,
}: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>(inviteToken ? 'join' : initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [confirmationToken, setConfirmationToken] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [gitHubHandle, setGitHubHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [joinAccepted, setJoinAccepted] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const clearFeedback = () => {
    setError('');
    setNotice('');
  };

  const changeMode = (nextMode: AuthMode) => {
    clearFeedback();
    setMode(nextMode);
    if (nextMode !== 'register') {
      setConfirmPassword('');
      setGitHubHandle('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearFeedback();
    setLoading(true);

    const normalizedEmail = email.trim();

    try {
      if (mode === 'login') {
        await login(normalizedEmail, password);
        onAuth();
        return;
      }

      if (mode === 'join') {
        if (!inviteToken) throw new Error('Invitation token is missing.');
        await acceptInvitation(inviteToken);
        setJoinAccepted(true);
        onAuth();
        return;
      }

      if (mode === 'register') {
        const validationError = validateSignup(name, password, confirmPassword, gitHubHandle);
        if (validationError) throw new Error(validationError);

        const result = await register(
          name.trim(),
          normalizedEmail,
          password,
          confirmPassword,
          gitHubHandle,
        );
        setNotice(result?.message || result?.Message || 'Account created. Confirm your email, then sign in.');
        setPassword('');
        setConfirmPassword('');
        setGitHubHandle('');
        setConfirmationToken('');
        setMode('confirm');
        return;
      }

      if (mode === 'confirm') {
        await confirmEmail(normalizedEmail, confirmationToken.trim());
        setNotice('Email confirmed. You can sign in now.');
        setMode('login');
        setPassword('');
        return;
      }

      if (mode === 'forgot') {
        await forgotPassword(normalizedEmail);
        setNotice('If the account exists, a reset OTP was sent.');
        setMode('reset');
        return;
      }

      if (mode === 'reset') {
        if (newPassword !== newPasswordConfirm) throw new Error('Passwords do not match.');
        await resetPassword(normalizedEmail, otp.trim(), newPassword, newPasswordConfirm);
        setNotice('Password reset. You can sign in with your new password.');
        setMode('login');
        setPassword('');
        setNewPassword('');
        setNewPasswordConfirm('');
        setOtp('');
      }
    } catch (err) {
      setError(authErrorMessage(err, 'Authentication request failed.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    clearFeedback();
    setResending(true);

    try {
      await resendEmailConfirmation(email.trim());
      setNotice('Confirmation email resent.');
    } catch (err) {
      setError(authErrorMessage(err, 'Unable to resend confirmation email.'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--background)', fontFamily: 'var(--font-family-body)' }}
    >
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-12"
        style={{ background: '#0d0d12' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm"
            style={{ background: 'var(--primary)', fontFamily: 'var(--font-family-mono)' }}
          >
            QT
          </div>
          <span className="text-white text-lg">QuanTask</span>
        </div>

        <div className="space-y-6">
          <h2 className="text-white" style={{ fontSize: '28px', lineHeight: 1.25 }}>
            The AI-native<br />project engine for<br />developer teams.
          </h2>
          <div className="space-y-4">
            {[
              { icon: '*', text: 'AI skill-matching assigns the right developer automatically' },
              { icon: '<>', text: 'Real-time Kanban with concurrency conflict detection' },
              { icon: '#', text: 'GitHub activity powers sprint velocity analytics' },
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

        <div className="border-l-2 border-indigo-500 pl-4">
          <p className="text-sm italic" style={{ color: '#6666aa' }}>
            "From GitHub commits to sprint insights - in seconds."
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs"
              style={{ background: 'var(--primary)', fontFamily: 'var(--font-family-mono)' }}
            >
              QT
            </div>
            <span className="text-[var(--foreground)]">QuanTask</span>
          </div>

          {joinAccepted ? (
            <div className="text-center py-12">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--secondary)' }}
              >
                <CheckCircle2 size={32} className="text-[var(--primary)]" />
              </div>
              <h2 className="text-xl text-[var(--foreground)] mb-2">Invitation accepted</h2>
              <p className="text-sm text-[var(--muted-foreground)]">Redirecting you to the workspace...</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                {mode === 'join' && (
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center text-white text-xs"
                      style={{ background: 'var(--primary)', fontFamily: 'var(--font-family-mono)' }}
                    >
                      QT
                    </div>
                    <span className="text-xs text-[var(--muted-foreground)]">QuanTask</span>
                  </div>
                )}
                <h1 className="text-2xl text-[var(--foreground)] mb-1">{modeTitle(mode)}</h1>
                <p className="text-sm text-[var(--muted-foreground)]">{modeDescription(mode)}</p>
              </div>

              {invitationPending && mode !== 'join' && (
                <div
                  className="mb-5 rounded-lg border px-3 py-2.5 flex items-start gap-2.5"
                  style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}
                >
                  <Building2 size={14} className="text-[var(--primary)] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Sign in or create an account to continue accepting your workspace invitation.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div
                    className="rounded-lg border px-3 py-2 text-xs"
                    style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}
                  >
                    {error}
                  </div>
                )}

                {notice && (
                  <div
                    className="rounded-lg border px-3 py-2 text-xs"
                    style={{ background: '#ecfdf5', borderColor: '#bbf7d0', color: '#047857' }}
                  >
                    {notice}
                  </div>
                )}

                {mode === 'register' && (
                  <>
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
                          autoComplete="name"
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

                    <div>
                      <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">
                        GitHub handle <span className="text-[var(--muted-foreground)]">(optional)</span>
                      </label>
                      <div className="relative">
                        <Github
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                        />
                        <input
                          type="text"
                          value={gitHubHandle}
                          onChange={(e) => setGitHubHandle(e.target.value)}
                          placeholder="octocat"
                          maxLength={39}
                          autoComplete="username"
                          autoCapitalize="none"
                          spellCheck={false}
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
                  </>
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
                        autoComplete="email"
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

                {(mode === 'login' || mode === 'register') && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-[var(--muted-foreground)]">Password</label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => changeMode('forgot')}
                          className="text-xs text-[var(--primary)] hover:underline"
                        >
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
                        placeholder="Password"
                        required
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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

                {mode === 'register' && (
                  <>
                    <div>
                      <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Confirm password</label>
                      <div className="relative">
                        <Lock
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                        />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          required
                          autoComplete="new-password"
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

                    <div
                      className="rounded-lg border px-3 py-2"
                      style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}
                    >
                      <div className="grid grid-cols-1 gap-1.5">
                        {PASSWORD_RULES.map((rule) => {
                          const passed = rule.test(password);
                          return (
                            <div key={rule.label} className="flex items-center gap-2 text-[10px]">
                              <CheckCircle2
                                size={11}
                                style={{ color: passed ? '#22c55e' : 'var(--muted-foreground)' }}
                              />
                              <span style={{ color: passed ? '#15803d' : 'var(--muted-foreground)' }}>
                                {rule.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {mode === 'confirm' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-[var(--muted-foreground)]">Confirmation token</label>
                      <button
                        type="button"
                        onClick={handleResendConfirmation}
                        disabled={resending || !email.trim()}
                        className="text-xs text-[var(--primary)] hover:underline disabled:opacity-50"
                      >
                        {resending ? 'Resending...' : 'Resend'}
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                      />
                      <input
                        type="text"
                        value={confirmationToken}
                        onChange={(e) => setConfirmationToken(e.target.value)}
                        placeholder="Confirmation token"
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

                {mode === 'reset' && (
                  <>
                    <div>
                      <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">OTP</label>
                      <div className="relative">
                        <KeyRound
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                        />
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Reset OTP"
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

                    <div>
                      <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">New password</label>
                      <div className="relative">
                        <Lock
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                        />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New password"
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

                    <div>
                      <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Confirm new password</label>
                      <div className="relative">
                        <Lock
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                        />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPasswordConfirm}
                          onChange={(e) => setNewPasswordConfirm(e.target.value)}
                          placeholder="Confirm new password"
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
                  </>
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
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {loadingLabel(mode)}
                    </span>
                  ) : (
                    <>
                      {submitLabel(mode)}
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              {mode !== 'join' && (
                <div className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
                  {mode === 'login' && (
                    <>
                      Don't have an account?{' '}
                      <button onClick={() => changeMode('register')} className="text-[var(--primary)] hover:underline">
                        Sign up
                      </button>
                    </>
                  )}

                  {mode === 'register' && (
                    <>
                      Already have an account?{' '}
                      <button onClick={() => changeMode('login')} className="text-[var(--primary)] hover:underline">
                        Sign in
                      </button>
                    </>
                  )}

                  {(mode === 'confirm' || mode === 'forgot' || mode === 'reset') && (
                    <button onClick={() => changeMode('login')} className="text-[var(--primary)] hover:underline">
                      Back to sign in
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
