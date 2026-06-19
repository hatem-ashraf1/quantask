import { useState } from 'react';
import { X } from 'lucide-react';
import { CURRENT_USER, USERS, WORKSPACE } from '../data/store';
import { assignProjectMember, createProject } from '../api/client';

interface ProjectCreateModalProps {
  onClose: () => void;
  onCreated: (projectId: string) => void;
}

export function ProjectCreateModal({ onClose, onCreated }: ProjectCreateModalProps) {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const workspaceMembers = USERS.filter((user) => user.id !== CURRENT_USER.id && user.role !== 'viewer');
  const canCreateProject = CURRENT_USER.role === 'owner' || CURRENT_USER.role === 'pm';

  const toggleMember = (userId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    if (!canCreateProject) {
      setError('Only workspace owners and PMs can create projects.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const project = await createProject({
        workspaceId: WORKSPACE.id,
        name: name.trim(),
        key: key.trim() || undefined,
        description: description.trim() || undefined,
      });

      await Promise.all(selectedMemberIds.map((memberId) => assignProjectMember(project.id, memberId, 'developer')));

      onCreated(project.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create project.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm text-[var(--foreground)]">Create new project</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)]">
            <X size={14} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg border px-3 py-2 text-xs" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}>
              {error}
            </div>
          )}
          {!canCreateProject && (
            <div className="rounded-lg border px-3 py-2 text-xs" style={{ background: '#fffbeb', borderColor: '#fde68a', color: '#92400e' }}>
              Only workspace owners and PMs can create projects.
            </div>
          )}
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Project name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Authentication Service"
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Key</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase().slice(0, 5))}
              placeholder="AUTH"
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{
                background: 'var(--input-background)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
                fontFamily: 'var(--font-family-mono)',
              }}
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will this project deliver?"
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
              style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Project members</label>
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <div className="px-3 py-2 text-[10px] text-[var(--muted-foreground)]" style={{ background: 'var(--muted)' }}>
                You will be added as Project Manager automatically.
              </div>
              <div className="max-h-40 overflow-y-auto">
                {workspaceMembers.length === 0 ? (
                  <p className="px-3 py-3 text-xs text-[var(--muted-foreground)]">No other workspace members are available.</p>
                ) : (
                  workspaceMembers.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-3 px-3 py-2 border-t cursor-pointer hover:bg-[var(--muted)]"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMemberIds.includes(member.id)}
                        onChange={() => toggleMember(member.id)}
                      />
                      <span className="flex-1 min-w-0">
                        <span className="block text-xs text-[var(--foreground)] truncate">{member.name}</span>
                        <span className="block text-[10px] text-[var(--muted-foreground)] truncate">{member.email}</span>
                      </span>
                      <span className="text-[10px] text-[var(--muted-foreground)] capitalize">{member.role}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || saving || !canCreateProject}
            className="px-4 py-2 rounded-lg text-sm text-white transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--primary)' }}
          >
            {saving ? 'Creating...' : 'Create project'}
          </button>
        </div>
      </div>
    </div>
  );
}
