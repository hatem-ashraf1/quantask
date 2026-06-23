import { AuthorizationRole, Permission, ResourceTarget } from './types';

type PermissionRule = {
  target: ResourceTarget;
  roles: AuthorizationRole[];
};

const WORKSPACE_OWNER: AuthorizationRole[] = ['workspace-owner'];
const WORKSPACE_MEMBER: AuthorizationRole[] = ['workspace-owner', 'workspace-member'];
const PROJECT_MANAGER: AuthorizationRole[] = ['workspace-owner', 'project-manager'];
const PROJECT_MEMBER: AuthorizationRole[] = ['workspace-owner', 'project-manager', 'developer', 'viewer'];
const PROJECT_CONTRIBUTOR: AuthorizationRole[] = ['workspace-owner', 'project-manager', 'developer'];

export const PERMISSION_RULES: Record<Permission, PermissionRule> = {
  'workspace.view': { target: 'workspace', roles: WORKSPACE_MEMBER },
  'workspace.update': { target: 'workspace', roles: WORKSPACE_OWNER },
  'workspace.members.manage': { target: 'workspace', roles: WORKSPACE_OWNER },
  'workspace.delete': { target: 'workspace', roles: WORKSPACE_OWNER },
  'workspace.restore': { target: 'workspace', roles: WORKSPACE_OWNER },
  'workspace.ownership.transfer': { target: 'workspace', roles: WORKSPACE_OWNER },
  'project.view': { target: 'project', roles: PROJECT_MEMBER },
  'project.create': { target: 'workspace', roles: PROJECT_MANAGER },
  'project.update': { target: 'project', roles: PROJECT_MANAGER },
  'project.members.manage': { target: 'project', roles: PROJECT_MANAGER },
  'project.delete': { target: 'project', roles: PROJECT_MANAGER },
  'project.restore': { target: 'project', roles: WORKSPACE_OWNER },
  'sprint.create': { target: 'project', roles: PROJECT_MANAGER },
  'sprint.lifecycle.manage': { target: 'project', roles: PROJECT_MANAGER },
  'sprint.update': { target: 'project', roles: PROJECT_MANAGER },
  'sprint.delete': { target: 'project', roles: PROJECT_MANAGER },
  'task.create': { target: 'project', roles: PROJECT_CONTRIBUTOR },
  'task.move-to-sprint': { target: 'project', roles: PROJECT_MANAGER },
  'task.assign': { target: 'project', roles: PROJECT_MANAGER },
  'task.self-assign': { target: 'project', roles: PROJECT_CONTRIBUTOR },
  'task.dependencies.manage': { target: 'project', roles: PROJECT_MANAGER },
  'task.delete': { target: 'project', roles: PROJECT_MANAGER },
  'task.restore': { target: 'project', roles: PROJECT_MANAGER },
  'task.transition': { target: 'project', roles: PROJECT_CONTRIBUTOR },
  'task.approve-done': { target: 'project', roles: PROJECT_MANAGER },
  'task.subtasks.manage': { target: 'project', roles: PROJECT_CONTRIBUTOR },
  'task.comment': { target: 'project', roles: PROJECT_CONTRIBUTOR },
  'github.view': { target: 'project', roles: PROJECT_MEMBER },
  'github.manage': { target: 'project', roles: PROJECT_MANAGER },
  'report.generate': { target: 'workspace', roles: WORKSPACE_MEMBER },
  'report.download': { target: 'workspace', roles: WORKSPACE_MEMBER },
};
