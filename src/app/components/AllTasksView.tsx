import { useState } from 'react';
import {
  Flag, User2, Filter, Search, Calendar, ArrowUpRight, Lock, ChevronDown
} from 'lucide-react';
import { TASKS, USERS, getUserById, Task } from '../data/mockData';

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

interface AllTasksViewProps {
  projectId: string;
  onTaskClick: (taskId: string) => void;
}

export function AllTasksView({ projectId, onTaskClick }: AllTasksViewProps) {
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<'status' | 'assignee' | 'priority'>('status');

  const allTasks = TASKS.filter((t) => t.projectId === projectId && !t.isDeleted);

  let displayed = allTasks;
  if (filterAssignee !== 'all') displayed = displayed.filter((t) => t.assigneeId === filterAssignee);
  if (filterPriority !== 'all') displayed = displayed.filter((t) => t.priority === filterPriority);
  if (filterStatus !== 'all') displayed = displayed.filter((t) => t.status === filterStatus);
  if (search) displayed = displayed.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()) || t.key.toLowerCase().includes(search.toLowerCase()));

  // Group tasks
  const grouped: Record<string, Task[]> = {};
  displayed.forEach((t) => {
    let key: string;
    if (groupBy === 'status') {
      key = t.status;
    } else if (groupBy === 'assignee') {
      key = t.assigneeId || '__unassigned__';
    } else {
      key = t.priority;
    }
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });

  const getGroupLabel = (key: string) => {
    if (groupBy === 'status') {
      return STATUS_CONFIG[key as keyof typeof STATUS_CONFIG]?.label || key;
    } else if (groupBy === 'assignee') {
      if (key === '__unassigned__') return 'Unassigned';
      const user = getUserById(key);
      return user?.name || key;
    } else {
      return PRIORITY_CONFIG[key as keyof typeof PRIORITY_CONFIG]?.label || key;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: 'var(--font-family-body)' }}>
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
            placeholder="Search all tasks…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border outline-none"
            style={{
              background: 'var(--input-background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
          />
        </div>

        {/* Group By */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--muted-foreground)]">Group by:</span>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border text-xs outline-none"
            style={{
              background: 'var(--input-background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
          >
            <option value="status">Status</option>
            <option value="assignee">Assignee</option>
            <option value="priority">Priority</option>
          </select>
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
                className="absolute top-full right-0 mt-1 w-72 rounded-xl border shadow-xl z-30 p-4"
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
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(grouped).map(([groupKey, tasks]) => (
          <div key={groupKey}>
            {/* Group header */}
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                {getGroupLabel(groupKey)}
              </span>
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

                    <ArrowUpRight size={12} className="text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

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
    </div>
  );
}
