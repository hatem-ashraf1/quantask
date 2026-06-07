import { useState } from 'react';
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
import { PROJECTS } from './data/mockData';

/* MARKER-MAKE-KIT-INVOKED */

type View = 'auth' | 'workspace-select' | 'dashboard' | 'kanban' | 'backlog' | 'sprints' | 'alltasks' | 'members' | 'settings' | 'trash';

const VIEW_TITLES: Record<View, { title: string; subtitle?: string }> = {
  auth: { title: 'Sign In' },
  'workspace-select': { title: 'Select Workspace' },
  dashboard: { title: 'QuanTask HQ', subtitle: 'Workspace Dashboard' },
  kanban: { title: 'Board', subtitle: 'Sprint 2 — AI Engine' },
  backlog: { title: 'Backlog', subtitle: 'All Tasks' },
  sprints: { title: 'Sprints', subtitle: 'Sprint Planning' },
  alltasks: { title: 'All Tasks', subtitle: 'Complete Project View' },
  members: { title: 'Members', subtitle: 'QuanTask HQ' },
  settings: { title: 'Settings', subtitle: 'Workspace' },
  trash: { title: 'Trash', subtitle: 'Deleted Items' },
};

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [view, setView] = useState<View>('workspace-select');
  const [selectedProjectId, setSelectedProjectId] = useState(PROJECTS[0]?.id || 'p1');
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

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
        onWorkspaceSelect={(workspaceId) => {
          setSelectedWorkspaceId(workspaceId);
          setView('dashboard');
        }}
      />
    );
  }

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setView('kanban');
  };

  const handleViewChange = (v: View) => {
    setView(v);
    setOpenTaskId(null);
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
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <TopBar
          title={title}
          subtitle={subtitle}
          onAuthClick={() => setAuthed(false)}
        />

        {/* Page content */}
        <main className="flex-1 overflow-hidden">
          {view === 'dashboard' && (
            <WorkspaceDashboard onProjectSelect={handleProjectSelect} />
          )}
          {view === 'kanban' && (
            <KanbanBoard
              projectId={selectedProjectId}
              onTaskClick={(id) => setOpenTaskId(id)}
            />
          )}
          {view === 'backlog' && (
            <BacklogView
              projectId={selectedProjectId}
              onTaskClick={(id) => setOpenTaskId(id)}
            />
          )}
          {view === 'sprints' && (
            <SprintView
              projectId={selectedProjectId}
              onTaskClick={(id) => setOpenTaskId(id)}
            />
          )}
          {view === 'alltasks' && (
            <AllTasksView
              projectId={selectedProjectId}
              onTaskClick={(id) => setOpenTaskId(id)}
            />
          )}
          {view === 'members' && <MembersDirectory />}
          {view === 'settings' && <SettingsView />}
          {view === 'trash' && <TrashView />}
        </main>
      </div>

      {/* Task detail sliding panel */}
      {openTaskId && (
        <TaskDetailPanel
          taskId={openTaskId}
          onClose={() => setOpenTaskId(null)}
        />
      )}
    </div>
  );
}
