import { useState } from 'react';
import {
  Save, AlertTriangle, Trash2, LogOut, Lock, Shield, X,
  ChevronRight, Users, Building2, Key, Check
} from 'lucide-react';
import { WORKSPACE, USERS, CURRENT_USER } from '../data/mockData';

function TransferOwnershipModal({ onClose }: { onClose: () => void }) {
  const [selectedUser, setSelectedUser] = useState('');
  const [confirm, setConfirm] = useState('');

  const eligibleUsers = USERS.filter((u) => u.id !== CURRENT_USER.id && u.role !== 'viewer');

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
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)]">
            Cancel
          </button>
          <button
            disabled={!selectedUser || confirm !== WORKSPACE.name}
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs text-white disabled:opacity-40 transition-opacity"
            style={{ background: '#f59e0b' }}
          >
            Transfer Ownership
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteWorkspaceModal({ onClose }: { onClose: () => void }) {
  const [confirm, setConfirm] = useState('');
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
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)]">Cancel</button>
          <button
            disabled={confirm !== WORKSPACE.slug}
            className="px-4 py-2 rounded-lg text-xs text-white bg-red-500 disabled:opacity-40"
          >
            Delete permanently
          </button>
        </div>
      </div>
    </div>
  );
}

interface SettingsViewProps {
  settingsType?: 'workspace' | 'project';
  projectId?: string;
}

export function SettingsView({ settingsType = 'workspace', projectId }: SettingsViewProps) {
  const [name, setName] = useState(WORKSPACE.name);
  const [slug, setSlug] = useState(WORKSPACE.slug);
  const [saved, setSaved] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [activeSection, setActiveSection] = useState('general');
  const [viewMode, setViewMode] = useState<'workspace' | 'project'>(settingsType);
  const isSoleOwner = USERS.filter((u) => u.role === 'owner').length === 1;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
        {/* Toggle between workspace and project settings */}
        <div className="mb-4 p-1 rounded-lg" style={{ background: 'var(--muted)' }}>
          <button
            onClick={() => {
              setViewMode('workspace');
              setActiveSection('general');
            }}
            className={`w-full px-2 py-1.5 rounded text-xs transition-colors ${
              viewMode === 'workspace'
                ? 'bg-white text-[var(--foreground)] shadow-sm'
                : 'text-[var(--muted-foreground)]'
            }`}
          >
            Workspace
          </button>
          <button
            onClick={() => {
              setViewMode('project');
              setActiveSection('general');
            }}
            className={`w-full px-2 py-1.5 rounded text-xs transition-colors ${
              viewMode === 'project'
                ? 'bg-white text-[var(--foreground)] shadow-sm'
                : 'text-[var(--muted-foreground)]'
            }`}
          >
            Project
          </button>
        </div>

        <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] px-2 mb-2">
          {viewMode === 'workspace' ? 'Workspace' : 'Project'}
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
                  defaultValue="AI Engine"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                  style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Description</label>
                <textarea
                  defaultValue="Core machine learning engine for task assignment recommendations"
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
                  defaultValue="AIENG"
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
              <p className="text-xs text-[var(--muted-foreground)]">Manage who has access to this specific project.</p>
            </div>
            <div className="space-y-2">
              {USERS.filter((u) => ['alice', 'bob', 'carol'].includes(u.id)).map((user) => (
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
                  <button className="text-xs text-red-500 hover:underline">Remove</button>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full px-4 py-2 rounded-lg text-xs border transition-colors hover:bg-[var(--muted)]" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              + Add member to project
            </button>
          </div>
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
                    Archive this project. Tasks will be preserved but the project will be hidden.
                  </p>
                </div>
                <button
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={12} />
                  Archive
                </button>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'workspace' && activeSection === 'general' && (
          <div className="max-w-lg space-y-6">
            <div>
              <h2 className="text-base text-[var(--foreground)] mb-0.5">General Settings</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Manage your workspace name, URL, and metadata.</p>
            </div>

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
                <button className="text-xs text-[var(--primary)] hover:underline">Regenerate</button>
              </div>
              <code
                className="block px-3 py-2 rounded-lg text-xs"
                style={{
                  background: 'var(--muted)',
                  color: 'var(--muted-foreground)',
                  fontFamily: 'var(--font-family-mono)',
                }}
              >
                qt_sk_••••••••••••••••••••••••••••••
              </code>
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
                  onClick={() => setShowTransfer(true)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border border-amber-300 text-amber-700 hover:bg-amber-100 transition-colors"
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
                    {isSoleOwner
                      ? 'You cannot leave as the sole owner. Transfer ownership first.'
                      : 'You will lose access to all projects and data in this workspace.'}
                  </p>
                </div>
                <button
                  disabled={isSoleOwner}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border text-red-500 border-red-200 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {isSoleOwner && <Lock size={12} />}
                  {!isSoleOwner && <LogOut size={12} />}
                  Leave
                </button>
              </div>
              {isSoleOwner && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  <Lock size={11} />
                  You are the sole owner — transfer ownership before leaving.
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
                  disabled={isSoleOwner ? false : true}
                  onClick={() => setShowDelete(true)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs bg-red-500 text-white hover:bg-red-600 transition-colors"
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
              {['owner', 'pm', 'developer', 'viewer'].map((role) => {
                const perms: Record<string, string[]> = {
                  owner: ['Full access', 'Delete workspace', 'Transfer ownership', 'Manage all members'],
                  pm: ['Manage sprints', 'Approve Done status', 'Create dependencies', 'Add project members'],
                  developer: ['Execute tasks', 'Self-assign', 'Post comments', 'Toggle sub-tasks'],
                  viewer: ['Read-only board access', 'View task details'],
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
          </div>
        )}
      </div>

      {showTransfer && <TransferOwnershipModal onClose={() => setShowTransfer(false)} />}
      {showDelete && <DeleteWorkspaceModal onClose={() => setShowDelete(false)} />}
    </div>
  );
}
