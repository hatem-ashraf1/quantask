import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
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
import { InvitationAcceptancePage } from './components/InvitationAcceptancePage';
import { ProjectAccessNotice } from './components/ProjectAccessNotice';
import { ReportsView } from './components/ReportsView';
import { ProfileView } from './components/ProfileView';
import {
  applySelectedWorkspaceRole,
  hasStoredSession,
  hydrateWorkspace,
  logout,
  logoutFromBackend,
  restoreCurrentUserSession,
} from './api/client';
import { PROJECTS } from './data/store';
import {
  clearPendingInvitationToken,
  getInvitationTokenFromUrl,
  getPendingInvitationToken,
  storePendingInvitationToken,
} from './utils/invitation';
import {
  clearAppNavigationSession,
  getAppNavigationSession,
  saveAppNavigationSession,
} from './utils/appSession';
import { subscribeApiAuthorizationEvents } from './authorization/apiEvents';
import { appPath, AppView as View, guardNavigation, parseAppPath, stripAppBasePath } from './authorization/navigation';
import { setAuthorizationScope } from './authorization/store';
import { canCreateProject as userCanCreateProject, canViewProject } from './utils/permissions';

/* MARKER-MAKE-KIT-INVOKED */

const VIEW_TITLES: Record<View, { title: string; subtitle?: string }> = {
  auth: { title: 'Sign In' },
  'workspace-select': { title: 'Select Workspace' },
  dashboard: { title: 'Workspace', subtitle: 'Dashboard' },
  kanban: { title: 'Board' },
  backlog: { title: 'Backlog', subtitle: 'All Tasks' },
  sprints: { title: 'Sprints', subtitle: 'Sprint Planning' },
  alltasks: { title: 'All Tasks', subtitle: 'Complete Project View' },
  members: { title: 'Members' },
  profile: { title: 'Profile', subtitle: 'Preferences' },
  reports: { title: 'Reports', subtitle: 'Analytics & PDF Exports' },
  settings: { title: 'Settings', subtitle: 'Workspace' },
  trash: { title: 'Trash', subtitle: 'Deleted Items' },
};

export default function App() {
  const [initialNavigation] = useState(() => getAppNavigationSession());
  const [initialPath] = useState(() => parseAppPath(window.location.pathname));
  const [invitationRoute, setInvitationRoute] = useState(
    () => stripAppBasePath(window.location.pathname).replace(/\/+$/, '') === '/accept-invitation'
  );
  const [invitationToken] = useState(() => getInvitationTokenFromUrl() || getPendingInvitationToken());
  const [authed, setAuthed] = useState(() => {
    const hasSession = hasStoredSession();
    if (hasSession) restoreCurrentUserSession();
    return hasSession;
  });
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    () => initialNavigation?.workspaceId || null
  );
  const [view, setView] = useState<View>(
    () => initialPath?.view || (initialNavigation?.view as View) || 'workspace-select'
  );
  const [selectedProjectId, setSelectedProjectId] = useState(
    () => initialPath?.projectId || initialNavigation?.projectId || ''
  );
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [loadingWorkspace, setLoadingWorkspace] = useState(
    () => Boolean(initialNavigation?.workspaceId)
  );
  const [loadError, setLoadError] = useState('');
  const [workspaceSelectionError, setWorkspaceSelectionError] = useState('');
  const [showProjectCreate, setShowProjectCreate] = useState(false);
  const [taskRevision, setTaskRevision] = useState(0);

  useEffect(() => {
    if (invitationRoute && invitationToken) {
      storePendingInvitationToken(invitationToken);
    }
  }, [invitationRoute, invitationToken]);

  useEffect(() => {
    return subscribeApiAuthorizationEvents((event) => {
      if (event.type === 'forbidden') {
        toast.error(event.message);
        return;
      }

      toast.error(event.message);
      logout();
      clearAppNavigationSession();
      setAuthed(false);
      setSelectedWorkspaceId(null);
      setSelectedProjectId('');
      setView('auth');
      window.history.replaceState({}, '', appPath('auth'));
    });
  }, []);

  useEffect(() => {
    setAuthorizationScope(selectedWorkspaceId || '', selectedProjectId);
  }, [selectedProjectId, selectedWorkspaceId]);

  useEffect(() => {
    if (
      !authed ||
      !selectedWorkspaceId ||
      view === 'auth' ||
      view === 'workspace-select'
    ) {
      return;
    }

    saveAppNavigationSession({
      workspaceId: selectedWorkspaceId,
      projectId: selectedProjectId,
      view,
    });
    window.history.replaceState({}, '', appPath(view, selectedProjectId));
  }, [authed, selectedProjectId, selectedWorkspaceId, view]);

  useEffect(() => {
    if (!selectedWorkspaceId) return;

    let active = true;
    setLoadingWorkspace(true);
    setLoadError('');

    hydrateWorkspace(selectedWorkspaceId)
      .then(({ projects }) => {
        if (!active) return;
        let resolvedProjectId = selectedProjectId;
        setSelectedProjectId((currentProjectId) => {
          if (projects.some((project) => project.id === currentProjectId)) {
            resolvedProjectId = currentProjectId;
            return currentProjectId;
          }
          resolvedProjectId = projects[0]?.id || '';
          return resolvedProjectId;
        });
        setView((currentView) => {
          if (currentView === 'auth' || currentView === 'workspace-select') {
            return 'dashboard';
          }
          if (
            projects.length === 0 &&
            ['kanban', 'backlog', 'sprints', 'alltasks', 'settings'].includes(currentView)
          ) {
            return 'dashboard';
          }
          const decision = guardNavigation(currentView, resolvedProjectId);
          if (!decision.allowed) {
            toast.error(decision.message);
            return decision.fallback;
          }
          return currentView;
        });
      })
      .catch((err) => {
        if (!active) return;
        const message = err instanceof Error ? err.message : 'Unable to load workspace data.';
        setLoadError('');
        setWorkspaceSelectionError(message);
        clearAppNavigationSession();
        setSelectedWorkspaceId(null);
        setSelectedProjectId('');
        setView('workspace-select');
      })
      .finally(() => {
        if (active) setLoadingWorkspace(false);
      });

    return () => {
      active = false;
    };
  }, [selectedWorkspaceId]);

  const leaveInvitationRoute = useCallback(() => {
    clearPendingInvitationToken();
    window.history.replaceState({}, '', appPath('workspace-select'));
    setInvitationRoute(false);
  }, []);

  const handleInvitationAccepted = useCallback((workspaceId?: string) => {
    leaveInvitationRoute();
    clearAppNavigationSession();
    setOpenTaskId(null);
    setSelectedProjectId('');

    if (workspaceId) {
      setSelectedWorkspaceId(workspaceId);
      return;
    }

    setSelectedWorkspaceId(null);
    setView('workspace-select');
  }, [leaveInvitationRoute]);

  const handleInvitationAuthenticationRequired = useCallback(() => {
    logout();
    clearAppNavigationSession();
    setAuthed(false);
    setSelectedWorkspaceId(null);
    setView('auth');
  }, []);

  const handleInvitationAccountSwitch = useCallback(() => {
    logoutFromBackend().finally(() => {
      clearAppNavigationSession();
      setAuthed(false);
      setSelectedWorkspaceId(null);
      setSelectedProjectId('');
      setView('auth');
    });
  }, []);

  if (invitationRoute && !invitationToken) {
    return (
      <InvitationAcceptancePage
        token=""
        onAccepted={handleInvitationAccepted}
        onAuthenticationRequired={handleInvitationAuthenticationRequired}
        onUseAnotherAccount={handleInvitationAccountSwitch}
      />
    );
  }

  if (invitationRoute && !authed) {
    return (
      <AuthScreen
        invitationPending
        onAuth={() => {
          setAuthed(true);
        }}
      />
    );
  }

  if (invitationRoute) {
    return (
      <InvitationAcceptancePage
        token={invitationToken}
        onAccepted={handleInvitationAccepted}
        onAuthenticationRequired={handleInvitationAuthenticationRequired}
        onUseAnotherAccount={handleInvitationAccountSwitch}
      />
    );
  }

  if (!authed) {
    return (
      <AuthScreen
        onAuth={() => {
          clearAppNavigationSession();
          setAuthed(true);
          setSelectedWorkspaceId(null);
          setSelectedProjectId('');
          setView('workspace-select');
        }}
      />
    );
  }

  if (!selectedWorkspaceId || view === 'workspace-select') {
    return (
      <WorkspaceSelector
        initialError={workspaceSelectionError}
        onSessionExpired={() => {
          logout();
          clearAppNavigationSession();
          setAuthed(false);
          setSelectedWorkspaceId(null);
          setWorkspaceSelectionError('');
          setView('auth');
        }}
        onWorkspaceSelect={(workspaceId, role) => {
          applySelectedWorkspaceRole(role, workspaceId);
          setWorkspaceSelectionError('');
          setLoadError('');
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
    const decision = guardNavigation('kanban', projectId);
    if (!decision.allowed) {
      toast.error(decision.message);
      setView(decision.fallback);
      return;
    }
    setView('kanban');
  };

  const handleTaskDeleted = () => {
    setOpenTaskId(null);
    setTaskRevision((revision) => revision + 1);
  };

  const handleViewChange = (v: View) => {
    const decision = guardNavigation(v, selectedProjectId);
    if (!decision.allowed) {
      toast.error(decision.message);
      setView(decision.fallback);
    } else {
      setView(v);
    }
    setOpenTaskId(null);
  };

  const handleWorkspaceExited = () => {
    clearAppNavigationSession();
    setSelectedWorkspaceId(null);
    setSelectedProjectId('');
    setWorkspaceSelectionError('');
    setView('workspace-select');
  };

  const canCreateProject = userCanCreateProject();
  const selectedProject = PROJECTS.find((project) => project.id === selectedProjectId);
  const isProjectView = ['kanban', 'backlog', 'sprints', 'alltasks', 'settings'].includes(view);
  const hasSelectedProjectAccess = Boolean(
    selectedProject && canViewProject(selectedProject.id)
  );
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
          clearAppNavigationSession();
          setSelectedWorkspaceId(null);
          setSelectedProjectId('');
          setLoadError('');
          setWorkspaceSelectionError('');
          setView('workspace-select');
        }}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <TopBar
          title={title}
          subtitle={subtitle}
          onNavigate={(nextView) => handleViewChange(nextView as View)}
          onAuthClick={() => {
            logoutFromBackend().finally(() => {
              clearAppNavigationSession();
              setAuthed(false);
              setSelectedWorkspaceId(null);
              setSelectedProjectId('');
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

          {isProjectView && !hasSelectedProjectAccess ? (
            <ProjectAccessNotice projectName={selectedProject?.name} />
          ) : (
            <>
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
              {view === 'profile' && <ProfileView />}
              {view === 'reports' && <ReportsView />}
              {view === 'settings' && (
                <SettingsView
                  settingsType={selectedProjectId ? 'project' : 'workspace'}
                  projectId={selectedProjectId}
                  onWorkspaceExited={handleWorkspaceExited}
                  onProjectDeleted={handleProjectDeleted}
                />
              )}
              {view === 'trash' && <TrashView />}
            </>
          )}
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
