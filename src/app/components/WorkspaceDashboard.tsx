import { useState } from 'react';
import { Plus, Folder, Users, Clock, MoreHorizontal, TrendingUp, CheckCircle2, Circle, Zap, ArrowUpRight, LockKeyhole } from 'lucide-react';
import { PROJECTS, TASKS, SPRINTS, USERS, WORKSPACE, Project } from '../data/store';
import { createProject } from '../api/client';
import { canCreateProject, canViewProject } from '../utils/permissions';

interface WorkspaceDashboardProps {
  onProjectSelect: (projectId: string) => void;
  onCreateProject: () => void;
}

const AVATAR_COLORS = ['#5c5cf5', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const isProjectMember = canViewProject(project.id);
  const projectTasks = TASKS.filter((t) => t.projectId === project.id && !t.isDeleted);
  const doneTasks = projectTasks.filter((t) => t.status === 'Done').length;
  const activeSprint = SPRINTS.find((s) => s.projectId === project.id && s.status === 'active');
  const members = USERS.filter((u) => project.memberIds.includes(u.id));
  const progress = projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : 0;

  const statusCounts = {
    ToDo: projectTasks.filter((t) => t.status === 'ToDo').length,
    InProgress: projectTasks.filter((t) => t.status === 'InProgress').length,
    Review: projectTasks.filter((t) => t.status === 'Review').length,
    Done: doneTasks,
  };

  return (
    <div
      onClick={onClick}
      className="group relative rounded-xl border cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 overflow-hidden"
      style={{
        background: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Color bar */}
      <div className="h-1" style={{ background: project.color }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs flex-shrink-0"
              style={{ background: project.color, fontFamily: 'var(--font-family-mono)' }}
            >
              {project.key}
            </div>
            <div>
              <h3 className="text-sm text-[var(--foreground)] leading-tight group-hover:text-[var(--primary)] transition-colors">
                {project.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background:
                      project.status === 'active'
                        ? '#22c55e'
                        : project.status === 'paused'
                        ? '#f59e0b'
                        : '#6b6b82',
                  }}
                />
                <span className="text-xs text-[var(--muted-foreground)] capitalize">{project.status}</span>
              </div>
            </div>
          </div>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded-md hover:bg-[var(--muted)] text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-[var(--muted-foreground)] mb-4 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {!isProjectMember ? (
          <div
            className="mb-4 rounded-lg border px-3 py-3 flex items-start gap-2.5"
            style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
          >
            <LockKeyhole size={14} className="text-[var(--muted-foreground)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-[var(--foreground)]">You are not a member of this project</p>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                Tasks, sprints, and project members are hidden.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[var(--muted-foreground)]">Progress</span>
                <span
                  className="text-xs"
                  style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family-mono)' }}
                >
                  {doneTasks}/{projectTasks.length}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${progress}%`, background: project.color }}
                />
              </div>
            </div>

            {/* Status breakdown mini */}
            <div className="flex gap-1.5 mb-4">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex-1 text-center">
                  <div
                    className="rounded-md py-1 mb-0.5 text-xs"
                    style={{
                      background: 'var(--muted)',
                      fontFamily: 'var(--font-family-mono)',
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    {count}
                  </div>
                  <div className="text-[10px] text-[var(--muted-foreground)] truncate">{status}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          {/* Members */}
          <div className="flex -space-x-1.5">
            {isProjectMember && members.slice(0, 4).map((u, i) => (
              <div
                key={u.id}
                className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px]"
                style={{
                  background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                  fontFamily: 'var(--font-family-mono)',
                  zIndex: members.length - i,
                }}
                title={u.name}
              >
                {u.avatar}
              </div>
            ))}
            {isProjectMember && members.length > 4 && (
              <div
                className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px]"
                style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
              >
                +{members.length - 4}
              </div>
            )}
            {!isProjectMember && (
              <span className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1">
                <LockKeyhole size={10} />
                Restricted
              </span>
            )}
          </div>

          {/* Active sprint */}
          {isProjectMember && activeSprint && (
            <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
              <Clock size={10} />
              <span>{activeSprint.name.split('—')[0].trim()}</span>
            </div>
          )}

          <ArrowUpRight
            size={14}
            className="text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onCreate, canCreateProject }: { onCreate: () => void; canCreateProject: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {/* Illustration */}
      <div className="relative mb-8">
        <div
          className="w-24 h-24 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--secondary)' }}
        >
          <Folder size={40} className="text-[var(--primary)] opacity-40" />
        </div>
        <div
          className="absolute -top-2 -right-2 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--ai-bg)' }}
        >
          <Zap size={16} style={{ color: 'var(--ai-primary)' }} />
        </div>
      </div>
      <h3 className="text-lg text-[var(--foreground)] mb-2">No projects yet</h3>
      <p className="text-sm text-[var(--muted-foreground)] max-w-xs leading-relaxed mb-6">
        Create your first project to start organizing tasks, sprints, and team members.
      </p>
      <button
        onClick={onCreate}
        disabled={!canCreateProject}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white transition-colors hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: 'var(--primary)' }}
      >
        <Plus size={14} />
        {canCreateProject ? 'Create first project' : 'Project creation restricted'}
      </button>
    </div>
  );
}

export function WorkspaceDashboard({ onProjectSelect, onCreateProject }: WorkspaceDashboardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectKey, setNewProjectKey] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [savingProject, setSavingProject] = useState(false);
  const [createError, setCreateError] = useState('');
  const [, setRefreshKey] = useState(0);
  const canCreateProjects = canCreateProject();

  const requestProjectCreate = () => {
    if (canCreateProjects) {
      onCreateProject();
      return;
    }

    setCreateError('Only workspace owners and PMs can create projects.');
  };

  const totalTasks = TASKS.filter((t) => !t.isDeleted).length;
  const activeTasks = TASKS.filter((t) => t.status === 'InProgress' && !t.isDeleted).length;
  const doneTasks = TASKS.filter((t) => t.status === 'Done' && !t.isDeleted).length;

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: 'var(--font-family-body)' }}>
      {/* Page header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div>
          <h1 className="text-base text-[var(--foreground)]">Workspace</h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            {WORKSPACE.name || 'Workspace'} · {PROJECTS.length} projects
          </p>
        </div>
        {canCreateProjects && (
          <button
            onClick={requestProjectCreate}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-white transition-colors hover:opacity-90"
            style={{ background: 'var(--primary)' }}
          >
            <Plus size={13} />
            New Project
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total tasks', value: totalTasks, icon: <CheckCircle2 size={16} />, color: 'var(--primary)' },
            { label: 'In progress', value: activeTasks, icon: <TrendingUp size={16} />, color: '#3b82f6' },
            { label: 'Completed', value: doneTasks, icon: <CheckCircle2 size={16} />, color: '#22c55e' },
          ].map(({ label, value, icon, color }) => (
            <div
              key={label}
              className="rounded-xl p-4 border"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
                <span style={{ color }}>{icon}</span>
              </div>
              <p
                className="text-2xl text-[var(--foreground)]"
                style={{ fontFamily: 'var(--font-family-mono)' }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Projects grid */}
        {PROJECTS.length === 0 ? (
          <EmptyState onCreate={requestProjectCreate} canCreateProject={canCreateProjects} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {PROJECTS.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => onProjectSelect(project.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm text-[var(--foreground)]">Create new project</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              {createError && (
                <div
                  className="rounded-lg border px-3 py-2 text-xs"
                  style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}
                >
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Project name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Authentication Service"
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{
                    background: 'var(--input-background)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">
                  Key{' '}
                  <span className="text-[var(--muted-foreground)] normal-case" style={{ fontFamily: 'var(--font-family-mono)' }}>
                    (used in task IDs)
                  </span>
                </label>
                <input
                  type="text"
                  value={newProjectKey}
                  onChange={(e) => setNewProjectKey(e.target.value.toUpperCase().slice(0, 5))}
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
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="What will this project deliver?"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
                  style={{
                    background: 'var(--input-background)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newProjectName.trim()) return;
                  setSavingProject(true);
                  setCreateError('');

                  try {
                    const project = await createProject({
                      workspaceId: WORKSPACE.id,
                      name: newProjectName.trim(),
                      key: newProjectKey.trim() || undefined,
                      description: newProjectDesc.trim() || undefined,
                    });
                    setRefreshKey((key) => key + 1);
                    setShowCreateModal(false);
                    setNewProjectName('');
                    setNewProjectKey('');
                    setNewProjectDesc('');
                    onProjectSelect(project.id);
                  } catch (err) {
                    setCreateError(err instanceof Error ? err.message : 'Unable to create project.');
                  } finally {
                    setSavingProject(false);
                  }
                }}
                disabled={!newProjectName.trim() || savingProject}
                className="px-4 py-2 rounded-lg text-sm text-white transition-colors hover:opacity-90"
                style={{ background: 'var(--primary)' }}
              >
                {savingProject ? 'Creating...' : 'Create project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
