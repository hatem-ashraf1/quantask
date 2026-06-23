import { useState } from 'react';
import { X, Save, Sparkles, Calendar, Flag, User2, ChevronDown } from 'lucide-react';
import { CURRENT_USER, PROJECTS, USERS, SPRINTS } from '../data/store';
import { canAssignTask, canCreateTaskInProject, canMoveTaskToSprint, canSelfAssignTask } from '../utils/permissions';

interface TaskCreateFormProps {
  projectId: string;
  onClose: () => void;
  onCreate?: (taskData: any) => void | Promise<void>;
}

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: '#ef4444', bg: '#fef2f2' },
  high: { label: 'High', color: '#f97316', bg: '#fff7ed' },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#fffbeb' },
  low: { label: 'Low', color: '#6b6b82', bg: '#f6f6fa' },
};

export function TaskCreateForm({ projectId, onClose, onCreate }: TaskCreateFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<keyof typeof PRIORITY_CONFIG>('medium');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [sprintId, setSprintId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [storyPoints, setStoryPoints] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const project = PROJECTS.find((item) => item.id === projectId);
  const projectSprints = SPRINTS.filter((s) => s.projectId === projectId && s.status !== 'completed');
  const canCreateTask = canCreateTaskInProject(projectId);
  const canAssign = canAssignTask(projectId);
  const canSelfAssign = canSelfAssignTask(projectId);
  const canChooseSprint = canMoveTaskToSprint(projectId);
  const assignableUsers = USERS.filter(
    (user) => user.role !== 'viewer' && (!project || project.memberIds.includes(user.id))
  );

  const handleCreate = async () => {
    if (!canCreateTask) {
      setError('You do not have permission to create tasks in this project.');
      return;
    }
    if (!title.trim()) return;
    setSaving(true);
    setError('');

    const taskData = {
      title,
      description,
      priority,
      assigneeId: assigneeId || null,
      sprintId: sprintId || null,
      dueDate: dueDate || null,
      storyPoints: storyPoints ? parseInt(storyPoints) : null,
      projectId,
    };

    try {
      await onCreate?.(taskData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create task.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', fontFamily: 'var(--font-family-body)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Create New Task
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div
              className="rounded-lg border px-3 py-2 text-xs"
              style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}
            >
              {error}
            </div>
          )}
          {!canCreateTask && (
            <div
              className="rounded-lg border px-3 py-2 text-xs"
              style={{ background: '#fffbeb', borderColor: '#fde68a', color: '#92400e' }}
            >
              You do not have permission to create tasks for this project.
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Implement user authentication"
              className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
              style={{
                background: 'var(--input-background)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the task..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none resize-none"
              style={{
                background: 'var(--input-background)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Row 1: Priority & Assignee */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Priority
              </label>
              <div className="flex gap-2">
                {Object.entries(PRIORITY_CONFIG).map(([p, cfg]) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p as keyof typeof PRIORITY_CONFIG)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      priority === p ? 'ring-2' : ''
                    }`}
                    style={{
                      background: priority === p ? cfg.bg : 'var(--muted)',
                      color: priority === p ? cfg.color : 'var(--muted-foreground)',
                      ringColor: priority === p ? cfg.color : 'transparent',
                    }}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
                style={{
                  background: 'var(--input-background)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              >
                <option value="">Unassigned</option>
                {(canAssign ? assignableUsers : canSelfAssign ? assignableUsers.filter((user) => user.id === CURRENT_USER.id) : []).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.id === CURRENT_USER.id && !canAssign ? 'Assign to me' : user.name}
                  </option>
                ))}
              </select>
              {assignableUsers.length === 0 && (
                <p className="mt-1.5 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  Add members to this project before assigning tasks.
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Sprint & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            {/* Sprint */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Sprint
              </label>
              <select
                value={sprintId}
                onChange={(e) => setSprintId(e.target.value)}
                disabled={!canChooseSprint}
                className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
                style={{
                  background: 'var(--input-background)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              >
                <option value="">Unscheduled (Backlog)</option>
                {canChooseSprint && projectSprints.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name} ({sprint.status})
                  </option>
                ))}
              </select>
              {!canChooseSprint && (
                <p className="mt-1.5 text-[10px] text-[var(--muted-foreground)]">
                  Developers create tasks in the backlog. A project manager can move them into a sprint.
                </p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
                style={{
                  background: 'var(--input-background)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
          </div>

          {/* Story Points */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Story Points
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 5, 8, 13].map((points) => (
                <button
                  key={points}
                  onClick={() => setStoryPoints(points.toString())}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    storyPoints === points.toString() ? 'ring-2' : ''
                  }`}
                  style={{
                    background: storyPoints === points.toString() ? 'var(--primary)' : 'var(--muted)',
                    color: storyPoints === points.toString() ? 'white' : 'var(--muted-foreground)',
                    ringColor: storyPoints === points.toString() ? 'var(--primary)' : 'transparent',
                  }}
                >
                  {points}
                </button>
              ))}
            </div>
          </div>

          {/* AI Assignment Suggestion */}
          <div
            className="p-4 rounded-lg border"
            style={{ background: 'var(--accent-purple-bg)', borderColor: 'var(--accent-purple-border)' }}
          >
            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)' }}
              >
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--accent-purple-text)' }}>
                  AI Assignment Available
                </p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  After creating this task, you can use AI to recommend the best assignee based on team activity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4 border-t"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: 'var(--muted)',
              color: 'var(--text-secondary)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!canCreateTask || !title.trim() || saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--primary)' }}
          >
            <Save size={14} />
            {saving ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
