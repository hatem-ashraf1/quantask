import { useState } from 'react';
import {
  Plus, Calendar, CheckCircle2, Clock, PlayCircle, StopCircle,
  AlertTriangle, ChevronDown, ChevronRight, Flag, X, Zap
} from 'lucide-react';
import { SPRINTS, TASKS, Sprint } from '../data/mockData';

const STATUS_CONFIG = {
  future: { label: 'Future', color: '#6b6b82', bg: '#f6f6fa', dot: '#d1d1db' },
  active: { label: 'Active', color: '#3b82f6', bg: '#eff6ff', dot: '#3b82f6' },
  completed: { label: 'Completed', color: '#22c55e', bg: '#f0fdf4', dot: '#22c55e' },
};

const PRIORITY_CONFIG = {
  critical: { color: '#ef4444', bg: '#fef2f2' },
  high: { color: '#f97316', bg: '#fff7ed' },
  medium: { color: '#f59e0b', bg: '#fffbeb' },
  low: { color: '#6b6b82', bg: '#f6f6fa' },
};

interface SprintViewProps {
  projectId: string;
  onTaskClick: (taskId: string) => void;
}

function CreateSprintModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [goal, setGoal] = useState('');
  const [overlap, setOverlap] = useState(false);

  const checkOverlap = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const hasOverlap = SPRINTS.some((sp) => {
      const spStart = new Date(sp.startDate);
      const spEnd = new Date(sp.endDate);
      return s <= spEnd && e >= spStart;
    });
    setOverlap(hasOverlap);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm text-[var(--foreground)]">Create Sprint</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
          >
            <X size={14} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Sprint name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sprint 4 — Performance"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate) checkOverlap(e.target.value, endDate);
                }}
                className="w-full px-3 py-2 rounded-lg border text-xs outline-none"
                style={{
                  background: 'var(--input-background)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-family-mono)',
                }}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">End date</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (startDate) checkOverlap(startDate, e.target.value);
                }}
                className="w-full px-3 py-2 rounded-lg border text-xs outline-none"
                style={{
                  background: 'var(--input-background)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-family-mono)',
                }}
              />
            </div>
          </div>

          {overlap && (
            <div
              className="flex items-start gap-2 px-3 py-2.5 rounded-lg"
              style={{ background: '#fffbeb' }}
            >
              <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                These dates overlap with an existing sprint. Sprints cannot run concurrently.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Sprint goal</label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What should the team accomplish this sprint?"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none resize-none"
              style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!name || !startDate || !endDate || overlap}
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs text-white transition-colors hover:opacity-90 disabled:opacity-40"
            style={{ background: 'var(--primary)' }}
          >
            Create Sprint
          </button>
        </div>
      </div>
    </div>
  );
}

function SprintCard({
  sprint,
  projectId,
  onTaskClick,
}: {
  sprint: Sprint;
  projectId: string;
  onTaskClick: (taskId: string) => void;
}) {
  const [expanded, setExpanded] = useState(sprint.status === 'active');
  const statusCfg = STATUS_CONFIG[sprint.status];
  const sprintTasks = TASKS.filter((t) => t.sprintId === sprint.id && !t.isDeleted);
  const doneTasks = sprintTasks.filter((t) => t.status === 'Done').length;
  const progress = sprintTasks.length > 0 ? Math.round((doneTasks / sprintTasks.length) * 100) : 0;

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        borderColor: sprint.status === 'active' ? 'var(--primary)' : 'var(--border)',
        background: 'var(--card)',
      }}
    >
      {/* Sprint header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ background: sprint.status === 'active' ? 'var(--secondary)' : 'var(--card)' }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Status dot */}
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusCfg.dot }} />

        {/* Sprint name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--foreground)]">{sprint.name}</span>
            <span
              className="px-1.5 py-0.5 rounded text-[10px]"
              style={{ background: statusCfg.bg, color: statusCfg.color }}
            >
              {statusCfg.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span
              className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1"
              style={{ fontFamily: 'var(--font-family-mono)' }}
            >
              <Calendar size={9} />
              {sprint.startDate} → {sprint.endDate}
            </span>
            <span
              className="text-[10px] text-[var(--muted-foreground)]"
              style={{ fontFamily: 'var(--font-family-mono)' }}
            >
              {doneTasks}/{sprintTasks.length} done
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 w-24">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                background: progress === 100 ? '#22c55e' : 'var(--primary)',
              }}
            />
          </div>
          <span
            className="text-[10px] text-[var(--muted-foreground)] flex-shrink-0"
            style={{ fontFamily: 'var(--font-family-mono)' }}
          >
            {progress}%
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          {sprint.status === 'future' && (
            <button
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors hover:opacity-90"
              style={{ background: 'var(--primary)', color: 'white' }}
            >
              <PlayCircle size={12} />
              Activate
            </button>
          )}
          {sprint.status === 'active' && (
            <button
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border transition-colors hover:bg-[var(--muted)]"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              <StopCircle size={12} />
              Complete
            </button>
          )}
          {sprint.status === 'completed' && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs" style={{ color: '#22c55e' }}>
              <CheckCircle2 size={12} />
              Completed
            </div>
          )}
        </div>
      </div>

      {/* Sprint goal */}
      {sprint.goal && expanded && (
        <div
          className="px-5 py-2.5 border-b"
          style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
        >
          <p className="text-xs text-[var(--muted-foreground)]">
            <span className="text-[var(--foreground)]">Goal: </span>
            {sprint.goal}
          </p>
        </div>
      )}

      {/* Tasks */}
      {expanded && (
        <div>
          {sprintTasks.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <p className="text-xs text-[var(--muted-foreground)]">No tasks in this sprint</p>
              <button className="mt-1.5 text-xs text-[var(--primary)] hover:underline flex items-center gap-1">
                <Plus size={11} /> Add tasks from backlog
              </button>
            </div>
          ) : (
            sprintTasks.map((task, idx) => {
              const priorityCfg = PRIORITY_CONFIG[task.priority];
              const taskStatus = {
                ToDo: { color: '#6b6b82', bg: '#f6f6fa' },
                InProgress: { color: '#3b82f6', bg: '#eff6ff' },
                Review: { color: '#f59e0b', bg: '#fffbeb' },
                Done: { color: '#22c55e', bg: '#f0fdf4' },
              }[task.status];

              return (
                <div
                  key={task.id}
                  onClick={() => onTaskClick(task.id)}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-[var(--muted)] group"
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  <span
                    className="w-14 text-[10px] text-[var(--muted-foreground)] flex-shrink-0"
                    style={{ fontFamily: 'var(--font-family-mono)' }}
                  >
                    {task.key}
                  </span>
                  <span className="flex-1 text-xs text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors">
                    {task.title}
                  </span>
                  <span
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] flex-shrink-0"
                    style={{ background: priorityCfg.bg, color: priorityCfg.color }}
                  >
                    <Flag size={9} />
                    {task.priority}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] flex-shrink-0"
                    style={{ background: taskStatus?.bg, color: taskStatus?.color }}
                  >
                    {task.status}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export function SprintView({ projectId, onTaskClick }: SprintViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const projectSprints = SPRINTS.filter((s) => s.projectId === projectId);

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: 'var(--font-family-body)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div>
          <h2 className="text-sm text-[var(--foreground)]">Sprint Planning</h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            {projectSprints.length} sprints ·{' '}
            {projectSprints.filter((s) => s.status === 'active').length} active
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white"
          style={{ background: 'var(--primary)' }}
        >
          <Plus size={12} />
          New Sprint
        </button>
      </div>

      {/* Sprint list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {projectSprints.map((sprint) => (
          <SprintCard
            key={sprint.id}
            sprint={sprint}
            projectId={projectId}
            onTaskClick={onTaskClick}
          />
        ))}

        {projectSprints.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Clock size={36} className="text-[var(--muted)] mb-3" />
            <h3 className="text-sm text-[var(--foreground)] mb-1">No sprints yet</h3>
            <p className="text-xs text-[var(--muted-foreground)] max-w-xs mb-4">
              Create your first sprint to start organizing work into time-boxed iterations.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white"
              style={{ background: 'var(--primary)' }}
            >
              <Plus size={12} />
              Create first sprint
            </button>
          </div>
        )}
      </div>

      {showCreateModal && <CreateSprintModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
