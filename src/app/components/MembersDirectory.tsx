import { useState } from 'react';
import { Users, Mail, Plus, ChevronDown, Shield, X, Copy, Check, Search } from 'lucide-react';
import { USERS, WORKSPACE, User } from '../data/mockData';

const AVATAR_COLORS: Record<string, string> = {
  u1: '#5c5cf5', u2: '#22c55e', u3: '#f59e0b', u4: '#ef4444', u5: '#8b5cf6', u6: '#06b6d4',
};

const ROLE_CONFIG = {
  owner: { label: 'Owner', color: '#5c5cf5', bg: '#ededff' },
  pm: { label: 'PM', color: '#22c55e', bg: '#f0fdf4' },
  developer: { label: 'Developer', color: '#3b82f6', bg: '#eff6ff' },
  viewer: { label: 'Viewer', color: '#6b6b82', bg: '#f6f6fa' },
};

function InviteModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<User['role']>('developer');
  const [sent, setSent] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const inviteLink = 'https://app.quantask.dev/invite/tok_abc123xyz';

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 2000);
    setEmail('');
  };

  const copyLink = () => {
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', fontFamily: 'var(--font-family-body)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm text-[var(--foreground)]">Invite Member</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)]">
            <X size={14} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Email invite */}
          <form onSubmit={handleSend} className="space-y-3">
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Email address</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@company.dev"
                  required
                  className="flex-1 px-3 py-2 rounded-lg border text-xs outline-none"
                  style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg text-xs text-white transition-colors hover:opacity-90"
                  style={{ background: 'var(--primary)' }}
                >
                  {sent ? <Check size={14} /> : 'Send'}
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Role</label>
              <div className="grid grid-cols-2 gap-2">
                {(['pm', 'developer', 'viewer'] as User['role'][]).map((r) => {
                  const cfg = ROLE_CONFIG[r];
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all"
                      style={{
                        borderColor: role === r ? 'var(--primary)' : 'var(--border)',
                        background: role === r ? 'var(--secondary)' : 'transparent',
                        color: role === r ? 'var(--primary)' : 'var(--foreground)',
                      }}
                    >
                      <Shield size={11} style={{ color: cfg.color }} />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 p-2.5 rounded-lg text-xs text-[var(--muted-foreground)]" style={{ background: 'var(--muted)' }}>
                {role === 'pm' && 'Can manage sprints, approve tasks, and add dependencies.'}
                {role === 'developer' && 'Can execute tasks, self-assign, post comments, and toggle sub-tasks.'}
                {role === 'viewer' && 'Read-only access to boards and task details.'}
              </div>
            </div>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--border)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs bg-[var(--card)] text-[var(--muted-foreground)]">or share invite link</span>
            </div>
          </div>

          {/* Invite link */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg border"
            style={{ borderColor: 'var(--border)', background: 'var(--input-background)' }}
          >
            <span className="flex-1 text-xs text-[var(--muted-foreground)] truncate" style={{ fontFamily: 'var(--font-family-mono)' }}>
              {inviteLink}
            </span>
            <button
              onClick={copyLink}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors hover:bg-[var(--muted)]"
              style={{ color: linkCopied ? '#22c55e' : 'var(--primary)' }}
            >
              {linkCopied ? <Check size={12} /> : <Copy size={12} />}
              {linkCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MembersDirectory() {
  const [showInvite, setShowInvite] = useState(false);
  const [search, setSearch] = useState('');

  const displayed = USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: 'var(--font-family-body)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div>
          <h2 className="text-sm text-[var(--foreground)]">Members</h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{USERS.length} members in {WORKSPACE.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members…"
              className="pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-none"
              style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)', width: '180px' }}
            />
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white"
            style={{ background: 'var(--primary)' }}
          >
            <Plus size={12} />
            Invite Member
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto p-5">
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* Table header */}
          <div
            className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] px-4 py-2.5 border-b"
            style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
          >
            {['Member', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
              <span key={h} className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {displayed.map((user, idx) => {
            const roleCfg = ROLE_CONFIG[user.role];
            const isOwner = user.role === 'owner';

            return (
              <div
                key={user.id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] items-center px-4 py-3 hover:bg-[var(--muted)] transition-colors"
                style={{
                  borderTop: idx > 0 ? '1px solid var(--border)' : 'none',
                  background: 'var(--card)',
                }}
              >
                {/* Member */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                    style={{ background: AVATAR_COLORS[user.id], fontFamily: 'var(--font-family-mono)' }}
                  >
                    {user.avatar}
                  </div>
                  <div>
                    <p className="text-xs text-[var(--foreground)]">{user.name}</p>
                    <p
                      className="text-[10px] text-[var(--muted-foreground)]"
                      style={{ fontFamily: 'var(--font-family-mono)' }}
                    >
                      @{user.githubHandle}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <span className="text-xs text-[var(--muted-foreground)]">{user.email}</span>

                {/* Role */}
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] w-fit"
                  style={{ background: roleCfg.bg, color: roleCfg.color }}
                >
                  <Shield size={9} />
                  {roleCfg.label}
                </span>

                {/* Joined */}
                <span
                  className="text-[10px] text-[var(--muted-foreground)]"
                  style={{ fontFamily: 'var(--font-family-mono)' }}
                >
                  {user.joinedDate}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {!isOwner && (
                    <>
                      <button
                        className="px-2 py-1 rounded text-[10px] text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
                      >
                        Edit role
                      </button>
                      <button
                        className="px-2 py-1 rounded text-[10px] text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    </>
                  )}
                  {isOwner && (
                    <span className="text-[10px] text-[var(--muted-foreground)] italic">Owner</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {displayed.length === 0 && (
          <div className="text-center py-12">
            <Users size={32} className="mx-auto text-[var(--muted)] mb-2" />
            <p className="text-sm text-[var(--muted-foreground)]">No members match your search</p>
          </div>
        )}
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  );
}
