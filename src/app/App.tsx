import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { AuthScreen } from './components/AuthScreen';
import { WorkspaceSelector } from './components/WorkspaceSelector';
import { WorkspaceDashboard } from './components/WorkspaceDashboard';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskDetailPanel } from './components/TaskDetailPanel';
import { BacklogView } from './components/BacklogView';
import { SprintView } from './components/SprintView';
import { AllTasksView } from './components/AllTasksView';
import { MembersDirectory } from './components/MembersDirectory';
import { SettingsView } from './components/SettingsView';
import { TrashView } from './components/TrashView';
import { ProjectCreateModal } from './components/ProjectCreateModal';
import { hasStoredSession, hydrateWorkspace, logout, logoutFromBackend } from './api/client';
import { CURRENT_USER } from './data/store';

/* MARKER-MAKE-KIT-INVOKED */

type View = 'auth' | 'workspace-select' | 'dashboard' | 'kanban' | 'backlog' | 'sprints' | 'alltasks' | 'members' | 'settings' | 'trash';

const VIEW_TITLES: Record<View, { title: string; subtitle?: string }> = {
  auth: { title: 'Sign In' },
  'workspace-select': { title: 'Select Workspace' },
  dashboard: { title: 'Workspace', subtitle: 'Dashboard' },
  kanban: { title: 'Board' },
  backlog: { title: 'Backlog', subtitle: 'All Tasks' },
  sprints: { title: 'Sprints', subtitle: 'Sprint Planning' },
  alltasks: { title: 'All Tasks', subtitle: 'Complete Project View' },
  members: { title: 'Members' },
  settings: { title: 'Settings', subtitle: 'Workspace' },
  trash: { title: 'Trash', subtitle: 'Deleted Items' },
};

export default function App() {
  const [authed, setAuthed] = useState(hasStoredSession());
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [view, setView] = useState<View>('workspace-select');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [showProjectCreate, setShowProjectCreate] = useState(false);
  const [taskRevision, setTaskRevision] = useState(0);

  useEffect(() => {
    if (!selectedWorkspaceId) return;

    let active = true;
    setLoadingWorkspace(true);
    setLoadError('');

    hydrateWorkspace(selectedWorkspaceId)
      .then(({ projects }) => {
        if (!active) return;
        if (projects.length > 0) {
          setSelectedProjectId(projects[0].id);
        }
        setView('dashboard');
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(err instanceof Error ? err.message : 'Unable to load workspace data.');
      })
      .finally(() => {
        if (active) setLoadingWorkspace(false);
      });

    return () => {
      active = false;
    };
  }, [selectedWorkspaceId]);

  if (!authed) {
    return (
      <AuthScreen
        onAuth={() => {
          setAuthed(true);
          setView('workspace-select');
        }}
      />
    );
  }

  if (!selectedWorkspaceId) {
    return (
      <WorkspaceSelector
        onSessionExpired={() => {
          logout();
          setAuthed(false);
          setSelectedWorkspaceId(null);
          setView('auth');
        }}
        onWorkspaceSelect={(workspaceId) => {
          setSelectedWorkspaceId(workspaceId);
        }}
      />
    );
  }

  if (loadingWorkspace) {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center"
        style={{ background: 'var(--background)', color: 'var(--foreground)', fontFamily: 'var(--font-family-body)' }}
      >
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
          />
          <p className="text-sm text-[var(--muted-foreground)]">Loading workspace data...</p>
        </div>
      </div>
    );
  }

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setView('kanban');
  };

  const handleTaskDeleted = () => {
    setOpenTaskId(null);
    setTaskRevision((revision) => revision + 1);
  };

  const handleViewChange = (v: View) => {
    setView(v);
    setOpenTaskId(null);
  };

  const handleWorkspaceExited = () => {
    setSelectedWorkspaceId(null);
    setSelectedProjectId('');
    setView('workspace-select');
  };

  const canCreateProject = CURRENT_USER.role === 'owner' || CURRENT_USER.role === 'pm';
  const handleCreateProject = () => {
    if (canCreateProject) {
      setShowProjectCreate(true);
    }
  };

  const handleProjectDeleted = () => {
    setSelectedProjectId('');
    setView('dashboard');
  };

  const { title, subtitle } = VIEW_TITLES[view] || { title: 'QuanTask' };

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: 'var(--background)', fontFamily: 'var(--font-family-body)' }}
    >
      {/* Sidebar */}
      <Sidebar
        currentView={view as any}
        selectedProjectId={selectedProjectId}
        onViewChange={handleViewChange as any}
        onProjectChange={handleProjectSelect}
        onCreateProject={handleCreateProject}
        onSwitchWorkspace={() => {
          setSelectedWorkspaceId(null);
          setSelectedProjectId('');
          setView('workspace-select');
        }}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <TopBar
          title={title}
          subtitle={subtitle}
          onNavigate={(nextView) => setView(nextView as View)}
          onAuthClick={() => {
            logoutFromBackend().finally(() => {
              setAuthed(false);
              setSelectedWorkspaceId(null);
              setView('auth');
            });
          }}
        />

        {/* Page content */}
        <main className="flex-1 overflow-hidden">
          {loadError && (
            <div
              className="mx-6 mt-4 rounded-lg border px-4 py-3 text-sm"
              style={{ background: '#fffbeb', borderColor: '#fde68a', color: '#92400e' }}
            >
              {loadError}
            </div>
          )}

          {view === 'dashboard' && (
            <WorkspaceDashboard
              onProjectSelect={handleProjectSelect}
              onCreateProject={handleCreateProject}
            />
          )}
          {view === 'kanban' && (
            <KanbanBoard
              key={`${selectedProjectId}-${taskRevision}`}
              projectId={selectedProjectId}
              onTaskClick={(id) => setOpenTaskId(id)}
            />
          )}
          {view === 'backlog' && (
            <BacklogView
              key={`${selectedProjectId}-${taskRevision}`}
              projectId={selectedProjectId}
              onTaskClick={(id) => setOpenTaskId(id)}
            />
          )}
          {view === 'sprints' && (
            <SprintView
              key={`${selectedProjectId}-${taskRevision}`}
              projectId={selectedProjectId}
              onTaskClick={(id) => setOpenTaskId(id)}
              onBacklogClick={() => setView('backlog')}
            />
          )}
          {view === 'alltasks' && (
            <AllTasksView
              key={`${selectedProjectId}-${taskRevision}`}
              projectId={selectedProjectId}
              onTaskClick={(id) => setOpenTaskId(id)}
            />
          )}
          {view === 'members' && <MembersDirectory />}
          {view === 'settings' && (
            <SettingsView
              settingsType={selectedProjectId ? 'project' : 'workspace'}
              projectId={selectedProjectId}
              onWorkspaceExited={handleWorkspaceExited}
              onProjectDeleted={handleProjectDeleted}
            />
          )}
          {view === 'trash' && <TrashView />}
        </main>
      </div>

      {/* Task detail sliding panel */}
      {openTaskId && (
        <TaskDetailPanel
          taskId={openTaskId}
          onClose={() => setOpenTaskId(null)}
          onDeleted={handleTaskDeleted}
        />
      )}

      {showProjectCreate && (
        <ProjectCreateModal
          onClose={() => setShowProjectCreate(false)}
          onCreated={(projectId) => {
            setSelectedProjectId(projectId);
            setView('kanban');
          }}
        />
      )}
    </div>
  );
}
