import { useEffect, useState, useRef } from 'react';
import {
  X, Flag, Calendar, User2, ChevronDown, Sparkles, Paperclip, Send,
  Lock, Plus, AlertTriangle, CheckSquare, Square, ExternalLink,
  GitBranch, Clock, RotateCcw, Shield, Circle, CheckCircle2,
  MessageSquare, Activity, FileText, Download, Zap, Trash2
} from 'lucide-react';
import {
  Task, TaskStatus, TASKS, USERS, SPRINTS, getUserById, getSprintById, AI_SUGGESTIONS
} from '../data/store';
import { addComment, addDependency, addSubTask, assignTask, deleteTask, fetchTask, toggleSubTask, updateTaskStatus } from '../api/client';
import { canDeleteTaskInProject } from '../utils/permissions';

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: '#ef4444' },
  high: { label: 'High', color: '#f97316' },
  medium: { label: 'Medium', color: '#f59e0b' },
  low: { label: 'Low', color: '#6b6b82' },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  ToDo: { label: 'To Do', color: '#6b6b82', bg: '#f6f6fa' },
  InProgress: { label: 'In Progress', color: '#3b82f6', bg: '#eff6ff' },
  Review: { label: 'Review', color: '#f59e0b', bg: '#fffbeb' },
  Done: { label: 'Done', color: '#22c55e', bg: '#f0fdf4' },
};

const AVATAR_COLORS: Record<string, string> = {
  u1: '#5c5cf5', u2: '#22c55e', u3: '#f59e0b', u4: '#ef4444', u5: '#8b5cf6', u6: '#06b6d4',
};

function formatTime(ts: string) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function AIAssignmentSheet({
  onAssign,
  onClose,
}: {
  onAssign: (userId: string) => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [assigned, setAssigned] = useState<string | null>(null);

  useState(() => {
    const t = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(t);
  });

  const handleAssign = (userId: string) => {
    setAssigned(userId);
    setTimeout(() => {
      onAssign(userId);
      onClose();
    }, 600);
  };

  const CONF_COLOR = { high: '#22c55e', medium: '#f59e0b', low: '#6b6b82' };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t shadow-2xl animate-in slide-in-from-bottom"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--border)',
          maxHeight: '60vh',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
        </div>

        <div className="px-6 pb-8 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 pt-2">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--ai-bg)' }}
              >
                <Sparkles size={16} style={{ color: 'var(--ai-primary)' }} />
              </div>
              <div>
                <h3 className="text-sm text-[var(--foreground)]">AI Best Match</h3>
                <p className="text-xs text-[var(--muted-foreground)]">Based on GitHub activity & skill analysis</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
            >
              <X size={14} />
            </button>
          </div>

          {loading ? (
            /* Shimmer loading state */
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border p-4 flex items-center gap-4"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="w-10 h-10 rounded-full animate-pulse" style={{ background: 'var(--muted)' }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 rounded animate-pulse" style={{ background: 'var(--muted)', width: '60%' }} />
                    <div className="h-2 rounded animate-pulse" style={{ background: 'var(--muted)', width: '80%' }} />
                  </div>
                  <div className="w-16 h-8 rounded-lg animate-pulse" style={{ background: 'var(--muted)' }} />
                </div>
              ))}
              <div className="flex items-center justify-center gap-2 py-2">
                <Sparkles size={12} style={{ color: 'var(--ai-primary)' }} className="animate-pulse" />
                <span className="text-xs text-[var(--muted-foreground)]">Analyzing GitHub commits…</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {AI_SUGGESTIONS.map((suggestion, i) => {
                const user = getUserById(suggestion.userId);
                if (!user) return null;
                const isAssigned = assigned === user.id;

                return (
                  <div
                    key={user.id}
                    className="rounded-xl border p-4 flex items-center gap-4 transition-all"
                    style={{
                      borderColor: i === 0 ? 'var(--ai-primary)' : 'var(--border)',
                      background: i === 0 ? 'var(--ai-bg)' : 'var(--card)',
                    }}
                  >
                    {/* Rank badge */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs"
                        style={{
                          background: AVATAR_COLORS[user.id],
                          fontFamily: 'var(--font-family-mono)',
                        }}
                      >
                        {user.avatar}
                      </div>
                      {i === 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white" style={{ background: 'var(--ai-primary)' }}>
                          #1
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm text-[var(--foreground)]">{user.name}</span>
                        {i === 0 && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] text-white"
                            style={{ background: 'var(--ai-primary)' }}
                          >
                            Best Match
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mb-1.5">{suggestion.matchReason}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${suggestion.matchScore}%`,
                              background: CONF_COLOR[suggestion.confidence],
                            }}
                          />
                        </div>
                        <span
                          className="text-[10px] flex-shrink-0"
                          style={{ color: CONF_COLOR[suggestion.confidence], fontFamily: 'var(--font-family-mono)' }}
                        >
                          {suggestion.matchScore}%
                        </span>
                      </div>
                    </div>

                    {/* 1-click assign */}
                    <button
                      onClick={() => handleAssign(user.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all flex-shrink-0"
                      style={{
                        background: isAssigned ? '#22c55e' : i === 0 ? 'var(--ai-primary)' : 'var(--muted)',
                        color: isAssigned ? 'white' : i === 0 ? 'white' : 'var(--muted-foreground)',
                      }}
                    >
                      {isAssigned ? <CheckCircle2 size={12} /> : <Zap size={12} />}
                      {isAssigned ? 'Assigned!' : '1-Click Assign'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

interface TaskDetailPanelProps {
  taskId: string | null;
  onClose: () => void;
  onDeleted?: (taskId: string) => void;
}

export function TaskDetailPanel({ taskId, onClose, onDeleted }: TaskDetailPanelProps) {
  const initialTask = TASKS.find((t) => t.id === taskId) || null;
  const [task, setTask] = useState<Task | null>(initialTask);
  const [activeTab, setActiveTab] = useState<'activity' | 'details'>('activity');
  const [showAI, setShowAI] = useState(false);
  const [comment, setComment] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSubtaskWarning, setShowSubtaskWarning] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [showDependencyInput, setShowDependencyInput] = useState(false);
  const [dependencyTaskId, setDependencyTaskId] = useState('');
  const [panelError, setPanelError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!taskId) return;

    let active = true;
    const fallback = TASKS.find((item) => item.id === taskId);

    fetchTask(taskId, fallback?.projectId, fallback?.sprintId)
      .then((loadedTask) => {
        if (active) setTask(loadedTask);
      })
      .catch((err) => {
        if (active) setPanelError(err instanceof Error ? err.message : 'Unable to load task details.');
      });

    return () => {
      active = false;
    };
  }, [taskId]);

  if (!task) return null;

  const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
  const sprint = task.sprintId ? getSprintById(task.sprintId) : null;
  const incompleteSubs = task.subTasks.filter((s) => !s.completed).length;
  const completedSubs = task.subTasks.filter((s) => s.completed).length;
  const canDeleteTask = canDeleteTaskInProject(task.projectId);

  const replaceTask = (nextTask: Task) => {
    const localTask = TASKS.find((item) => item.id === nextTask.id);
    if (localTask) Object.assign(localTask, nextTask);
    setTask(nextTask);
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setShowStatusDropdown(false);
    if (task.isBlocked && (newStatus === 'Review' || newStatus === 'Done')) {
      setPanelError('All task dependencies must be completed before moving this task to Review or Done.');
      return;
    }
    if (newStatus === 'Review' && incompleteSubs > 0) {
      setPendingStatus(newStatus);
      setShowSubtaskWarning(true);
      return;
    }
    setPanelError('');
    const previous = task;
    setTask((prev) => prev ? { ...prev, status: newStatus } : prev);
    try {
      const updated = await updateTaskStatus(task.id, newStatus);
      if (updated) replaceTask(updated);
    } catch (err) {
      setTask(previous);
      setPanelError(err instanceof Error ? err.message : 'Unable to update status.');
    }
  };

  const confirmSubtaskWarning = async () => {
    if (!pendingStatus) return;
    await handleStatusChange(pendingStatus);
    setPendingStatus(null);
    setShowSubtaskWarning(false);
  };

  const handleSubtaskToggle = async (subId: string) => {
    const subtask = task.subTasks.find((item) => item.id === subId);
    if (!subtask) return;
    setPanelError('');
    try {
      replaceTask(await toggleSubTask(task.id, subId, !subtask.completed));
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : 'Unable to update sub-task.');
    }
  };

  const handleAssign = async (userId: string) => {
    setPanelError('');
    const previous = task;
    setTask((prev) => prev ? { ...prev, assigneeId: userId } : prev);
    try {
      replaceTask(await assignTask(task.id, userId));
    } catch (err) {
      setTask(previous);
      setPanelError(err instanceof Error ? err.message : 'Unable to assign task.');
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    setPanelError('');
    try {
      replaceTask(await addSubTask(task.id, newSubtaskTitle.trim()));
      setNewSubtaskTitle('');
      setShowSubtaskInput(false);
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : 'Unable to add sub-task.');
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setPanelError('');
    try {
      const created = await addComment(task.id, comment.trim());
      const newComment = {
        id: created.id || created.Id,
        type: 'comment' as const,
        authorId: created.authorId || created.AuthorId,
        content: created.content || created.Content || created.body || created.Body || comment.trim(),
        createdAt: created.createdAt || created.CreatedAt || new Date().toISOString(),
        attachments: (created.attachments || created.Attachments)?.map((attachment) => ({
          name: attachment.name || attachment.fileName || attachment.FileName || 'Attachment',
          size: attachment.size || (attachment.sizeBytes || attachment.SizeBytes ? `${Math.round((attachment.sizeBytes || attachment.SizeBytes || 0) / 1024)}KB` : ''),
          url: attachment.url || attachment.storageUri || attachment.StorageUri || '#',
        })),
      };
      replaceTask({ ...task, activity: [...task.activity, newComment] });
      setComment('');
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : 'Unable to add comment.');
    }
  };

  const handleAddDependency = async () => {
    if (!dependencyTaskId) return;
    setPanelError('');
    try {
      replaceTask(await addDependency(task.id, dependencyTaskId));
      setDependencyTaskId('');
      setShowDependencyInput(false);
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : 'Unable to add dependency.');
    }
  };

  const handleDeleteTask = async () => {
    if (!canDeleteTask) {
      setPanelError('Only project managers can delete tasks.');
      return;
    }

    if (!window.confirm(`Delete task "${task.title}"? It will move to Trash and can be restored later.`)) {
      return;
    }

    setDeleting(true);
    setPanelError('');
    try {
      await deleteTask(task.id);
      onDeleted?.(task.id);
      onClose();
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : 'Unable to delete task.');
    } finally {
      setDeleting(false);
    }
  };

  const statusCfg = STATUS_CONFIG[task.status];
  const priorityCfg = PRIORITY_CONFIG[task.priority];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col border-l shadow-2xl"
        style={{
          width: 'min(640px, 100vw)',
          background: 'var(--card)',
          borderColor: 'var(--border)',
          fontFamily: 'var(--font-family-body)',
        }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex-1 min-w-0">
            {/* Task key */}
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-xs text-[var(--muted-foreground)]"
                style={{ fontFamily: 'var(--font-family-mono)' }}
              >
                {task.key}
              </span>
              {task.isBlocked && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-red-600 bg-red-50">
                  <Lock size={9} /> Blocked
                </span>
              )}
            </div>
            {/* Title (editable) */}
            <h2
              className="text-base text-[var(--foreground)] leading-snug"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setTask((prev) => prev ? { ...prev, title: e.currentTarget.textContent || '' } : prev)}
            >
              {task.title}
            </h2>
          </div>
          {canDeleteTask && (
            <button
              onClick={handleDeleteTask}
              disabled={deleting}
              className="p-1.5 rounded-lg border text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 flex-shrink-0"
              style={{ borderColor: 'var(--border)' }}
              title="Move task to Trash"
            >
              <Trash2 size={15} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Status + Priority bar */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
          {/* Status */}
          <div className="relative">
            <button
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-colors hover:border-[var(--primary)]"
              style={{
                background: statusCfg.bg,
                borderColor: 'var(--border)',
                color: statusCfg.color,
              }}
              title={task.isBlocked ? 'Review and Done require completed dependencies' : undefined}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusCfg.color }} />
              {statusCfg.label}
              <ChevronDown size={11} />
            </button>
            {showStatusDropdown && (
              <div
                className="absolute top-full left-0 mt-1 w-44 rounded-xl border shadow-xl z-20 py-1 overflow-hidden"
                style={{ background: 'var(--popover)', borderColor: 'var(--border)' }}
              >
                {(Object.entries(STATUS_CONFIG) as [TaskStatus, typeof STATUS_CONFIG[TaskStatus]][]).map(([s, cfg]) => {
                  const isDisabled = task.isBlocked && (s === 'Review' || s === 'Done');
                  return (
                    <button
                      key={s}
                      onClick={() => !isDisabled && handleStatusChange(s)}
                      disabled={isDisabled}
                      title={isDisabled ? 'Task is blocked — resolve dependencies first' : undefined}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors hover:bg-[var(--muted)] disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ color: cfg.color }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                      {cfg.label}
                      {isDisabled && <Lock size={10} className="ml-auto" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Priority */}
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border hover:border-[var(--primary)] transition-colors"
            style={{ borderColor: 'var(--border)', color: priorityCfg.color }}
          >
            <Flag size={11} />
            {priorityCfg.label}
          </button>
        </div>
        {panelError && (
          <div className="px-5 py-2 text-xs text-red-600 border-b" style={{ background: '#fef2f2', borderColor: 'var(--border)' }}>
            {panelError}
          </div>
        )}

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-[1fr_200px]">
            {/* Main content */}
            <div className="border-r p-5 space-y-5" style={{ borderColor: 'var(--border)' }}>
              {/* Description */}
              <div>
                <label className="block text-xs text-[var(--muted-foreground)] mb-2">Description</label>
                <p className="text-sm text-[var(--foreground)] leading-relaxed">{task.description}</p>
              </div>

              {/* Sub-tasks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-[var(--muted-foreground)]">
                    Sub-tasks{' '}
                    <span style={{ fontFamily: 'var(--font-family-mono)' }}>
                      ({completedSubs}/{task.subTasks.length})
                    </span>
                  </label>
                  <button
                    onClick={() => setShowSubtaskInput(true)}
                    className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
                  >
                    <Plus size={11} /> Add
                  </button>
                </div>
                {showSubtaskInput && (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="New sub-task"
                      className="flex-1 px-2.5 py-1.5 rounded-lg border text-xs outline-none"
                      style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                    <button
                      onClick={handleAddSubtask}
                      className="px-3 py-1.5 rounded-lg text-xs text-white"
                      style={{ background: 'var(--primary)' }}
                    >
                      Add
                    </button>
                  </div>
                )}
                {task.subTasks.length > 0 ? (
                  <div className="space-y-1.5">
                    {task.subTasks.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => handleSubtaskToggle(st.id)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors hover:bg-[var(--muted)]"
                      >
                        {st.completed ? (
                          <CheckSquare size={14} className="flex-shrink-0 text-[var(--primary)]" />
                        ) : (
                          <Square size={14} className="flex-shrink-0 text-[var(--muted-foreground)]" />
                        )}
                        <span
                          className={`text-xs flex-1 ${st.completed ? 'line-through text-[var(--muted-foreground)]' : 'text-[var(--foreground)]'}`}
                        >
                          {st.title}
                        </span>
                      </button>
                    ))}
                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(completedSubs / task.subTasks.length) * 100}%`,
                          background: completedSubs === task.subTasks.length ? '#22c55e' : 'var(--primary)',
                        }}
                      />
                    </div>
                    {completedSubs === task.subTasks.length && task.status !== 'Review' && (
                      <p className="text-[10px] text-emerald-600 flex items-center gap-1 mt-1">
                        <CheckCircle2 size={10} />
                        All sub-tasks done — task moved to Review
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--muted-foreground)] italic">No sub-tasks</p>
                )}
              </div>

              {/* Dependencies */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-[var(--muted-foreground)]">Dependencies</label>
                  <button
                    onClick={() => setShowDependencyInput(true)}
                    className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
                  >
                    <Plus size={11} /> Add Prerequisite
                  </button>
                </div>
                {showDependencyInput && (
                  <div className="flex gap-2 mb-2">
                    <select
                      value={dependencyTaskId}
                      onChange={(e) => setDependencyTaskId(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border text-xs outline-none"
                      style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    >
                      <option value="">Choose task</option>
                      {TASKS.filter((item) => item.projectId === task.projectId && item.id !== task.id && !item.isDeleted).map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.key} - {item.title}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddDependency}
                      disabled={!dependencyTaskId}
                      className="px-3 py-1.5 rounded-lg text-xs text-white disabled:opacity-50"
                      style={{ background: 'var(--primary)' }}
                    >
                      Add
                    </button>
                  </div>
                )}
                {task.dependencies.length > 0 ? (
                  <div className="space-y-1.5">
                    {task.dependencies.map((dep) => {
                      const depStatusCfg = STATUS_CONFIG[dep.status];
                      return (
                        <div
                          key={dep.taskId}
                          className="flex items-center gap-2.5 p-2 rounded-lg border"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <GitBranch size={12} className="text-[var(--muted-foreground)] flex-shrink-0" />
                          <span className="text-xs text-[var(--foreground)] flex-1">{dep.title}</span>
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px]"
                            style={{ background: depStatusCfg.bg, color: depStatusCfg.color }}
                          >
                            {dep.status}
                          </span>
                          {dep.status !== 'Done' && (
                            <Lock size={10} className="text-red-400 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--muted-foreground)] italic">No dependencies</p>
                )}
              </div>

              {/* Activity */}
              <div>
                {/* Tabs */}
                <div className="flex gap-1 mb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  {(['activity', 'details'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 text-xs capitalize transition-colors border-b-2 -mb-px ${
                        activeTab === tab
                          ? 'border-[var(--primary)] text-[var(--primary)]'
                          : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      {tab === 'activity' ? (
                        <span className="flex items-center gap-1.5">
                          <Activity size={11} /> Activity
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <FileText size={11} /> Details
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {activeTab === 'activity' && (
                  <div>
                    {/* Load older */}
                    <button
                      onClick={() => setPanelError('All available activity is already loaded.')}
                      className="w-full text-center text-xs text-[var(--primary)] hover:underline py-1 mb-3"
                    >
                      Load older activity
                    </button>

                    {/* Timeline */}
                    <div className="space-y-3">
                      {task.activity.map((entry) => {
                        if (entry.type === 'audit') {
                          return (
                            <div key={entry.id} className="flex items-start gap-2.5">
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ background: 'var(--muted)' }}
                              >
                                <Activity size={10} className="text-[var(--muted-foreground)]" />
                              </div>
                              <div>
                                <p className="text-xs text-[var(--muted-foreground)]">{entry.action}</p>
                                <p
                                  className="text-[10px] mt-0.5"
                                  style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-family-mono)' }}
                                >
                                  {formatTime(entry.timestamp)}
                                </p>
                              </div>
                            </div>
                          );
                        }

                        const author = getUserById(entry.authorId);
                        return (
                          <div key={entry.id} className="flex items-start gap-2.5">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] flex-shrink-0"
                              style={{
                                background: AVATAR_COLORS[entry.authorId] || '#5c5cf5',
                                fontFamily: 'var(--font-family-mono)',
                              }}
                            >
                              {author?.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-1.5 mb-1">
                                <span className="text-xs text-[var(--foreground)]">{author?.name}</span>
                                <span
                                  className="text-[10px]"
                                  style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-family-mono)' }}
                                >
                                  {formatTime(entry.createdAt)}
                                </span>
                              </div>
                              <div
                                className="rounded-xl rounded-tl-none p-3 text-xs text-[var(--foreground)] leading-relaxed"
                                style={{ background: 'var(--muted)' }}
                              >
                                {entry.content}
                              </div>
                              {entry.attachments?.map((att) => (
                                <div
                                  key={att.name}
                                  className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs"
                                  style={{ borderColor: 'var(--border)' }}
                                >
                                  <Paperclip size={11} className="text-[var(--muted-foreground)]" />
                                  <span className="flex-1 text-[var(--foreground)]">{att.name}</span>
                                  <span className="text-[var(--muted-foreground)]" style={{ fontFamily: 'var(--font-family-mono)' }}>{att.size}</span>
                                  <a href={att.url} className="text-[var(--primary)] hover:underline flex items-center gap-1">
                                    <Download size={10} /> Download
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Comment input */}
                    <div className="mt-4">
                      <div
                        className="rounded-xl border overflow-hidden"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Add a comment…"
                          rows={3}
                          className="w-full px-3 pt-3 text-xs outline-none resize-none"
                          style={{ background: 'transparent', color: 'var(--foreground)' }}
                        />
                        <div
                          className="flex items-center justify-between px-3 py-2 border-t"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setPanelError('File upload is not connected in this build yet.')}
                              className="p-1.5 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                            >
                              <Paperclip size={13} />
                            </button>
                            <span className="text-[10px] text-[var(--muted-foreground)]">Max 5MB</span>
                          </div>
                          <button
                            onClick={handleAddComment}
                            disabled={!comment.trim()}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white disabled:opacity-40 transition-opacity"
                            style={{ background: 'var(--primary)' }}
                          >
                            <Send size={11} />
                            Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-3">
                    <div className="text-xs text-[var(--muted-foreground)]">
                      Created <span style={{ fontFamily: 'var(--font-family-mono)' }}>{task.createdAt}</span>
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      Project: <span className="text-[var(--foreground)]">{task.projectId}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Meta Sidebar */}
            <div className="p-4 space-y-4">
              {/* Sprint */}
              <div>
                <label className="block text-[10px] text-[var(--muted-foreground)] mb-1.5 uppercase tracking-wider">Sprint</label>
                <button
                  className="w-full flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs text-left transition-colors hover:border-[var(--primary)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  <Clock size={11} className="text-[var(--muted-foreground)]" />
                  <span className="truncate">{sprint ? sprint.name.split('—')[0].trim() : 'No sprint'}</span>
                </button>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-[10px] text-[var(--muted-foreground)] mb-1.5 uppercase tracking-wider">Due Date</label>
                <input
                  type="date"
                  defaultValue={task.dueDate || ''}
                  min={sprint?.startDate}
                  max={sprint?.endDate}
                  className="w-full px-2.5 py-2 rounded-lg border text-xs outline-none"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                    background: 'var(--input-background)',
                    fontFamily: 'var(--font-family-mono)',
                  }}
                />
                {sprint && (
                  <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                    Sprint: {sprint.startDate} → {sprint.endDate}
                  </p>
                )}
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-[10px] text-[var(--muted-foreground)] mb-1.5 uppercase tracking-wider">Assignee</label>
                <div
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {assignee ? (
                    <>
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] flex-shrink-0"
                        style={{ background: AVATAR_COLORS[assignee.id], fontFamily: 'var(--font-family-mono)' }}
                      >
                        {assignee.avatar}
                      </div>
                      <span className="flex-1 truncate text-[var(--foreground)]">{assignee.name}</span>
                    </>
                  ) : (
                    <>
                      <User2 size={12} className="text-[var(--muted-foreground)]" />
                      <span className="text-[var(--muted-foreground)]">Unassigned</span>
                    </>
                  )}
                </div>

                {AI_SUGGESTIONS.length > 0 && (
                  <button
                    onClick={() => setShowAI(true)}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs transition-all hover:opacity-90"
                    style={{
                      background: 'var(--ai-bg)',
                      color: 'var(--ai-primary)',
                      border: '1px solid var(--ai-secondary)',
                    }}
                  >
                    <Sparkles size={12} />
                    Ask AI for Best Match
                  </button>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[10px] text-[var(--muted-foreground)] mb-1.5 uppercase tracking-wider">Priority</label>
                <div className="space-y-1">
                  {(Object.entries(PRIORITY_CONFIG) as [Task['priority'], { label: string; color: string }][]).map(
                    ([p, cfg]) => (
                      <button
                        key={p}
                        onClick={() => setTask((prev) => prev ? { ...prev, priority: p } : prev)}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors hover:bg-[var(--muted)]"
                        style={{
                          background: task.priority === p ? 'var(--muted)' : 'transparent',
                          color: task.priority === p ? cfg.color : 'var(--muted-foreground)',
                        }}
                      >
                        <Flag size={10} style={{ color: cfg.color }} />
                        {cfg.label}
                        {task.priority === p && <CheckCircle2 size={10} className="ml-auto" style={{ color: cfg.color }} />}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assignment Sheet */}
      {showAI && (
        <AIAssignmentSheet
          onAssign={handleAssign}
          onClose={() => setShowAI(false)}
        />
      )}

      {/* Sub-task auto-complete warning */}
      {showSubtaskWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div
            className="w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: '#fffbeb' }}
                >
                  <AlertTriangle size={18} className="text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm text-[var(--foreground)] mb-1">Auto-complete sub-tasks?</h3>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    {incompleteSubs} incomplete sub-task{incompleteSubs > 1 ? 's' : ''} will be automatically marked
                    as done. Proceed?
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowSubtaskWarning(false); setPendingStatus(null); }}
                  className="flex-1 py-2 rounded-lg text-xs text-[var(--muted-foreground)] border transition-colors hover:bg-[var(--muted)]"
                  style={{ borderColor: 'var(--border)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSubtaskWarning}
                  className="flex-1 py-2 rounded-lg text-xs text-white transition-colors hover:opacity-90"
                  style={{ background: '#f59e0b' }}
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
