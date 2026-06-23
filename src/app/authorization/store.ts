import { PERMISSION_RULES } from './policy';
import {
  AuthorizationRole,
  AuthorizationState,
  Permission,
  PermissionOptions,
  ProjectRole,
  ResourceTarget,
  WorkspaceRole,
} from './types';

const EMPTY_STATE: AuthorizationState = {
  userId: '',
  activeWorkspaceId: '',
  activeProjectId: '',
  workspaceRoles: {},
  projectRoles: {},
};

let state = EMPTY_STATE;
const listeners = new Set<() => void>();

function update(next: AuthorizationState) {
  state = next;
  listeners.forEach((listener) => listener());
}

export function getAuthorizationState() {
  return state;
}

export function subscribeAuthorization(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setAuthorizationUser(userId: string) {
  if (state.userId === userId) return;
  update({ ...EMPTY_STATE, userId });
}

export function setAuthorizationScope(workspaceId: string, projectId = '') {
  if (state.activeWorkspaceId === workspaceId && state.activeProjectId === projectId) return;
  update({ ...state, activeWorkspaceId: workspaceId, activeProjectId: projectId });
}

export function setWorkspaceAuthorizationRole(workspaceId: string, role: WorkspaceRole) {
  update({
    ...state,
    workspaceRoles: { ...state.workspaceRoles, [workspaceId]: role },
  });
}

export function removeWorkspaceAuthorizationRole(workspaceId: string) {
  const workspaceRoles = { ...state.workspaceRoles };
  delete workspaceRoles[workspaceId];
  update({ ...state, workspaceRoles });
}

export function setProjectAuthorizationRole(projectId: string, role: ProjectRole) {
  update({
    ...state,
    projectRoles: { ...state.projectRoles, [projectId]: role },
  });
}

export function removeProjectAuthorizationRole(projectId: string) {
  const projectRoles = { ...state.projectRoles };
  delete projectRoles[projectId];
  update({ ...state, projectRoles });
}

export function replaceProjectAuthorizationRoles(projectRoles: Record<string, ProjectRole>) {
  update({ ...state, projectRoles });
}

export function clearAuthorizationState() {
  update(EMPTY_STATE);
}

export function normalizeWorkspaceRole(value: unknown, isOwner = false): WorkspaceRole {
  if (isOwner || String(value || '').toLowerCase().includes('owner')) return 'workspace-owner';
  return 'workspace-member';
}

export function normalizeProjectRole(value: unknown): ProjectRole | undefined {
  if (value === 0) return 'project-manager';
  if (value === 1) return 'developer';
  if (value === 2) return 'viewer';

  const normalized = String(value || '').toLowerCase().replace(/[\s_-]/g, '');
  if (!normalized) return undefined;
  if (normalized.includes('projectmanager') || normalized === 'pm' || normalized.includes('lead')) {
    return 'project-manager';
  }
  if (normalized.includes('developer')) return 'developer';
  if (normalized.includes('viewer')) return 'viewer';
  return undefined;
}

export function getRolesForResource(
  target: ResourceTarget,
  resourceId?: string,
  snapshot = state
): AuthorizationRole[] {
  const workspaceId = target === 'workspace'
    ? resourceId || snapshot.activeWorkspaceId
    : snapshot.activeWorkspaceId;
  const workspaceRole = workspaceId ? snapshot.workspaceRoles[workspaceId] : undefined;

  if (target === 'workspace') return workspaceRole ? [workspaceRole] : [];

  const projectId = resourceId || snapshot.activeProjectId;
  const projectRole = projectId ? snapshot.projectRoles[projectId] : undefined;
  return [
    ...(workspaceRole === 'workspace-owner' ? [workspaceRole] : []),
    ...(projectRole ? [projectRole] : []),
  ];
}

export function hasAccessToRoles(
  allowedRoles: AuthorizationRole[],
  target: ResourceTarget,
  resourceId?: string,
  snapshot = state
) {
  return getRolesForResource(target, resourceId, snapshot).some((role) => allowedRoles.includes(role));
}

export function canAccess(
  permission: Permission,
  options: PermissionOptions = {},
  snapshot = state
) {
  const rule = PERMISSION_RULES[permission];

  if (permission === 'project.create') {
    const workspaceId = options.workspaceId || snapshot.activeWorkspaceId;
    if (workspaceId && snapshot.workspaceRoles[workspaceId] === 'workspace-owner') return true;
    return Object.values(snapshot.projectRoles).includes('project-manager');
  }

  const resourceId = rule.target === 'workspace'
    ? options.workspaceId
    : options.projectId;
  return hasAccessToRoles(rule.roles, rule.target, resourceId, snapshot);
}
