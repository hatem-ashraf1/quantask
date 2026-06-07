import { useState, useRef } from 'react';
import {
  Plus, AlertTriangle, Lock, Flag, Calendar, ChevronRight,
  MoreHorizontal, Sparkles, User2
} from 'lucide-react';
import { Task, TaskStatus, TASKS, USERS, getUserById } from '../data/mockData';
import { TaskCreateForm } from './TaskCreateForm';

const COLUMNS: { id: TaskStatus; label: string; color: string; dot: string }[] = [
  { id: 'ToDo', label: 'To Do', color: '#6b6b82', dot: '#d1d1db' },
  { id: 'InProgress', label: 'In Progress', color: '#3b82f6', dot: '#3b82f6' },
  { id: 'Review', label: 'Review', color: '#f59e0b', dot: '#f59e0b' },
  { id: 'Done', label: 'Done', color: '#22c55e', dot: '#22c55e' },
];

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: '#ef4444', bg: '#fef2f2' },
  high: { label: 'High', color: '#f97316', bg: '#fff7ed' },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#fffbeb' },
  low: { label: 'Low', color: '#6b6b82', bg: '#f6f6fa' },
};

const AVATAR_COLORS: Record<string, string> = {
  u1: '#5c5cf5', u2: '#22c55e', u3: '#f59e0b', u4: '#ef4444', u5: '#8b5cf6', u6: '#06b6d4',
};

function PriorityFlag({ priority }: { priority: Task['priority'] }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span
      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]"
      style={{ background: cfg.bg, color: cfg.color, fontFamily: 'var(--font-family-mono)' }}
    >
      <Flag size={9} />
      {cfg.label}
    </span>
  );
}

function DueDatePill({ dueDate }: { dueDate: string | null }) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date('2024-02-07');
  const overdue = due < now;
  const soon = !overdue && (due.getTime() - now.getTime()) < 86400000 * 2;
  return (
    <span
      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]"
      style={{
        background: overdue ? '#fef2f2' : soon ? '#fffbeb' : 'var(--muted)',
        color: overdue ? '#ef4444' : soon ? '#f59e0b' : 'var(--muted-foreground)',
        fontFamily: 'var(--font-family-mono)',
      }}
    >
      <Calendar size={9} />
      {due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
    </span>
  );
}

function TaskCard({
  task,
  onClick,
  onDragStart,
}: {
  task: Task;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
}) {
  const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
  const completedSubs = task.subTasks.filter((s) => s.completed).length;
  const totalSubs = task.subTasks.length;
  const subProgress = totalSubs > 0 ? (completedSubs / totalSubs) * 100 : 0;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={onClick}
      className="group rounded-lg border cursor-pointer transition-all hover:shadow-md hover:border-[var(--primary)]/30 active:opacity-75"
      style={{
        background: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="p-3">
        {/* Blocked indicator */}
        {task.isBlocked && (
          <div
            className="flex items-center gap-1.5 mb-2 px-2 py-1 rounded-md text-[10px]"
            style={{ background: '#fef2f2', color: '#ef4444' }}
          >
            <Lock size={10} />
            <span>Blocked by unresolved dependency</span>
          </div>
        )}

        {/* Task key + menu */}
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="text-[10px] text-[var(--muted-foreground)]"
            style={{ fontFamily: 'var(--font-family-mono)' }}
          >
            {task.key}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); }}
            className="p-0.5 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal size={12} />
          </button>
        </div>

        {/* Title */}
        <p className="text-xs text-[var(--foreground)] leading-snug mb-2.5 line-clamp-2">
          {task.title}
        </p>

        {/* Priority + Due date */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
          <PriorityFlag priority={task.priority} />
          <DueDatePill dueDate={task.dueDate} />
        </div>

        {/* Sub-task progress */}
        {totalSubs > 0 && (
          <div className="mb-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[var(--muted-foreground)]">
                {completedSubs}/{totalSubs} sub-tasks
              </span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${subProgress}%`,
                  background: subProgress === 100 ? '#22c55e' : 'var(--primary)',
                }}
              />
            </div>
          </div>
        )}

        {/* Footer: assignee + deps indicator */}
        <div className="flex items-center justify-between">
          {assignee ? (
            <div className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px]"
                style={{
                  background: AVATAR_COLORS[assignee.id] || '#5c5cf5',
                  fontFamily: 'var(--font-family-mono)',
                }}
              >
                {assignee.avatar}
              </div>
              <span className="text-[10px] text-[var(--muted-foreground)]">{assignee.name.split(' ')[0]}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[10px] text-[var(--muted-foreground)]">
              <User2 size={10} />
              <span>Unassigned</span>
            </div>
          )}

          {task.dependencies.length > 0 && (
            <span
              className="flex items-center gap-1 text-[10px]"
              style={{ color: task.isBlocked ? '#ef4444' : 'var(--muted-foreground)' }}
            >
              <ChevronRight size={10} />
              {task.dependencies.length} dep{task.dependencies.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  projectId: string;
  onTaskClick: (taskId: string) => void;
}

export function KanbanBoard({ projectId, onTaskClick }: KanbanBoardProps) {
  const [tasks, setTasks] = useState(TASKS.filter((t) => t.projectId === projectId && !t.isDeleted));
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);
  const dragTaskRef = useRef<Task | null>(null);
  const [concurrencyToast, setConcurrencyToast] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    dragTaskRef.current = task;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const task = dragTaskRef.current;
    if (!task || task.status === targetStatus) return;

    // Simulate concurrency conflict randomly (10% chance for demo)
    if (Math.random() < 0.1) {
      setConcurrencyToast(true);
      setTimeout(() => setConcurrencyToast(false), 4000);
      return;
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: targetStatus } : t))
    );
    setDragOverCol(null);
    dragTaskRef.current = null;
  };


  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: 'var(--font-family-body)' }}>
      {/* Concurrency Toast */}
      {concurrencyToast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl"
          style={{
            background: '#fef2f2',
            borderColor: '#fecaca',
            minWidth: '320px',
          }}
        >
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-red-700">
              This task was modified by another user. Please refresh.
            </p>
          </div>
          <button
            onClick={() => setConcurrencyToast(false)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="flex gap-3 h-full min-w-max">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            const isDragOver = dragOverCol === col.id;

            return (
              <div
                key={col.id}
                className="flex flex-col w-72 rounded-xl border transition-all"
                style={{
                  background: isDragOver ? 'var(--secondary)' : 'var(--muted)',
                  borderColor: isDragOver ? 'var(--primary)' : 'transparent',
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: col.dot }} />
                    <span className="text-xs text-[var(--foreground)]">{col.label}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] text-[var(--muted-foreground)]"
                      style={{ background: 'var(--card)', fontFamily: 'var(--font-family-mono)' }}
                    >
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="p-0.5 rounded hover:bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
                  {colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => onTaskClick(task.id)}
                      onDragStart={handleDragStart}
                    />
                  ))}

                  {colTasks.length === 0 && (
                    <div
                      className="flex flex-col items-center justify-center py-8 rounded-lg border-2 border-dashed text-center"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <p className="text-xs text-[var(--muted-foreground)] mb-2">No tasks</p>
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1"
                      >
                        <Plus size={11} /> Add task
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showCreateForm && (
        <TaskCreateForm
          projectId={projectId}
          onClose={() => setShowCreateForm(false)}
          onCreate={(taskData) => {
            console.log('Creating task:', taskData);
            // In real app, would create task
            setShowCreateForm(false);
          }}
        />
      )}
    </div>
  );
}
