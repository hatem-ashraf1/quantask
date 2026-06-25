import { useEffect, useState } from 'react';
import { Users, Plus, Shield, X, Check, Search } from 'lucide-react';
import { USERS, WORKSPACE, User } from '../data/store';
import { fetchWorkspaceMembers, inviteWorkspaceMember } from '../api/client';
import { HasAccess } from '../authorization/HasAccess';

const AVATAR_COLORS: Record<string, string> = {
  u1: '#5c5cf5', u2: '#22c55e', u3: '#f59e0b', u4: '#ef4444', u5: '#8b5cf6', u6: '#06b6d4',
};

const AVATAR_PALETTE = ['#4f46e5', '#047857', '#b45309', '#be123c', '#7e22ce', '#0e7490'];

// Stable fallback color generator for users not in the predefined avatar map.
function avatarColor(userId: string) {
  if (AVATAR_COLORS[userId]) return AVATAR_COLORS[userId];

  const hash = Array.from(userId).reduce(
    (value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0,
    0
  );
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function secondaryMemberLabel(user: User) {
  if (user.email) return user.email;
  if (user.githubHandle?.startsWith('id:')) return `Owner ID: ${user.githubHandle.slice(3)}`;
  if (user.githubHandle) return `@${user.githubHandle}`;
  return 'No profile details returned';
}

function InviteModal({ onClose, onInvited }: { onClose: () => void; onInvited: () => Promise<void> }) {
  // Owner-only modal for inviting a new member by email.
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await inviteWorkspaceMember(WORKSPACE.id, email);
      await onInvited();
      setSent(true);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send invitation.');
    }
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
          {error && (
            <div
              className="rounded-lg border px-3 py-2 text-xs"
              style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}
            >
              {error}
            </div>
          )}

          {sent && (
            <div
              className="rounded-lg border px-3 py-2 text-xs"
              style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}
            >
              Invitation sent.
            </div>
          )}

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

            <p className="text-[10px] text-[var(--muted-foreground)]">
              Invited members start with the backend default role. Owners can edit roles after they join.
            </p>
          </form>

        </div>
      </div>
    </div>
  );
}

export function MembersDirectory() {
  // Workspace directory: loads members, filters them, and exposes invitations to owners.
  const [showInvite, setShowInvite] = useState(false);
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState<User[]>([...USERS]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState('');

  // Prefer backend members, but fall back to seeded local users if the request fails.
  const loadMembers = async () => {
    if (!WORKSPACE.id) return;

    setLoadingMembers(true);
    setMembersError('');

    try {
      const workspaceMembers = await fetchWorkspaceMembers(WORKSPACE.id);
      setMembers([...workspaceMembers]);
    } catch (err) {
      setMembersError(err instanceof Error ? err.message : 'Unable to load workspace members.');
      setMembers([...USERS]);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [WORKSPACE.id]);

  // Search checks the visible name/email plus the secondary label shown under the avatar.
  const displayed = members.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      secondaryMemberLabel(u).toLowerCase().includes(search.toLowerCase())
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
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            {loadingMembers ? 'Loading members...' : `${members.length} members in ${WORKSPACE.name}`}
          </p>
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
          <HasAccess allowedRoles={['workspace-owner']} targetResource="workspace" resourceId={WORKSPACE.id}>
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white"
              style={{ background: 'var(--primary)' }}
            >
              <Plus size={12} />
              Invite Member
            </button>
          </HasAccess>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto p-5">
        {membersError && (
          <div
            className="mb-4 rounded-lg border px-3 py-2 text-xs"
            style={{ background: '#fffbeb', borderColor: '#fde68a', color: '#92400e' }}
          >
            {membersError}
          </div>
        )}

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
            const isOwner = user.role === 'owner' || user.id === WORKSPACE.ownerId;
            const roleCfg = isOwner
              ? { label: 'Owner', color: '#5c5cf5', bg: '#ededff' }
              : { label: 'Member', color: '#3b82f6', bg: '#eff6ff' };

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
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 select-none"
                    style={{ background: avatarColor(user.id), fontFamily: 'var(--font-family-mono)' }}
                  >
                    {user.avatar}
                  </div>
                  <div>
                    <p className="text-xs text-[var(--foreground)]">{user.name}</p>
                    <p
                      className="text-[10px] text-[var(--muted-foreground)]"
                      style={{ fontFamily: 'var(--font-family-mono)' }}
                    >
                      {secondaryMemberLabel(user)}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <span className="text-xs text-[var(--muted-foreground)]">
                  {user.email || (user.githubHandle?.startsWith('id:') ? user.id : '-')}
                </span>

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
                  {isOwner && (
                    <span className="text-[10px] text-[var(--muted-foreground)] italic">Owner</span>
                  )}
                  {!isOwner && <span className="text-[10px] text-[var(--muted-foreground)] italic">Workspace member</span>}
                </div>
              </div>
            );
          })}
        </div>

        {displayed.length === 0 && (
          <div className="text-center py-12">
            <Users size={32} className="mx-auto text-[var(--muted)] mb-2" />
            <p className="text-sm text-[var(--muted-foreground)]">
              {search ? 'No members match your search' : 'No workspace members were returned'}
            </p>
          </div>
        )}
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onInvited={loadMembers} />}
    </div>
  );
}
