export type WorkspaceRole = 'workspace-owner' | 'workspace-member';

export type ProjectRole = 'project-manager' | 'developer' | 'viewer';

export type AuthorizationRole = WorkspaceRole | ProjectRole;

export type ResourceTarget = 'workspace' | 'project';

export type Permission =
  | 'workspace.view'
  | 'workspace.update'
  | 'workspace.members.manage'
  | 'workspace.delete'
  | 'workspace.restore'
  | 'workspace.ownership.transfer'
  | 'project.view'
  | 'project.create'
  | 'project.update'
  | 'project.members.manage'
  | 'project.delete'
  | 'project.restore'
  | 'sprint.create'
  | 'sprint.lifecycle.manage'
  | 'sprint.update'
  | 'sprint.delete'
  | 'task.create'
  | 'task.move-to-sprint'
  | 'task.assign'
  | 'task.self-assign'
  | 'task.dependencies.manage'
  | 'task.delete'
  | 'task.restore'
  | 'task.transition'
  | 'task.approve-done'
  | 'task.subtasks.manage'
  | 'task.comment'
  | 'github.view'
  | 'github.manage'
  | 'report.generate'
  | 'report.download';

export type AuthorizationState = {
  userId: string;
  activeWorkspaceId: string;
  activeProjectId: string;
  workspaceRoles: Record<string, WorkspaceRole>;
  projectRoles: Record<string, ProjectRole>;
};

export type PermissionOptions = {
  workspaceId?: string;
  projectId?: string;
};
