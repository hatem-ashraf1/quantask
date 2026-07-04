import { Plus, Users, ChevronRight, Briefcase, Mail, Check, X, Bell, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  acceptInvitation,
  ApiError,
  createWorkspace,
  fetchPendingInvitations,
  fetchNotifications,
  fetchWorkspaces,
  getRememberedWorkspaces,
  isUnauthorizedError,
  markNotificationRead,
  rememberJoinedWorkspace,
  rememberWorkspaceOwner,
  rejectInvitation,
  PendingWorkspaceInvitation,
  RememberedWorkspace,
} from '../api/client';
import { NOTIFICATIONS, Notification } from '../data/store';

interface Workspace {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  role: 'Owner' | 'Project Manager' | 'Developer' | 'Viewer';
}

interface WorkspaceSelectorProps {
  onWorkspaceSelect: (workspaceId: string, role?: Workspace['role']) => void;
  onSessionExpired: () => void;
  onLogout: () => void;
  initialError?: string;
}

const NOTIF_LABELS: Record<Notification['type'], string> = {
  deadline: 'Deadline',
  assigned: 'Assigned',
  review: 'Review',
  mention: 'Mention',
  blocked: 'Blocked',
};

// Converts whatever role spelling the backend returns into the exact labels this screen displays.
function toWorkspaceRole(role?: string): Workspace['role'] {
  const normalized = String(role || '').toLowerCase().replace(/[\s_-]/g, '');
  if (normalized === 'owner') return 'Owner';
  if (normalized === 'pm' || normalized === 'projectmanager') return 'Project Manager';
  if (normalized === 'viewer') return 'Viewer';
  return 'Developer';
}

function mapWorkspaceCard(workspace: Awaited<ReturnType<typeof fetchWorkspaces>>[number]): Workspace {
  return {
    id: workspace.id,
    name: workspace.name,
    description: workspace.description || 'Workspace',
    memberCount: workspace.memberCount || workspace.workspaceMembers?.length || workspace.members?.length || workspace.Members?.length || 0,
    role: toWorkspaceRole(workspace.role),
  };
}

function mapRememberedWorkspaceCard(workspace: RememberedWorkspace): Workspace {
  return {
    id: workspace.id,
    name: workspace.name,
    description: workspace.description || 'Workspace',
    memberCount: workspace.memberCount || 0,
    role: toWorkspaceRole(workspace.role),
  };
}

// Keeps recently joined workspaces visible even if the API response temporarily omits them.
function mergeWorkspaceCards(apiWorkspaces: Workspace[]) {
  const workspaceIds = new Set(apiWorkspaces.map((workspace) => workspace.id));
  const rememberedWorkspaces = getRememberedWorkspaces()
    .filter((workspace) => workspace.id && !workspaceIds.has(workspace.id))
    .map(mapRememberedWorkspaceCard);

  return [...apiWorkspaces, ...rememberedWorkspaces];
}

function rememberWorkspaceCard(workspace: Workspace) {
  rememberJoinedWorkspace({
    id: workspace.id,
    name: workspace.name,
    description: workspace.description,
    memberCount: workspace.memberCount,
    role: workspace.role,
  });
}

function filterJoinableInvitations(workspaces: Workspace[], pendingInvitations: PendingWorkspaceInvitation[]) {
  const joinedWorkspaceIds = new Set(workspaces.map((workspace) => workspace.id));
  return pendingInvitations.filter((invitation) => !invitation.workspaceId || !joinedWorkspaceIds.has(invitation.workspaceId));
}

export function WorkspaceSelector({ onWorkspaceSelect, onSessionExpired, onLogout, initialError = '' }: WorkspaceSelectorProps) {
  // Entry screen after login: lists workspaces, pending invitations, and the create-workspace form.
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [invitations, setInvitations] = useState<PendingWorkspaceInvitation[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processingInviteId, setProcessingInviteId] = useState('');
  const [error, setError] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const unreadNotifications = notifications.filter((notification) => !notification.read).length;
  const markNotificationsRead = () => {
    const unreadIds = notifications.filter((notification) => !notification.read).map((notification) => notification.id);
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
    unreadIds.forEach((id) => {
      markNotificationRead(id).catch((err) => {
        if (!isUnauthorizedError(err)) {
          console.warn('Unable to mark notification read.', err);
        }
      });
    });
  };

  // Load workspaces and invitations once; the active flag prevents state updates after unmount.
  useEffect(() => {
    let active = true;

    const loadWorkspaceHome = async () => {
      setLoading(true);
      try {
        const [items, pendingInvitations] = await Promise.all([
          fetchWorkspaces(),
          fetchPendingInvitations().catch((err) => {
            if (isUnauthorizedError(err)) throw err;
            return [];
          }),
        ]);
        const unreadNotifications = await fetchNotifications().catch((err) => {
          if (isUnauthorizedError(err)) throw err;
          return NOTIFICATIONS;
        });

        if (!active) return;
        const apiWorkspaceCards = items.map(mapWorkspaceCard);
        apiWorkspaceCards.forEach(rememberWorkspaceCard);
        const workspaceCards = mergeWorkspaceCards(apiWorkspaceCards);
        setWorkspaces(workspaceCards);
        setInvitations(filterJoinableInvitations(workspaceCards, pendingInvitations));
        setNotifications(unreadNotifications);
        setError('');
      } catch (err) {
        if (!active) return;
        if (isUnauthorizedError(err)) {
          onSessionExpired();
          return;
        }
        setError(err instanceof Error ? err.message : 'Unable to load workspaces.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadWorkspaceHome();

    return () => {
      active = false;
    };
  }, []);

  // Re-used after accepting an invite so the UI has the latest workspace list before navigation.
  const refreshWorkspaceHome = async () => {
    const [items, pendingInvitations] = await Promise.all([fetchWorkspaces(), fetchPendingInvitations()]);
    const apiWorkspaceCards = items.map(mapWorkspaceCard);
    apiWorkspaceCards.forEach(rememberWorkspaceCard);
    const workspaceCards = mergeWorkspaceCards(apiWorkspaceCards);
    setWorkspaces(workspaceCards);
    setInvitations(filterJoinableInvitations(workspaceCards, pendingInvitations));
    return workspaceCards;
  };

  // Accepts an invitation, remembers the workspace locally, then opens it for the user.
  const handleAcceptInvitation = async (invitation: PendingWorkspaceInvitation) => {
    const { invitationId, workspaceId } = invitation;

    if (!invitationId) {
      setError('This invitation is missing its id. Please refresh and try again.');
      return;
    }

    setProcessingInviteId(invitationId);
    setError('');

    try {
      rememberWorkspaceOwner(workspaceId, invitation.workspaceOwner);
      await acceptInvitation(invitationId);
      if (workspaceId) {
        rememberJoinedWorkspace({
          id: workspaceId,
          name: invitation.workspaceName,
          description: 'Workspace',
          role: 'Developer',
        });
      }
      const workspaceCards = await refreshWorkspaceHome();
      if (workspaceId) onWorkspaceSelect(workspaceId, 'Developer');
      if (!workspaceId) {
        const acceptedWorkspace = workspaceCards.find((workspace) => workspace.name === invitation.workspaceName);
        if (acceptedWorkspace) {
          rememberWorkspaceCard(acceptedWorkspace);
          onWorkspaceSelect(acceptedWorkspace.id, acceptedWorkspace.role);
        }
      }
    } catch (err) {
      if (isUnauthorizedError(err)) {
        onSessionExpired();
        return;
      }
      if (err instanceof ApiError && (err.status === 400 || err.status === 409)) {
        const workspaceCards = await refreshWorkspaceHome();
        const existingWorkspace = workspaceCards.find(
          (workspace) => workspace.id === workspaceId || workspace.name === invitation.workspaceName
        );

        if (existingWorkspace) {
          setInvitations((current) => current.filter((item) => item.invitationId !== invitationId));
          onWorkspaceSelect(existingWorkspace.id, existingWorkspace.role);
          return;
        }
      }
      setError(err instanceof Error ? err.message : 'Unable to accept invitation.');
    } finally {
      setProcessingInviteId('');
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    if (!invitationId) {
      setError('This invitation is missing its id. Please refresh and try again.');
      return;
    }

    setProcessingInviteId(invitationId);
    setError('');

    try {
      await rejectInvitation(invitationId);
      setInvitations((current) => current.filter((invitation) => invitation.invitationId !== invitationId));
    } catch (err) {
      if (isUnauthorizedError(err)) {
        onSessionExpired();
        return;
      }
      setError(err instanceof Error ? err.message : 'Unable to decline invitation.');
    } finally {
      setProcessingInviteId('');
    }
  };

  // Creates a brand-new workspace and adds it to the list without forcing a full reload.
  const handleCreate = async () => {
    if (newWorkspaceName.trim()) {
      setSaving(true);
      setError('');

      try {
        const workspace = await createWorkspace(newWorkspaceName, newWorkspaceDesc);
        const workspaceCard: Workspace = {
          id: workspace.id,
          name: workspace.name,
          description: workspace.description || newWorkspaceDesc,
          memberCount: workspace.memberCount || 1,
          role: 'Owner',
        };
        rememberWorkspaceCard(workspaceCard);
        setWorkspaces((current) => [...current.filter((item) => item.id !== workspaceCard.id), workspaceCard]);
        setShowCreateForm(false);
        setNewWorkspaceName('');
        setNewWorkspaceDesc('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to create workspace.');
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--background)' }}>
      <div className="fixed right-6 top-6 z-20 flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border transition-colors hover:bg-[var(--muted)]"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifications > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] text-white" style={{ background: 'var(--primary)' }}>
                {unreadNotifications}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setNotificationsOpen(false)} />
              <div
                className="absolute right-0 top-full z-30 mt-2 w-80 overflow-hidden rounded-xl border shadow-xl"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</h2>
                  {unreadNotifications > 0 && (
                    <button type="button" onClick={markNotificationsRead} className="text-xs text-[var(--primary)] hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => {
                          setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read: true } : item));
                          markNotificationRead(notification.id).catch((err) => {
                            if (!isUnauthorizedError(err)) {
                              console.warn('Unable to mark notification read.', err);
                            }
                          });
                        }}
                        className="flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-[var(--muted)]"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full" style={{ background: notification.read ? 'var(--border)' : 'var(--primary)' }} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                            {NOTIF_LABELS[notification.type]}
                          </span>
                          <span className="mt-1 block text-xs" style={{ color: 'var(--text-primary)' }}>
                            {notification.message}
                          </span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex h-10 items-center gap-2 rounded-lg border px-3 text-xs transition-colors hover:bg-red-50"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: '#dc2626' }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Briefcase className="w-12 h-12" style={{ color: 'var(--primary)' }} />
            <h1 className="text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
              QuanTask
            </h1>
          </div>
          <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
            Select a workspace to continue
          </p>
        </div>

        {/* Workspaces grid */}
        {(error || initialError) && (
          <div
            className="mb-4 rounded-lg border px-4 py-3 text-sm"
            style={{ background: '#fffbeb', borderColor: '#fde68a', color: '#92400e' }}
          >
            {error || initialError}
          </div>
        )}

        {loading && (
          <p className="mb-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Loading workspaces...
          </p>
        )}

        {!loading && invitations.length > 0 && (
          <div className="mb-6 rounded-xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <Mail className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Workspace invitations
              </h2>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {invitations.map((invitation, index) => {
                const processing = processingInviteId === invitation.invitationId;

                return (
                  <div key={invitation.invitationId || `${invitation.workspaceId}-${index}`} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {invitation.workspaceName}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                        {invitation.workspaceOwner ? `Invited by ${invitation.workspaceOwner}` : 'Inviter details were not returned'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleRejectInvitation(invitation.invitationId)}
                        disabled={processing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors disabled:opacity-50"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                      >
                        <X className="w-3 h-3" />
                        Decline
                      </button>
                      <button
                        onClick={() => handleAcceptInvitation(invitation)}
                        disabled={processing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white transition-colors disabled:opacity-50"
                        style={{ background: 'var(--primary)' }}
                      >
                        <Check className="w-3 h-3" />
                        {processing ? 'Joining...' : 'Accept'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              onClick={() => onWorkspaceSelect(workspace.id, workspace.role)}
              className="group p-6 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-lg text-left"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {workspace.name}
                  </h3>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {workspace.description}
                  </p>
                </div>
                <ChevronRight
                  className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--primary)' }}
                />
              </div>
              <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{workspace.memberCount} members</span>
                </div>
                <div className="px-2 py-1 rounded-md text-xs font-medium" style={{ background: 'var(--accent-purple-bg)', color: 'var(--accent-purple-text)' }}>
                  {workspace.role}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Create new workspace */}
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full p-6 rounded-xl border-2 border-dashed transition-all hover:scale-105"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <div className="flex items-center justify-center gap-3">
              <Plus className="w-6 h-6" />
              <span className="font-medium">Create new workspace</span>
            </div>
          </button>
        ) : (
          <div className="p-6 rounded-xl border-2" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Create New Workspace
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="e.g., Mobile Team"
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    background: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={newWorkspaceDesc}
                  onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                  placeholder="e.g., iOS and Android development"
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    background: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  disabled={saving}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    background: saving ? 'var(--surface-hover)' : 'var(--primary)',
                    color: 'var(--text-on-primary)',
                  }}
                >
                  {saving ? 'Creating...' : 'Create Workspace'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewWorkspaceName('');
                    setNewWorkspaceDesc('');
                  }}
                  className="px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    background: 'var(--surface-hover)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
