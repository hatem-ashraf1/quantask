import { TaskStatus } from '../data/store';
import { canAccess, getAuthorizationState } from '../authorization/store';

export function getCurrentProjectRole(projectId: string) {
  return getAuthorizationState().projectRoles[projectId];
}

export function canViewProject(projectId: string) {
  return canAccess('project.view', { projectId });
}

export function canCreateProject() {
  return canAccess('project.create');
}

export function canManageProject(projectId: string) {
  return canAccess('project.update', { projectId });
}

export function canManageProjectMembers(projectId: string) {
  return canAccess('project.members.manage', { projectId });
}

export function canCreateTaskInProject(projectId: string) {
  return canAccess('task.create', { projectId });
}

export function canMoveTaskToSprint(projectId: string) {
  return canAccess('task.move-to-sprint', { projectId });
}

export function canAssignTask(projectId: string) {
  return canAccess('task.assign', { projectId });
}

export function canSelfAssignTask(projectId: string) {
  return canAccess('task.self-assign', { projectId });
}

export function canManageTaskDependencies(projectId: string) {
  return canAccess('task.dependencies.manage', { projectId });
}

export function canDeleteTaskInProject(projectId: string) {
  return canAccess('task.delete', { projectId });
}

export function canRestoreTaskInProject(projectId: string) {
  return canAccess('task.restore', { projectId });
}

export function canTransitionTask(projectId: string, targetStatus: TaskStatus) {
  if (targetStatus === 'Done') {
    return canAccess('task.approve-done', { projectId });
  }
  return canAccess('task.transition', { projectId });
}

export function canManageSubtasks(projectId: string) {
  return canAccess('task.subtasks.manage', { projectId });
}

export function canCommentOnTask(projectId: string) {
  return canAccess('task.comment', { projectId });
}
