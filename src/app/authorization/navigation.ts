import { canAccess } from './store';

export type AppView =
  | 'auth'
  | 'workspace-select'
  | 'dashboard'
  | 'kanban'
  | 'backlog'
  | 'sprints'
  | 'alltasks'
  | 'members'
  | 'reports'
  | 'settings'
  | 'trash';

export type NavigationDecision = {
  allowed: boolean;
  fallback: AppView;
  message?: string;
};

const PROJECT_VIEWS: AppView[] = ['kanban', 'backlog', 'sprints', 'alltasks', 'settings'];
const APP_BASE_PATH = normalizeBasePath(import.meta.env.BASE_URL || '/');

function normalizeBasePath(basePath: string) {
  const normalized = `/${basePath.replace(/^\/+|\/+$/g, '')}`;
  return normalized === '/' ? '' : normalized;
}

function withAppBasePath(path: string) {
  if (!APP_BASE_PATH) return path;
  return path === '/' ? `${APP_BASE_PATH}/` : `${APP_BASE_PATH}${path}`;
}

export function stripAppBasePath(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (!APP_BASE_PATH) return normalized;
  if (normalized === APP_BASE_PATH) return '/';
  if (normalized.startsWith(`${APP_BASE_PATH}/`)) {
    return normalized.slice(APP_BASE_PATH.length) || '/';
  }
  return normalized;
}

export function guardNavigation(view: AppView, projectId?: string): NavigationDecision {
  if (!PROJECT_VIEWS.includes(view)) return { allowed: true, fallback: view };

  if (!projectId || !canAccess('project.view', { projectId })) {
    return {
      allowed: false,
      fallback: 'dashboard',
      message: 'You are not a member of this project.',
    };
  }

  if (view === 'settings' && !canAccess('project.update', { projectId })) {
    return {
      allowed: false,
      fallback: 'kanban',
      message: 'Only the workspace owner or project manager can open project settings.',
    };
  }

  return { allowed: true, fallback: view };
}

export function appPath(view: AppView, projectId?: string) {
  if (view === 'dashboard') return withAppBasePath('/dashboard');
  if (view === 'members') return withAppBasePath('/members');
  if (view === 'reports') return withAppBasePath('/reports');
  if (view === 'trash') return withAppBasePath('/trash');
  if (PROJECT_VIEWS.includes(view) && projectId) return withAppBasePath(`/projects/${projectId}/${view}`);
  return withAppBasePath('/');
}

export function parseAppPath(pathname: string) {
  const normalized = stripAppBasePath(pathname).replace(/\/+$/, '') || '/';
  const projectMatch = normalized.match(/^\/projects\/([^/]+)\/(kanban|backlog|sprints|alltasks|settings)$/);
  if (projectMatch) {
    return { projectId: decodeURIComponent(projectMatch[1]), view: projectMatch[2] as AppView };
  }
  if (normalized === '/dashboard') return { projectId: '', view: 'dashboard' as AppView };
  if (normalized === '/members') return { projectId: '', view: 'members' as AppView };
  if (normalized === '/reports') return { projectId: '', view: 'reports' as AppView };
  if (normalized === '/trash') return { projectId: '', view: 'trash' as AppView };
  return null;
}
