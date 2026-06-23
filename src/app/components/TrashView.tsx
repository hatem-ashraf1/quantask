import { useEffect, useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Search } from 'lucide-react';
import { TASKS, WORKSPACE, Task, getUserById } from '../data/store';
import { fetchDeletedTasks, restoreTask } from '../api/client';
import { canRestoreTaskInProject } from '../utils/permissions';

const AVATAR_COLORS: Record<string, string> = {
  u1: '#5c5cf5', u2: '#22c55e', u3: '#f59e0b', u4: '#ef4444', u5: '#8b5cf6', u6: '#06b6d4',
};

interface TrashViewProps {
  onRestore?: (taskId: string) => void;
}

export function TrashView({ onRestore }: TrashViewProps) {
  const [trashTasks, setTrashTasks] = useState<Task[]>([]);
  const [loadedTrash, setLoadedTrash] = useState(false);
  const [loading, setLoading] = useState(false);
  const [restored, setRestored] = useState<string[]>([]);
  const [restoringTaskId, setRestoringTaskId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const sourceTasks = loadedTrash ? trashTasks : TASKS.filter((t) => t.isDeleted);
  const deletedTasks = sourceTasks.filter((t) => t.isDeleted && !restored.includes(t.id)).filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.key.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!WORKSPACE.id) return;

    let active = true;
    setLoading(true);
    setError('');

    fetchDeletedTasks(WORKSPACE.id)
      .then((tasks) => {
        if (active) {
          setTrashTasks(tasks);
          setLoadedTrash(true);
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load deleted tasks.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [WORKSPACE.id]);

  const handleRestore = async (taskId: string) => {
    if (restoringTaskId) return;
    setError('');
    setRestoringTaskId(taskId);
    try {
      await restoreTask(taskId);
      setRestored((prev) => [...prev, taskId]);
      setTrashTasks((prev) => prev.filter((task) => task.id !== taskId));
      onRestore?.(taskId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to restore task.';
      if (message.toLowerCase().includes('task is not deleted')) {
        setRestored((prev) => [...prev, taskId]);
        setTrashTasks((prev) => prev.filter((task) => task.id !== taskId));
        onRestore?.(taskId);
      } else {
        setError(message);
      }
    } finally {
      setRestoringTaskId(null);
    }
  };

  const getLastActivity = (task: Task) => {
    if (task.activity.length === 0) return null;
    const last = task.activity[task.activity.length - 1];
    if (last.type === 'audit') return { text: last.action, time: last.timestamp, userId: last.userId };
    return null;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: 'var(--font-family-body)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div>
          <h2 className="text-sm text-[var(--foreground)]">Trash</h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            {deletedTasks.length} deleted item{deletedTasks.length !== 1 ? 's' : ''} · Permanently removed after 30 days
          </p>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trash…"
            className="pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-none"
            style={{
              background: 'var(--input-background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
              width: '180px',
            }}
          />
        </div>
      </div>

      {/* Warning banner */}
      {deletedTasks.length > 0 && (
        <div
          className="flex items-center gap-2.5 px-5 py-2.5 border-b text-xs"
          style={{ background: '#fffbeb', borderColor: '#fde68a' }}
        >
          <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
          <span className="text-amber-700">
            Items in Trash will be permanently deleted after 30 days. Restore them to prevent data loss.
          </span>
        </div>
      )}
      {error && (
        <div className="px-5 py-2.5 border-b text-xs text-red-600" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
          {error}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {deletedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'var(--muted)' }}
            >
              <Trash2 size={36} className="text-[var(--muted-foreground)] opacity-40" />
            </div>
            <h3 className="text-sm text-[var(--foreground)] mb-1">Trash is empty</h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              Deleted tasks will appear here for 30 days before being permanently removed.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            {/* Table header */}
            <div
              className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-2.5 border-b"
              style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
            >
              {['Key', 'Task', 'Status', 'Deleted by', 'Actions'].map((h) => (
                <span key={h} className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                  {h}
                </span>
              ))}
            </div>

            {deletedTasks.map((task, idx) => {
              const lastActivity = getLastActivity(task);
              const deletedBy = lastActivity?.userId ? getUserById(lastActivity.userId) : null;
              const canRestoreTask = canRestoreTaskInProject(task.projectId);
              const deletedAt = lastActivity?.time
                ? new Date(lastActivity.time).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '—';

              const STATUS_COLORS = {
                ToDo: { color: '#6b6b82', bg: '#f6f6fa' },
                InProgress: { color: '#3b82f6', bg: '#eff6ff' },
                Review: { color: '#f59e0b', bg: '#fffbeb' },
                Done: { color: '#22c55e', bg: '#f0fdf4' },
              };
              const statusCfg = STATUS_COLORS[task.status];

              return (
                <div
                  key={task.id}
                  className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-4 py-3.5 hover:bg-[var(--muted)] transition-colors"
                  style={{
                    borderTop: idx > 0 ? '1px solid var(--border)' : 'none',
                    background: 'var(--card)',
                    opacity: 0.85,
                  }}
                >
                  {/* Key */}
                  <span
                    className="text-[10px] text-[var(--muted-foreground)] whitespace-nowrap"
                    style={{ fontFamily: 'var(--font-family-mono)' }}
                  >
                    {task.key}
                  </span>

                  {/* Title */}
                  <div>
                    <p className="text-xs text-[var(--foreground)] line-through opacity-60 mb-0.5">{task.title}</p>
                    {task.description && (
                      <p className="text-[10px] text-[var(--muted-foreground)] truncate max-w-xs">{task.description.slice(0, 80)}…</p>
                    )}
                  </div>

                  {/* Status */}
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap"
                    style={{ background: statusCfg.bg, color: statusCfg.color }}
                  >
                    {task.status}
                  </span>

                  {/* Deleted by */}
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    {deletedBy ? (
                      <>
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] flex-shrink-0"
                          style={{ background: AVATAR_COLORS[deletedBy.id], fontFamily: 'var(--font-family-mono)' }}
                        >
                          {deletedBy.avatar}
                        </div>
                        <div>
                          <p className="text-[10px] text-[var(--foreground)]">{deletedBy.name.split(' ')[0]}</p>
                          <p
                            className="text-[9px] text-[var(--muted-foreground)]"
                            style={{ fontFamily: 'var(--font-family-mono)' }}
                          >
                            {deletedAt}
                          </p>
                        </div>
                      </>
                    ) : (
                      <span className="text-[10px] text-[var(--muted-foreground)]">—</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {canRestoreTask ? (
                      <button
                        onClick={() => handleRestore(task.id)}
                        disabled={restoringTaskId === task.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] border transition-colors hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      >
                        <RotateCcw size={10} />
                        {restoringTaskId === task.id ? 'Restoring...' : 'Restore'}
                      </button>
                    ) : (
                      <span className="text-[10px] text-[var(--muted-foreground)]">
                        Project manager only
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
