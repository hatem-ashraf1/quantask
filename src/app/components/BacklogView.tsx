import { useState } from 'react';
import {
  Flag, Calendar, User2, Filter, ChevronDown, Plus, Search,
  MoreHorizontal, GitBranch, Lock, ArrowUpRight, AlertTriangle
} from 'lucide-react';
import { TASKS, USERS, SPRINTS, getUserById, Task } from '../data/store';
import { TaskCreateForm } from './TaskCreateForm';
import { createTask, moveTaskToSprint } from '../api/client';
import { canCreateTaskInProject, canMoveTaskToSprint } from '../utils/permissions';

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: '#ef4444', bg: '#fef2f2' },
  high: { label: 'High', color: '#f97316', bg: '#fff7ed' },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#fffbeb' },
  low: { label: 'Low', color: '#6b6b82', bg: '#f6f6fa' },
};

const STATUS_CONFIG = {
  ToDo: { label: 'To Do', color: '#6b6b82', bg: '#f6f6fa' },
  InProgress: { label: 'In Progress', color: '#3b82f6', bg: '#eff6ff' },
  Review: { label: 'Review', color: '#f59e0b', bg: '#fffbeb' },
  Done: { label: 'Done', color: '#22c55e', bg: '#f0fdf4' },
};

const AVATAR_COLORS: Record<string, string> = {
  u1: '#5c5cf5', u2: '#22c55e', u3: '#f59e0b', u4: '#ef4444', u5: '#8b5cf6', u6: '#06b6d4',
};

interface BacklogViewProps {
  projectId: string;
  onTaskClick: (taskId: string) => void;
}

export function BacklogView({ projectId, onTaskClick }: BacklogViewProps) {
  // Backlog screen shows unscheduled work alongside sprint-assigned tasks for planning.
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError] = useState('');
  const [movingTaskId, setMovingTaskId] = useState<string | null>(null);
  const [, setRefreshKey] = useState(0);
  const canCreateTasks = canCreateTaskInProject(projectId);
  const canMoveTasks = canMoveTaskToSprint(projectId);

  // The raw task list is split into backlog/sprint groups after filters are applied.
  const allTasks = TASKS.filter((t) => t.projectId === projectId && !t.isDeleted);
  const backlogTasks = allTasks.filter((t) => !t.sprintId || t.sprintId === null);
  const sprintTasks = allTasks.filter((t) => t.sprintId);

  let displayed = allTasks;
  if (filterAssignee !== 'all') displayed = displayed.filter((t) => t.assigneeId === filterAssignee);
  if (filterPriority !== 'all') displayed = displayed.filter((t) => t.priority === filterPriority);
  if (filterStatus !== 'all') displayed = displayed.filter((t) => t.status === filterStatus);
  if (search) displayed = displayed.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()) || t.key.toLowerCase().includes(search.toLowerCase()));

  const sprintMap = SPRINTS.filter((s) => s.projectId === projectId).reduce((acc, s) => {
    acc[s.id] = s;
    return acc;
  }, {} as Record<string, typeof SPRINTS[0]>);
  const sprintOptions = SPRINTS.filter((s) => s.projectId === projectId && s.status !== 'completed');

  const grouped: Record<string, Task[]> = {};
  displayed.forEach((t) => {
    const key = t.sprintId || '__backlog__';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });

  // Permission checks happen before opening modals so restricted users get an immediate explanation.
  const openCreateForm = () => {
    if (!canCreateTasks) {
      setCreateError('You do not have permission to create tasks in this project.');
      setTimeout(() => setCreateError(''), 5000);
      return;
    }
    setShowCreateForm(true);
  };

  // Moving a task updates the backend; refreshKey forces the local derived lists to re-evaluate.
  const handleMoveTaskToSprint = async (task: Task, sprintId: string | null) => {
    if (!canMoveTasks) {
      setCreateError('Only project managers can move tasks between sprints.');
      setTimeout(() => setCreateError(''), 5000);
      return;
    }

    setMovingTaskId(task.id);
    setCreateError('');
    try {
      await moveTaskToSprint(task.id, sprintId);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Unable to move task to sprint.');
      setTimeout(() => setCreateError(''), 5000);
    } finally {
      setMovingTaskId(null);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: 'var(--font-family-body)' }}>
      {createError && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl"
          style={{ background: '#fef2f2', borderColor: '#fecaca', minWidth: '320px' }}
        >
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700">{createError}</p>
          <button
            onClick={() => setCreateError('')}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            X
          </button>
        </div>
      )}
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-b flex-shrink-0"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search backlog…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border outline-none"
            style={{
              background: 'var(--input-background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
          />
        </div>

        {/* Filters */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors hover:bg-[var(--muted)]"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            <Filter size={12} />
            Filters
            {(filterAssignee !== 'all' || filterPriority !== 'all' || filterStatus !== 'all') && (
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary)' }} />
            )}
          </button>

          {filterOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setFilterOpen(false)} />
              <div
                className="absolute top-full left-0 mt-1 w-72 rounded-xl border shadow-xl z-30 p-4"
                style={{ background: 'var(--popover)', borderColor: 'var(--border)' }}
              >
                <div className="space-y-3">
                  {/* Assignee filter */}
                  <div>
                    <label className="block text-[10px] text-[var(--muted-foreground)] mb-1.5 uppercase tracking-wider">Assignee</label>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => setFilterAssignee('all')}
                        className={`px-2 py-1 rounded text-xs transition-colors ${filterAssignee === 'all' ? 'text-white' : 'text-[var(--foreground)] hover:bg-[var(--muted)]'}`}
                        style={{ background: filterAssignee === 'all' ? 'var(--primary)' : 'transparent' }}
                      >
                        All
                      </button>
                      {USERS.slice(0, 5).map((u) => (
                        <button
                          key={u.id}
                          onClick={() => setFilterAssignee(u.id)}
                          className={`px-2 py-1 rounded text-[10px] transition-colors ${filterAssignee === u.id ? 'text-white' : 'text-[var(--foreground)] hover:bg-[var(--muted)]'}`}
                          style={{ background: filterAssignee === u.id ? 'var(--primary)' : 'transparent' }}
                        >
                          {u.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priority filter */}
                  <div>
                    <label className="block text-[10px] text-[var(--muted-foreground)] mb-1.5 uppercase tracking-wider">Priority</label>
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => setFilterPriority('all')}
                        className={`px-2 py-1 rounded text-xs ${filterPriority === 'all' ? 'text-white' : 'text-[var(--foreground)] hover:bg-[var(--muted)]'}`}
                        style={{ background: filterPriority === 'all' ? 'var(--primary)' : 'transparent' }}
                      >
                        All
                      </button>
                      {Object.entries(PRIORITY_CONFIG).map(([p, cfg]) => (
                        <button
                          key={p}
                          onClick={() => setFilterPriority(p)}
                          className={`px-2 py-1 rounded text-xs`}
                          style={{
                            background: filterPriority === p ? cfg.bg : 'transparent',
                            color: filterPriority === p ? cfg.color : 'var(--muted-foreground)',
                          }}
                        >
                          {cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status filter */}
                  <div>
                    <label className="block text-[10px] text-[var(--muted-foreground)] mb-1.5 uppercase tracking-wider">Status</label>
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-2 py-1 rounded text-xs ${filterStatus === 'all' ? 'text-white' : 'text-[var(--foreground)] hover:bg-[var(--muted)]'}`}
                        style={{ background: filterStatus === 'all' ? 'var(--primary)' : 'transparent' }}
                      >
                        All
                      </button>
                      {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                        <button
                          key={s}
                          onClick={() => setFilterStatus(s)}
                          className="px-2 py-1 rounded text-xs"
                          style={{
                            background: filterStatus === s ? cfg.bg : 'transparent',
                            color: filterStatus === s ? cfg.color : 'var(--muted-foreground)',
                          }}
                        >
                          {cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => { setFilterAssignee('all'); setFilterPriority('all'); setFilterStatus('all'); setFilterOpen(false); }}
                    className="text-xs text-[var(--primary)] hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-[var(--muted-foreground)]" style={{ fontFamily: 'var(--font-family-mono)' }}>
            {displayed.length} tasks
          </span>
          {canCreateTasks && (
            <button
              onClick={openCreateForm}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white"
              style={{ background: 'var(--primary)' }}
              title="Add task"
            >
              <Plus size={12} />
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* Task list: each group represents either the backlog or a specific sprint. */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Backlog group */}
        {Object.entries(grouped).map(([sprintId, tasks]) => {
          const sprint = sprintId !== '__backlog__' ? sprintMap[sprintId] : null;
          const isBacklog = sprintId === '__backlog__';

          return (
            <div key={sprintId}>
              {/* Group header */}
              <div className="flex items-center gap-2 mb-2 px-1">
                {sprint ? (
                  <>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px]"
                      style={{
                        background: sprint.status === 'active' ? '#eff6ff' : sprint.status === 'completed' ? '#f0fdf4' : '#f6f6fa',
                        color: sprint.status === 'active' ? '#3b82f6' : sprint.status === 'completed' ? '#22c55e' : '#6b6b82',
                        fontFamily: 'var(--font-family-mono)',
                      }}
                    >
                      {sprint.status}
                    </span>
                    <span className="text-xs text-[var(--foreground)]">{sprint.name}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {sprint.startDate} → {sprint.endDate}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-[var(--muted-foreground)]">Backlog (unscheduled)</span>
                )}
                <span
                  className="ml-auto px-1.5 py-0.5 rounded text-[10px] text-[var(--muted-foreground)]"
                  style={{ background: 'var(--muted)', fontFamily: 'var(--font-family-mono)' }}
                >
                  {tasks.length}
                </span>
              </div>

              {/* Task rows */}
              <div
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: 'var(--border)' }}
              >
                {tasks.map((task, idx) => {
                  const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
                  const priorityCfg = PRIORITY_CONFIG[task.priority];
                  const statusCfg = STATUS_CONFIG[task.status];

                  return (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick(task.id)}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--muted)] group"
                      style={{
                        background: 'var(--card)',
                        borderTop: idx > 0 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      {/* Blocked */}
                      {task.isBlocked && <Lock size={12} className="text-red-400 flex-shrink-0" />}

                      {/* Key */}
                      <span
                        className="text-[10px] text-[var(--muted-foreground)] flex-shrink-0 w-16"
                        style={{ fontFamily: 'var(--font-family-mono)' }}
                      >
                        {task.key}
                      </span>

                      {/* Title */}
                      <span className="flex-1 text-xs text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors">
                        {task.title}
                      </span>

                      {/* Priority */}
                      <span
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] flex-shrink-0"
                        style={{ background: priorityCfg.bg, color: priorityCfg.color }}
                      >
                        <Flag size={9} />
                        {priorityCfg.label}
                      </span>

                      {/* Status */}
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] flex-shrink-0"
                        style={{ background: statusCfg.bg, color: statusCfg.color }}
                      >
                        {statusCfg.label}
                      </span>

                      {/* Assignee */}
                      <div className="flex items-center gap-1.5 w-28 flex-shrink-0">
                        {assignee ? (
                          <>
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px]"
                              style={{ background: AVATAR_COLORS[assignee.id], fontFamily: 'var(--font-family-mono)' }}
                            >
                              {assignee.avatar}
                            </div>
                            <span className="text-[10px] text-[var(--muted-foreground)] truncate">{assignee.name.split(' ')[0]}</span>
                          </>
                        ) : (
                          <span className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1">
                            <User2 size={10} /> Unassigned
                          </span>
                        )}
                      </div>

                      {/* Due date */}
                      <span
                        className="text-[10px] text-[var(--muted-foreground)] flex-shrink-0 w-20 text-right"
                        style={{ fontFamily: 'var(--font-family-mono)' }}
                      >
                        {task.dueDate || '—'}
                      </span>

                      {canMoveTasks && (
                        <select
                          value={task.sprintId || ''}
                          disabled={movingTaskId === task.id}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleMoveTaskToSprint(task, e.target.value || null)}
                          className="w-36 px-2 py-1 rounded-md border text-[10px] outline-none flex-shrink-0"
                          style={{
                            background: 'var(--input-background)',
                            borderColor: 'var(--border)',
                            color: 'var(--foreground)',
                          }}
                          title="Move task to sprint"
                        >
                          <option value="">Backlog</option>
                          {sprintOptions.map((sprint) => (
                            <option key={sprint.id} value={sprint.id}>
                              {sprint.name}
                            </option>
                          ))}
                        </select>
                      )}

                      <ArrowUpRight size={12} className="text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search size={32} className="text-[var(--muted)] mb-3" />
            <p className="text-sm text-[var(--muted-foreground)]">No tasks match your filters</p>
            <button
              onClick={() => { setFilterAssignee('all'); setFilterPriority('all'); setFilterStatus('all'); setSearch(''); }}
              className="mt-2 text-xs text-[var(--primary)] hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {showCreateForm && (
        <TaskCreateForm
          projectId={projectId}
          onClose={() => setShowCreateForm(false)}
          onCreate={async (taskData) => {
            await createTask(taskData);
            setRefreshKey((key) => key + 1);
            setShowCreateForm(false);
          }}
        />
      )}
    </div>
  );
}
