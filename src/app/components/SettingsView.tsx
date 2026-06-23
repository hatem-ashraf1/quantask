import { useEffect, useState } from 'react';
import {
  Save, AlertTriangle, Trash2, LogOut, Lock, Shield, X,
  ChevronRight, Users, Building2, Key, Check, Github
} from 'lucide-react';
import { PROJECTS, WORKSPACE, USERS, CURRENT_USER, User } from '../data/store';
import {
  assignProjectMember,
  deleteWorkspace,
  deleteProject,
  fetchProjectMembers,
  fetchWorkspaceMembers,
  leaveWorkspace,
  removeProjectMember,
  transferWorkspaceOwnership,
  updateProjectMemberRole,
  updateWorkspace,
} from '../api/client';
import { GitHubIntegrationSection } from './GitHubIntegrationSection';
import { canManageProjectMembers } from '../utils/permissions';

const ROLE_LABELS: Record<User['role'], string> = {
  owner: 'Owner',
  pm: 'Project Manager',
  developer: 'Developer',
  viewer: 'Viewer',
};

function secondaryMemberLabel(user: User) {
  if (user.email) return user.email;
  if (user.githubHandle?.startsWith('id:')) return `Owner ID: ${user.githubHandle.slice(3)}`;
  if (user.githubHandle) return `@${user.githubHandle}`;
  return 'No profile details returned';
}

function TransferOwnershipModal({ onClose, onTransfer }: { onClose: () => void; onTransfer: (userId: string) => Promise<void> }) {
  const [selectedUser, setSelectedUser] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const eligibleUsers = USERS.filter((u) => u.id !== CURRENT_USER.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', fontFamily: 'var(--font-family-body)' }}
      >
        <div
          className="flex items-center gap-3 px-5 py-4 border-b"
          style={{ background: '#fffbeb', borderColor: '#fde68a' }}
        >
          <AlertTriangle size={16} className="text-amber-500" />
          <h2 className="text-sm text-amber-800">Transfer Workspace Ownership</h2>
          <button onClick={onClose} className="ml-auto p-1 rounded hover:bg-amber-100 text-amber-600">
            <X size={14} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Transferring ownership is permanent. The new owner will have full administrative control. You will be
            downgraded to <strong>Project Manager</strong>.
          </p>

          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Select new owner</label>
            <div className="space-y-2">
              {eligibleUsers.length === 0 && (
                <p className="rounded-lg border px-3 py-2 text-xs text-[var(--muted-foreground)]" style={{ borderColor: 'var(--border)' }}>
                  Invite another member before transferring ownership.
                </p>
              )}
              {eligibleUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all"
                  style={{
                    borderColor: selectedUser === u.id ? 'var(--primary)' : 'var(--border)',
                    background: selectedUser === u.id ? 'var(--secondary)' : 'transparent',
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                    style={{ background: '#5c5cf5', fontFamily: 'var(--font-family-mono)' }}
                  >
                    {u.avatar}
                  </div>
                  <div>
                    <p className="text-xs text-[var(--foreground)]">{u.name}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">{u.email}</p>
                  </div>
                  {selectedUser === u.id && <Check size={14} className="ml-auto text-[var(--primary)]" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">
              Type <strong style={{ fontFamily: 'var(--font-family-mono)' }}>{WORKSPACE.name}</strong> to confirm
            </label>
            <input
              type="text"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={WORKSPACE.name}
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none"
              style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>
          {error && (
            <div className="rounded-lg border px-3 py-2 text-xs" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}>
              {error}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)]">
            Cancel
          </button>
          <button
            disabled={!selectedUser || confirm !== WORKSPACE.name || saving}
            onClick={async () => {
              setSaving(true);
              setError('');
              try {
                await onTransfer(selectedUser);
                onClose();
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Unable to transfer ownership.');
              } finally {
                setSaving(false);
              }
            }}
            className="px-4 py-2 rounded-lg text-xs text-white disabled:opacity-40 transition-opacity"
            style={{ background: '#f59e0b' }}
          >
            {saving ? 'Transferring...' : 'Transfer Ownership'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteWorkspaceModal({ onClose, onDelete }: { onClose: () => void; onDelete: () => Promise<void> }) {
  const [confirm, setConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: 'var(--card)', borderColor: '#fca5a5', fontFamily: 'var(--font-family-body)' }}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ background: '#fef2f2', borderColor: '#fca5a5' }}>
          <Trash2 size={16} className="text-red-500" />
          <h2 className="text-sm text-red-800">Delete Workspace</h2>
          <button onClick={onClose} className="ml-auto p-1 rounded hover:bg-red-100 text-red-400"><X size={14} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="p-3 rounded-lg" style={{ background: '#fef2f2' }}>
            <p className="text-xs text-red-700 leading-relaxed">
              <strong>This action is irreversible.</strong> All projects, tasks, sprints, comments, and member data
              will be permanently deleted. There is no recovery.
            </p>
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">
              Type <strong style={{ fontFamily: 'var(--font-family-mono)' }}>{WORKSPACE.slug}</strong> to confirm deletion
            </label>
            <input
              type="text"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none"
              style={{ background: 'var(--input-background)', borderColor: '#fca5a5', color: 'var(--foreground)', fontFamily: 'var(--font-family-mono)' }}
            />
          </div>
          {error && (
            <div className="rounded-lg border px-3 py-2 text-xs" style={{ background: '#fff1f2', borderColor: '#fecdd3', color: '#be123c' }}>
              {error}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)]">Cancel</button>
          <button
            disabled={confirm !== WORKSPACE.slug}
            onClick={async () => {
              setDeleting(true);
              setError('');
              try {
                await onDelete();
                onClose();
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Unable to delete workspace.');
              } finally {
                setDeleting(false);
              }
            }}
            className="px-4 py-2 rounded-lg text-xs text-white bg-red-500 disabled:opacity-40"
          >
            {deleting ? 'Deleting...' : 'Delete permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface SettingsViewProps {
  settingsType?: 'workspace' | 'project';
  projectId?: string;
  onWorkspaceExited?: () => void;
  onProjectDeleted?: () => void;
}

export function SettingsView({ settingsType = 'workspace', projectId, onWorkspaceExited, onProjectDeleted }: SettingsViewProps) {
  const [name, setName] = useState(WORKSPACE.name);
  const [slug, setSlug] = useState(WORKSPACE.slug);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [notice, setNotice] = useState('');
  const [apiKey, setApiKey] = useState('qt_sk_demo_placeholder_key');
  const [activeSection, setActiveSection] = useState('general');
  const [viewMode, setViewMode] = useState<'workspace' | 'project'>(settingsType);
  const [members, setMembers] = useState(USERS);
  const [projectMembers, setProjectMembers] = useState<User[]>([]);
  const [projectMemberToAdd, setProjectMemberToAdd] = useState('');
  const [projectMemberSaving, setProjectMemberSaving] = useState(false);
  const [projectRoleSavingUserId, setProjectRoleSavingUserId] = useState('');
  const [projectDeleting, setProjectDeleting] = useState(false);
  const selectedProject = projectId ? PROJECTS.find((item) => item.id === projectId) : undefined;
  const currentUserCanManageProjectMembers = Boolean(projectId && canManageProjectMembers(projectId));
  const addableProjectMembers = USERS.filter(
    (user) => user.role !== 'viewer' && !projectMembers.some((member) => member.id === user.id)
  );
  const otherMembers = USERS.filter((u) => u.id !== CURRENT_USER.id);
  const currentUserIsWorkspaceOwner = WORKSPACE.ownerId === CURRENT_USER.id;
  const currentUserIsOwner = currentUserIsWorkspaceOwner || CURRENT_USER.role === 'owner';
  const currentUserCanManageWorkspace = currentUserIsOwner;
  const projectMemberRole = (user: User) => (user.id === WORKSPACE.ownerId ? 'owner' : user.role);

  useEffect(() => {
    setViewMode(settingsType);
    setActiveSection('general');
  }, [settingsType, projectId]);

  useEffect(() => {
    if (!WORKSPACE.id || activeSection !== 'members' || viewMode !== 'workspace') return;

    fetchWorkspaceMembers(WORKSPACE.id)
      .then((workspaceMembers) => setMembers([...workspaceMembers]))
      .catch(() => setMembers([...USERS]));
  }, [activeSection, viewMode]);

  useEffect(() => {
    if (!projectId || (activeSection !== 'members' && activeSection !== 'danger') || viewMode !== 'project') return;

    const localProjectMembers = USERS.filter((user) => selectedProject?.memberIds.includes(user.id));
    setProjectMembers(localProjectMembers);

    fetchProjectMembers(projectId)
      .then((loadedMembers) => setProjectMembers([...loadedMembers]))
      .catch(() => setProjectMembers(localProjectMembers));
  }, [activeSection, projectId, selectedProject?.memberIds.join(','), viewMode]);

  const exitWorkspace = () => {
    USERS.splice(0, USERS.length);
    PROJECTS.splice(0, PROJECTS.length);
    onWorkspaceExited?.();
  };

  const handleLeaveWorkspace = async () => {
    setNotice('');
    if (currentUserIsOwner) {
      if (otherMembers.length === 0) {
        setNotice('You are the owner and the only member. Delete the workspace instead of leaving it.');
        return;
      }

      setShowTransfer(true);
      return;
    }

    await leaveWorkspace(WORKSPACE.id);
    exitWorkspace();
  };

  const transferOwnership = async (userId: string) => {
    await transferWorkspaceOwnership(WORKSPACE.id, userId);
    const current = USERS.find((user) => user.id === CURRENT_USER.id);
    const nextOwner = USERS.find((user) => user.id === userId);
    if (current) current.role = 'pm';
    if (nextOwner) nextOwner.role = 'owner';
    setNotice('Workspace ownership transferred. You are now a Project Manager.');
    setMembers([...USERS]);
  };

  const addProjectMember = async () => {
    if (!projectId || !projectMemberToAdd) return;
    if (!currentUserCanManageProjectMembers) {
      setNotice('Only a project manager can add members to this project.');
      return;
    }

    setProjectMemberSaving(true);
    setNotice('');

    try {
      await assignProjectMember(projectId, projectMemberToAdd, 'developer');
      const user = USERS.find((item) => item.id === projectMemberToAdd);
      if (user) {
        setProjectMembers((prev) => [...prev.filter((member) => member.id !== user.id), user]);
      }
      setProjectMemberToAdd('');
      setNotice('Project member added.');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Unable to add project member.');
    } finally {
      setProjectMemberSaving(false);
    }
  };

  const removeMemberFromProject = async (userId: string) => {
    if (!projectId) return;
    if (userId === WORKSPACE.ownerId) {
      setNotice('The workspace owner cannot be removed from a project.');
      return;
    }

    if (!currentUserCanManageProjectMembers) {
      setNotice('Only a project manager can remove members from this project.');
      return;
    }

    setProjectMemberSaving(true);
    setNotice('');

    try {
      await removeProjectMember(projectId, userId);
      setProjectMembers((prev) => prev.filter((member) => member.id !== userId));
      setNotice('Project member removed.');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Unable to remove project member.');
    } finally {
      setProjectMemberSaving(false);
    }
  };

  const changeProjectMemberRole = async (userId: string, role: User['role']) => {
    if (!projectId || !currentUserCanManageProjectMembers) return;
    setProjectRoleSavingUserId(userId);
    setNotice('');

    try {
      const loadedMembers = await updateProjectMemberRole(projectId, userId, role);
      setProjectMembers([...loadedMembers]);
      setNotice('Project member role updated.');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Unable to update the project member role.');
    } finally {
      setProjectRoleSavingUserId('');
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId || !selectedProject) return;
    if (!currentUserCanManageProjectMembers) {
      setNotice('Only the workspace owner or this project manager can archive this project.');
      return;
    }

    const confirmed = window.confirm(`Archive ${selectedProject.name}? Tasks and sprints will be hidden with this project.`);
    if (!confirmed) return;

    setProjectDeleting(true);
    setNotice('');

    try {
      await deleteProject(projectId);
      setNotice('Project archived.');
      onProjectDeleted?.();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Unable to archive project.');
    } finally {
      setProjectDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!currentUserCanManageWorkspace) {
      setSaveError('Only the workspace owner can update workspace settings.');
      return;
    }
    setSaving(true);
    setSaved(false);
    setSaveError('');

    try {
      await updateWorkspace(WORKSPACE.id, name);
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Unable to save workspace.');
    } finally {
      setSaving(false);
    }
  };

  const workspaceSections = [
    { id: 'general', label: 'General', icon: <Building2 size={13} /> },
    { id: 'members', label: 'Members & Roles', icon: <Users size={13} /> },
    { id: 'security', label: 'Security', icon: <Shield size={13} /> },
    { id: 'danger', label: 'Danger Zone', icon: <AlertTriangle size={13} /> },
  ];

  const projectSections = [
    { id: 'general', label: 'General', icon: <Building2 size={13} /> },
    { id: 'members', label: 'Project Members', icon: <Users size={13} /> },
    { id: 'github', label: 'GitHub Integration', icon: <Github size={13} /> },
    { id: 'danger', label: 'Danger Zone', icon: <AlertTriangle size={13} /> },
  ];

  const sections = viewMode === 'workspace' ? workspaceSections : projectSections;

  return (
    <div className="flex h-full overflow-hidden" style={{ fontFamily: 'var(--font-family-body)' }}>
      {/* Settings sidebar */}
      <div
        className="w-48 flex-shrink-0 border-r p-3"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] px-2 mb-2">
          {viewMode === 'workspace' ? 'Workspace' : selectedProject?.name || 'Project'}
        </p>
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-left transition-colors mb-0.5 ${
              activeSection === s.id
                ? 'bg-[var(--secondary)] text-[var(--primary)]'
                : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
            } ${s.id === 'danger' ? '!text-red-500 hover:!bg-red-50' : ''}`}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        {notice && (
          <div className="mb-4 rounded-lg border px-3 py-2 text-xs" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}>
            {notice}
          </div>
        )}
        {viewMode === 'project' && activeSection === 'general' && (
          <div className="max-w-lg space-y-6">
            <div>
              <h2 className="text-base text-[var(--foreground)] mb-0.5">Project Settings</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Manage project name, description, and configuration.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Project name</label>
                <input
                  type="text"
                  defaultValue=""
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                  style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Description</label>
                <textarea
                  defaultValue=""
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-none"
                  style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Project key</label>
                <input
                  type="text"
                  defaultValue=""
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                  style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)', fontFamily: 'var(--font-family-mono)' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs text-white transition-all"
                style={{ background: saved ? '#22c55e' : 'var(--primary)' }}
              >
                {saved ? <Check size={13} /> : <Save size={13} />}
                {saved ? 'Saved!' : 'Save changes'}
              </button>
            </div>
          </div>
        )}

        {viewMode === 'project' && activeSection === 'members' && (
          <div className="max-w-lg">
            <div className="mb-6">
              <h2 className="text-base text-[var(--foreground)] mb-0.5">Project Members</h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                {currentUserCanManageProjectMembers
                  ? 'Add workspace members to this project before assigning tasks to them.'
                  : 'Project members are managed by project managers.'}
              </p>
            </div>
            <div className="space-y-2">
              {projectMembers.map((user) => (
                <div
                  key={user.id}
                  className="rounded-xl border p-4 flex items-center justify-between"
                  style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ background: '#5c5cf5', fontFamily: 'var(--font-family-mono)' }}
                    >
                      {user.avatar}
                    </div>
                    <div>
                      <p className="text-xs text-[var(--foreground)]">{user.name}</p>
                      <p className="text-[10px] text-[var(--muted-foreground)]">{user.email}</p>
                    </div>
                  </div>
                  {currentUserCanManageProjectMembers && user.id !== CURRENT_USER.id && user.id !== WORKSPACE.ownerId ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={user.role}
                        disabled={projectRoleSavingUserId === user.id || projectMemberSaving}
                        onChange={(event) => changeProjectMemberRole(user.id, event.target.value as User['role'])}
                        className="rounded-md border px-2 py-1 text-[10px] outline-none"
                        style={{ background: 'var(--input-background)', borderColor: 'var(--border)' }}
                      >
                        <option value="pm">Project Manager</option>
                        <option value="developer">Developer</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <button
                        disabled={projectMemberSaving || projectRoleSavingUserId === user.id}
                        onClick={() => removeMemberFromProject(user.id)}
                        className="text-xs text-red-500 hover:underline disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {user.id === CURRENT_USER.id ? 'You' : ROLE_LABELS[projectMemberRole(user)]}
                    </span>
                  )}
                </div>
              ))}
              {projectMembers.length === 0 && (
                <p className="rounded-xl border px-4 py-3 text-xs text-[var(--muted-foreground)]" style={{ borderColor: 'var(--border)' }}>
                  No project members have been loaded yet.
                </p>
              )}
            </div>
            {currentUserCanManageProjectMembers ? (
              <>
                <div className="mt-4 flex gap-2">
                  <select
                    value={projectMemberToAdd}
                    onChange={(event) => setProjectMemberToAdd(event.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border text-xs outline-none"
                    style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  >
                    <option value="">Select workspace member</option>
                    {addableProjectMembers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  <button
                    disabled={!projectMemberToAdd || projectMemberSaving}
                    onClick={addProjectMember}
                    className="px-4 py-2 rounded-lg text-xs text-white disabled:opacity-40"
                    style={{ background: 'var(--primary)' }}
                  >
                    Add
                  </button>
                </div>
                {addableProjectMembers.length === 0 && (
                  <p className="mt-2 text-[10px] text-[var(--muted-foreground)]">
                    All available workspace members are already on this project.
                  </p>
                )}
              </>
            ) : (
              <p className="mt-4 rounded-lg border px-3 py-2 text-xs text-[var(--muted-foreground)]" style={{ borderColor: 'var(--border)' }}>
                You can view project members, but only project managers can add or remove them.
              </p>
            )}
          </div>
        )}

        {viewMode === 'project' && activeSection === 'github' && projectId && (
          <GitHubIntegrationSection projectId={projectId} />
        )}

        {viewMode === 'project' && activeSection === 'danger' && (
          <div className="max-w-lg space-y-6">
            <div>
              <h2 className="text-base text-red-500 mb-0.5">Danger Zone</h2>
              <p className="text-xs text-[var(--muted-foreground)]">These actions affect this project only.</p>
            </div>

            <div
              className="rounded-xl border p-5"
              style={{ borderColor: '#fca5a5', background: '#fef2f2' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm text-red-600 mb-1">Archive Project</h3>
                  <p className="text-xs text-red-500 leading-relaxed">
                    Archive this project. Tasks and sprints will be preserved but hidden with the project.
                  </p>
                </div>
                <button
                  disabled={!currentUserCanManageProjectMembers || projectDeleting}
                  onClick={handleDeleteProject}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs bg-red-500 text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 size={12} />
                  {projectDeleting ? 'Archiving...' : 'Archive'}
                </button>
              </div>
              {!currentUserCanManageProjectMembers && (
                <p className="mt-3 text-xs text-red-500">
                  Only the workspace owner or this project manager can archive this project.
                </p>
              )}
            </div>
          </div>
        )}

        {viewMode === 'workspace' && activeSection === 'general' && (
          <div className="max-w-lg space-y-6">
            <div>
              <h2 className="text-base text-[var(--foreground)] mb-0.5">General Settings</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Manage your workspace name, URL, and metadata.</p>
            </div>

            {saveError && (
              <div
                className="rounded-lg border px-3 py-2 text-xs"
                style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}
              >
                {saveError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Workspace name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                  style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">URL slug</label>
                <div className="flex items-center gap-0 rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                  <span className="px-3 py-2.5 text-sm text-[var(--muted-foreground)]" style={{ background: 'var(--muted)' }}>
                    quantask.dev/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 px-3 py-2.5 text-sm outline-none"
                    style={{ background: 'var(--input-background)', color: 'var(--foreground)', fontFamily: 'var(--font-family-mono)' }}
                  />
                </div>
              </div>

              {currentUserCanManageWorkspace && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs text-white transition-all"
                  style={{ background: saved ? '#22c55e' : 'var(--primary)' }}
                >
                  {saved ? <Check size={13} /> : <Save size={13} />}
                  {saving ? 'Saving...' : saved ? 'Saved!' : 'Save changes'}
                </button>
              )}
            </div>
          </div>
        )}

        {viewMode === 'workspace' && activeSection === 'security' && (
          <div className="max-w-lg space-y-6">
            <div>
              <h2 className="text-base text-[var(--foreground)] mb-0.5">Security</h2>
              <p className="text-xs text-[var(--muted-foreground)]">API keys, SSO configuration, and session management.</p>
            </div>
            <div
              className="rounded-xl border p-4 space-y-3"
              style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key size={14} className="text-[var(--muted-foreground)]" />
                  <span className="text-xs text-[var(--foreground)]">API Key</span>
                </div>
                <button
                  onClick={() => {
                    setApiKey(`qt_sk_${Math.random().toString(36).slice(2, 14)}${Date.now().toString(36)}`);
                    setNotice('API key regenerated for this session.');
                  }}
                  className="text-xs text-[var(--primary)] hover:underline"
                >
                  Regenerate
                </button>
              </div>
              <code
                className="block px-3 py-2 rounded-lg text-xs"
                style={{
                  background: 'var(--muted)',
                  color: 'var(--muted-foreground)',
                  fontFamily: 'var(--font-family-mono)',
                }}
              >
                {apiKey}
              </code>
              {notice && <p className="text-[10px] text-emerald-600">{notice}</p>}
              <p className="text-[10px] text-[var(--muted-foreground)]">
                Use this key to authenticate the QuanTask GitHub App and AI engine integrations.
              </p>
            </div>
          </div>
        )}

        {viewMode === 'workspace' && activeSection === 'danger' && (
          <div className="max-w-lg space-y-6">
            <div>
              <h2 className="text-base text-red-500 mb-0.5">Danger Zone</h2>
              <p className="text-xs text-[var(--muted-foreground)]">These actions are permanent and cannot be undone.</p>
            </div>

            {/* Transfer ownership */}
            <div
              className="rounded-xl border p-5"
              style={{ borderColor: '#fde68a', background: '#fffbeb' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm text-amber-800 mb-1">Transfer Ownership</h3>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Transfer full ownership of this workspace to another member. You will be downgraded to PM.
                  </p>
                </div>
                <button
                  disabled={!currentUserCanManageWorkspace}
                  onClick={() => setShowTransfer(true)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border border-amber-300 text-amber-700 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Shield size={12} />
                  Transfer
                </button>
              </div>
            </div>

            {/* Leave workspace */}
            <div
              className="rounded-xl border p-5"
              style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm text-[var(--foreground)] mb-1">Leave Workspace</h3>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    {currentUserIsOwner
                      ? otherMembers.length === 0
                        ? 'Owners cannot leave as the only member. Delete the workspace instead.'
                        : 'Owners must transfer ownership to another member before leaving.'
                      : 'You will lose access to all projects and data in this workspace.'}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await handleLeaveWorkspace();
                    } catch (err) {
                      setNotice(err instanceof Error ? err.message : 'Unable to leave workspace.');
                    }
                  }}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border text-red-500 border-red-200 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {currentUserIsOwner && <Lock size={12} />}
                  {!currentUserIsOwner && <LogOut size={12} />}
                  {currentUserIsOwner ? 'Transfer first' : 'Leave'}
                </button>
              </div>
              {currentUserIsOwner && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  <Lock size={11} />
                  Transfer ownership first. After transfer, your role becomes Project Manager and you can leave normally.
                </div>
              )}
            </div>

            {/* Delete workspace */}
            <div
              className="rounded-xl border p-5"
              style={{ borderColor: '#fca5a5', background: '#fef2f2' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm text-red-600 mb-1">Delete Workspace</h3>
                  <p className="text-xs text-red-500 leading-relaxed">
                    Permanently delete this workspace and all its data. This cannot be undone.
                  </p>
                </div>
                <button
                  disabled={!currentUserCanManageWorkspace}
                  onClick={() => setShowDelete(true)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs bg-red-500 text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'workspace' && activeSection === 'members' && (
          <div className="max-w-lg">
            <div className="mb-6">
              <h2 className="text-base text-[var(--foreground)] mb-0.5">Members & Roles</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Configure role-based access control for workspace members.</p>
            </div>
            <div className="space-y-2">
              {['owner', 'member'].map((role) => {
                const perms: Record<string, string[]> = {
                  owner: ['Full access', 'Delete workspace', 'Transfer ownership', 'Manage all members'],
                  member: ['View workspace dashboard', 'View workspace directory', 'Receive project assignments'],
                };
                return (
                  <div
                    key={role}
                    className="rounded-xl border p-4"
                    style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={13} className="text-[var(--muted-foreground)]" />
                      <span className="text-xs text-[var(--foreground)] capitalize">{role}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {perms[role].map((p) => (
                        <span
                          key={p}
                          className="px-2 py-0.5 rounded text-[10px]"
                          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <h3 className="text-sm text-[var(--foreground)] mb-2">Workspace Members</h3>
              <p className="text-xs text-[var(--muted-foreground)] mb-3">
                Project Manager, Developer, and Viewer roles are assigned separately inside each project.
              </p>
              <div className="space-y-2">
                {members.map((member) => {
                  const isWorkspaceOwner = member.id === WORKSPACE.ownerId || member.role === 'owner';
                  return (
                    <div
                      key={member.id}
                      className="rounded-xl border p-4 flex items-center justify-between gap-4"
                      style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                          style={{ background: '#5c5cf5', fontFamily: 'var(--font-family-mono)' }}
                        >
                          {member.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-[var(--foreground)] truncate">{member.name}</p>
                          <p className="text-[10px] text-[var(--muted-foreground)] truncate">{secondaryMemberLabel(member)}</p>
                        </div>
                      </div>

                      <span
                        className="px-2 py-1 rounded-full text-[10px]"
                        style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
                      >
                        {isWorkspaceOwner ? 'Owner' : 'Member'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {showTransfer && <TransferOwnershipModal onClose={() => setShowTransfer(false)} onTransfer={transferOwnership} />}
      {showDelete && (
        <DeleteWorkspaceModal
          onClose={() => setShowDelete(false)}
          onDelete={async () => {
            await deleteWorkspace(WORKSPACE.id);
            exitWorkspace();
          }}
        />
      )}
    </div>
  );
}
