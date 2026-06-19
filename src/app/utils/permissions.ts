import { CURRENT_USER, PROJECTS, USERS, WORKSPACE } from '../data/store';

export function getCurrentProjectRole(projectId: string) {
  const project = PROJECTS.find((item) => item.id === projectId);
  if (!project?.memberIds.includes(CURRENT_USER.id)) return undefined;
  return USERS.find((user) => user.id === CURRENT_USER.id)?.role;
}

export function canManageProject(projectId: string) {
  const currentProjectRole = getCurrentProjectRole(projectId);
  return (
    WORKSPACE.ownerId === CURRENT_USER.id ||
    CURRENT_USER.role === 'owner' ||
    CURRENT_USER.role === 'pm' ||
    currentProjectRole === 'pm'
  );
}

export function canCreateTaskInProject(projectId: string) {
  return canManageProject(projectId);
}

export function canDeleteTaskInProject(projectId: string) {
  return canManageProject(projectId);
}
