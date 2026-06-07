import { useState } from 'react';
import {
  LayoutGrid, Trello, ListTodo, Users, Settings, Trash2, ChevronDown,
  Plus, Zap, Circle, CheckCircle2, Clock, FolderKanban, Building2
} from 'lucide-react';
import { PROJECTS, WORKSPACE, CURRENT_USER } from '../data/mockData';

type View =
  | 'dashboard'
  | 'kanban'
  | 'backlog'
  | 'sprints'
  | 'alltasks'
  | 'members'
  | 'settings'
  | 'trash'
  | 'auth';

interface SidebarProps {
  currentView: View;
  selectedProjectId: string;
  onViewChange: (view: View) => void;
  onProjectChange: (projectId: string) => void;
}

const AVATAR_COLORS: Record<string, string> = {
  u1: '#5c5cf5',
  u2: '#22c55e',
  u3: '#f59e0b',
  u4: '#ef4444',
  u5: '#8b5cf6',
  u6: '#06b6d4',
};

export function Sidebar({ currentView, selectedProjectId, onViewChange, onProjectChange }: SidebarProps) {
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);

  const project = PROJECTS.find((p) => p.id === selectedProjectId);

  const navItem = (
    label: string,
    icon: React.ReactNode,
    view: View,
    badge?: string
  ) => {
    const active = currentView === view;
    return (
      <button
        key={view}
        onClick={() => onViewChange(view)}
        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-left transition-all text-sm group ${
          active
            ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]'
            : 'text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]'
        }`}
      >
        <span className={`w-4 h-4 flex-shrink-0 ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
          {icon}
        </span>
        <span className="flex-1">{label}</span>
        {badge && (
          <span className="px-1.5 py-0.5 rounded text-xs bg-[var(--sidebar-primary)] text-white">
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside
      className="flex flex-col h-full w-[220px] flex-shrink-0 border-r"
      style={{
        background: 'var(--sidebar)',
        borderColor: 'var(--sidebar-border)',
        fontFamily: 'var(--font-family-body)',
      }}
    >
      {/* Workspace Selector */}
      <div className="px-3 py-3 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <button
          onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[var(--sidebar-accent)] transition-colors"
        >
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-xs text-white flex-shrink-0"
            style={{ background: 'var(--primary)', fontFamily: 'var(--font-family-mono)' }}
          >
            {WORKSPACE.logo}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm text-[var(--sidebar-accent-foreground)] truncate leading-tight">
              {WORKSPACE.name}
            </p>
            <p className="text-xs text-[var(--sidebar-muted)] leading-tight">
              {WORKSPACE.slug}
            </p>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[var(--sidebar-muted)] transition-transform ${workspaceDropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {/* Global */}
        <div className="mb-3">
          {navItem('Dashboard', <LayoutGrid size={14} />, 'dashboard')}
          {navItem('Members', <Users size={14} />, 'members')}
          {navItem('Trash', <Trash2 size={14} />, 'trash')}
        </div>

        {/* Divider */}
        <div className="mx-2 my-2 border-t" style={{ borderColor: 'var(--sidebar-border)' }} />

        {/* Projects */}
        <div>
          <div className="flex items-center px-3 py-1 mb-1">
            <button
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              className="flex-1 flex items-center gap-1 text-xs text-[var(--sidebar-muted)] hover:text-[var(--sidebar-foreground)] transition-colors uppercase tracking-wider"
            >
              <ChevronDown
                className={`w-3 h-3 transition-transform ${projectsExpanded ? '' : '-rotate-90'}`}
              />
              <span>Projects</span>
            </button>
            <button className="p-0.5 rounded hover:bg-[var(--sidebar-accent)] text-[var(--sidebar-muted)] hover:text-[var(--sidebar-accent-foreground)] transition-colors">
              <Plus size={12} />
            </button>
          </div>

          {projectsExpanded && (
            <div className="space-y-0.5">
              {PROJECTS.map((proj) => {
                const isSelected = proj.id === selectedProjectId;
                return (
                  <button
                    key={proj.id}
                    onClick={() => {
                      onProjectChange(proj.id);
                      if (currentView !== 'kanban' && currentView !== 'backlog' && currentView !== 'sprints') {
                        onViewChange('kanban');
                      }
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-left transition-all text-sm group ${
                      isSelected
                        ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]'
                        : 'text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-sm flex-shrink-0"
                      style={{ background: proj.color, opacity: isSelected ? 1 : 0.7 }}
                    />
                    <span className="flex-1 truncate">{proj.name}</span>
                    {proj.status === 'active' && (
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: '#22c55e' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Project Sub-nav (visible when a project is selected) */}
        {project && (
          <div className="mt-2 ml-3 border-l pl-3 space-y-0.5" style={{ borderColor: 'var(--sidebar-border)' }}>
            <button
              onClick={() => onViewChange('kanban')}
              className={`w-full flex items-center gap-2 px-2 py-1 rounded text-sm transition-colors ${
                currentView === 'kanban'
                  ? 'text-[var(--sidebar-primary)] bg-[var(--sidebar-accent)]'
                  : 'text-[var(--sidebar-muted)] hover:text-[var(--sidebar-accent-foreground)]'
              }`}
            >
              <Trello size={12} />
              <span>Board</span>
            </button>
            <button
              onClick={() => onViewChange('backlog')}
              className={`w-full flex items-center gap-2 px-2 py-1 rounded text-sm transition-colors ${
                currentView === 'backlog'
                  ? 'text-[var(--sidebar-primary)] bg-[var(--sidebar-accent)]'
                  : 'text-[var(--sidebar-muted)] hover:text-[var(--sidebar-accent-foreground)]'
              }`}
            >
              <ListTodo size={12} />
              <span>Backlog</span>
            </button>
            <button
              onClick={() => onViewChange('sprints')}
              className={`w-full flex items-center gap-2 px-2 py-1 rounded text-sm transition-colors ${
                currentView === 'sprints'
                  ? 'text-[var(--sidebar-primary)] bg-[var(--sidebar-accent)]'
                  : 'text-[var(--sidebar-muted)] hover:text-[var(--sidebar-accent-foreground)]'
              }`}
            >
              <Clock size={12} />
              <span>Sprints</span>
            </button>
            <button
              onClick={() => onViewChange('alltasks')}
              className={`w-full flex items-center gap-2 px-2 py-1 rounded text-sm transition-colors ${
                currentView === 'alltasks'
                  ? 'text-[var(--sidebar-primary)] bg-[var(--sidebar-accent)]'
                  : 'text-[var(--sidebar-muted)] hover:text-[var(--sidebar-accent-foreground)]'
              }`}
            >
              <FolderKanban size={12} />
              <span>All Tasks</span>
            </button>
            <button
              onClick={() => onViewChange('settings')}
              className={`w-full flex items-center gap-2 px-2 py-1 rounded text-sm transition-colors ${
                currentView === 'settings'
                  ? 'text-[var(--sidebar-primary)] bg-[var(--sidebar-accent)]'
                  : 'text-[var(--sidebar-muted)] hover:text-[var(--sidebar-accent-foreground)]'
              }`}
            >
              <Settings size={12} />
              <span>Settings</span>
            </button>
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="px-3 py-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[var(--sidebar-accent)] cursor-pointer transition-colors">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0"
            style={{
              background: AVATAR_COLORS[CURRENT_USER.id] || '#5c5cf5',
              fontSize: '10px',
              fontFamily: 'var(--font-family-mono)',
            }}
          >
            {CURRENT_USER.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--sidebar-accent-foreground)] truncate leading-tight">
              {CURRENT_USER.name}
            </p>
            <p className="text-xs leading-tight" style={{ color: 'var(--sidebar-muted)', fontFamily: 'var(--font-family-mono)' }}>
              {CURRENT_USER.role}
            </p>
          </div>
          <Zap className="w-3 h-3 flex-shrink-0" style={{ color: '#f59e0b' }} />
        </div>
      </div>
    </aside>
  );
}
