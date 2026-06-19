import {
  CURRENT_USER,
  PROJECTS,
  SPRINTS,
  TASKS,
  USERS,
  WORKSPACE,
  Project,
  Sprint,
  Task,
  TaskPriority,
  TaskStatus,
  User,
  Workspace,
} from '../data/store';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  errors?: { code: string; message: string }[];
  statusCode: number;
};

type ApiRequestInit = RequestInit & {
  skipAuthRefresh?: boolean;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type TokenResponse = {
  accessToken?: string;
  AccessToken?: string;
  refreshToken?: string;
  RefreshToken?: string;
  user?: ApiUser;
  User?: ApiUser;
  token?: string;
  Token?: string;
  message?: string;
  Message?: string;
};

type MessageResult = {
  success?: boolean;
  Success?: boolean;
  message?: string;
  Message?: string;
};

type ApiUser = {
  id: string;
  Id?: string;
  userId?: string;
  UserId?: string;
  email?: string;
  Email?: string;
  username?: string;
  userName?: string;
  UserName?: string;
  fullName?: string;
  FullName?: string;
  name?: string;
  Name?: string;
  bio?: string;
  profilePictureUrl?: string;
  ProfilePictureUrl?: string;
  role?: string;
  Role?: string;
  githubHandle?: string;
  skills?: string[];
  createdAt?: string;
  CreatedAt?: string;
  joinedDate?: string;
  joinedAt?: string;
  JoinedAt?: string;
  user?: ApiUser;
  User?: ApiUser;
};

type ApiWorkspace = {
  id: string;
  name: string;
  description?: string;
  ownerId?: string;
  owner?: ApiUser;
  Owner?: ApiUser;
  ownerName?: string;
  ownerFullName?: string;
  ownerEmail?: string;
  workspaceOwner?: string;
  role?: string;
  memberCount?: number;
  workspaceMembers?: ApiUser[];
  members?: ApiUser[];
  WorkspaceMembers?: ApiUser[];
  workspaceUsers?: ApiUser[];
  users?: ApiUser[];
  Users?: ApiUser[];
  memberships?: ApiUser[];
  workspaceMemberships?: ApiUser[];
  Members?: ApiUser[];
  projects?: ApiProject[];
};

type ApiPendingWorkspaceInvitation = {
  id?: string;
  invitationId?: string;
  invitationID?: string;
  workspaceInvitationId?: string;
  workspaceId?: string;
  workspaceID?: string;
  workspaceName?: string;
  workspace?: string | { id?: string; name?: string };
  workspaceOwner?: string;
  ownerName?: string;
  invitedBy?: string;
  status?: string;
  invitedAt?: string;
  createdAt?: string;
};

export type PendingWorkspaceInvitation = {
  invitationId: string;
  workspaceId: string;
  workspaceName: string;
  workspaceOwner: string;
  status: string;
  invitedAt: string;
};

export type RememberedWorkspace = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  role: string;
  joinedAt: string;
};

type ApiProject = {
  id: string;
  workspaceId?: string;
  name: string;
  description?: string;
  key?: string;
  color?: string;
  status?: string | number;
  createdAt?: string;
  members?: ApiProjectMember[];
  tasks?: ApiTask[];
  sprints?: ApiSprint[];
  sprint?: ApiSprint[];
};

type ApiProjectMember = ApiUser & {
  userId?: string;
  UserId?: string;
  role?: string;
  Role?: string | number;
  assignedAt?: string;
  AssignedAt?: string;
};

type ApiSprint = {
  id: string;
  projectId?: string;
  name: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  goal?: string;
  tasks?: ApiTask[];
};

type ApiBoard = {
  projectId: string;
  sprints?: ApiSprint[];
  backlogTasks?: ApiTask[];
  members?: ApiProjectMember[];
};

type ApiTask = {
  id?: string;
  taskId?: string;
  key?: string;
  title: string;
  description?: string;
  status?: string | number;
  priority?: string | number;
  assigneeId?: string | null;
  sprintId?: string | null;
  projectId?: string;
  dueDate?: string | null;
  rowVersion?: string | number[];
  isBlocked?: boolean;
  isDeleted?: boolean;
  subTasks?: { id: string; title: string; completed?: boolean; isCompleted?: boolean }[];
  dependencies?: {
    id?: string;
    taskId?: string;
    dependsOnTaskId?: string;
    dependsOnTaskTitle?: string;
    title?: string;
    dependsOnTaskStatus?: string | number;
    status?: string | number;
    isBlocked?: boolean;
  }[];
  comments?: ApiComment[] | ApiPaged<ApiComment>;
  Comments?: ApiComment[] | ApiPaged<ApiComment>;
  auditLog?: ApiAuditEntry[];
  auditLogs?: ApiAuditEntry[] | ApiPaged<ApiAuditEntry>;
  AuditLogs?: ApiAuditEntry[] | ApiPaged<ApiAuditEntry>;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
};

type ApiPaged<T> = {
  items?: T[];
  Items?: T[];
};

type CreateTaskInput = {
  projectId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  sprintId?: string | null;
  dueDate?: string | null;
  storyPoints?: number | null;
};

type CreateSprintInput = {
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  goal?: string;
};

type CreateProjectInput = {
  workspaceId: string;
  name: string;
  description?: string;
  key?: string;
};

type ApiComment = {
  id: string;
  Id?: string;
  taskId?: string;
  TaskId?: string;
  authorId: string;
  AuthorId?: string;
  body?: string;
  Body?: string;
  content?: string;
  Content?: string;
  createdAt?: string;
  CreatedAt?: string;
  attachments?: { fileName?: string; FileName?: string; name?: string; sizeBytes?: number; SizeBytes?: number; size?: string; storageUri?: string; StorageUri?: string; url?: string }[];
  Attachments?: { fileName?: string; FileName?: string; name?: string; sizeBytes?: number; SizeBytes?: number; size?: string; storageUri?: string; StorageUri?: string; url?: string }[];
};

type ApiAuditEntry = {
  id: string;
  action?: string;
  actionType?: string | number;
  description?: string;
  changedBy?: string;
  userId?: string;
  actorId?: string;
  changedAt?: string;
  timestamp?: string;
};

const STORAGE_KEYS = {
  accessToken: 'quantask_access_token',
  refreshToken: 'quantask_refresh_token',
  workspaceOwners: 'quantask_workspace_owners',
  joinedWorkspaces: 'quantask_joined_workspaces',
};

const DEFAULT_API_BASE_URL = 'http://quantask.runasp.net';
const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || DEFAULT_API_BASE_URL).replace(/\/$/, '');

function authHeaders() {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizePath(path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE_URL.toLowerCase().endsWith('/api') && normalized.toLowerCase().startsWith('/api/')) {
    return normalized.slice(4);
  }
  return normalized;
}

function formatApiErrors(errors: unknown) {
  if (!errors) return '';

  if (Array.isArray(errors)) {
    return errors
      .map((error) => {
        if (typeof error === 'string') return error;
        if (error && typeof error === 'object' && 'message' in error) {
          return String((error as { message: unknown }).message);
        }
        return JSON.stringify(error);
      })
      .filter(Boolean)
      .join(', ');
  }

  if (typeof errors === 'object') {
    return Object.entries(errors)
      .flatMap(([field, value]) => {
        const messages = Array.isArray(value) ? value : [value];
        return messages.map((message) => `${field}: ${String(message)}`);
      })
      .join(', ');
  }

  return String(errors);
}

function getApiErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === 'string') return payload || fallback;
  if (!payload || typeof payload !== 'object') return fallback;

  const body = payload as {
    errors?: unknown;
    Errors?: unknown;
    error?: unknown;
    Error?: unknown;
    message?: unknown;
    Message?: unknown;
    detail?: unknown;
    Detail?: unknown;
    title?: unknown;
    Title?: unknown;
  };

  const message =
    formatApiErrors(body.errors || body.Errors) ||
    formatApiErrors(body.error || body.Error) ||
    (typeof body.message === 'string' ? body.message : '') ||
    (typeof body.Message === 'string' ? body.Message : '') ||
    (typeof body.detail === 'string' ? body.detail : '') ||
    (typeof body.Detail === 'string' ? body.Detail : '') ||
    (typeof body.title === 'string' ? body.title : '') ||
    (typeof body.Title === 'string' ? body.Title : '');

  if (!message || message.toLowerCase() === 'bad request' || message.toLowerCase() === 'conflict') {
    return fallback;
  }

  return message;
}

function fallbackErrorMessage(status: number, statusText: string) {
  if (status === 400) return 'Invalid request. Please check the entered values.';
  if (status === 401) return 'Invalid credentials, or this email has not been confirmed yet.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'The requested item was not found.';
  if (status === 409) return 'The backend rejected this request because it conflicts with existing data.';
  if (status >= 500) return 'The backend had an unexpected error. Please try again later.';
  return statusText || 'Request failed.';
}

function parseResponsePayload(text: string) {
  if (!text) return undefined;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request<T>(path: string, options: ApiRequestInit = {}): Promise<T> {
  let response: Response;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const { skipAuthRefresh, ...fetchOptions } = options;

  try {
    response = await fetch(`${API_BASE_URL}${normalizePath(path)}`, {
      ...fetchOptions,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...authHeaders(),
        ...fetchOptions.headers,
      },
    });
  } catch (error) {
    throw new Error(
      `Unable to reach the backend at ${API_BASE_URL}. Set VITE_API_BASE_URL to your backend URL and make sure it is running.`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const payload = parseResponsePayload(text);

  if (response.status === 401 && !skipAuthRefresh && localStorage.getItem(STORAGE_KEYS.refreshToken)) {
    const refreshed = await refreshSession().catch(() => undefined);
    if (refreshed) {
      return request<T>(path, { ...options, skipAuthRefresh: true });
    }
  }

  if (!response.ok) {
    throw new ApiError(getApiErrorMessage(payload, fallbackErrorMessage(response.status, response.statusText)), response.status);
  }

  if (payload && typeof payload === 'object' && 'success' in payload) {
    const apiPayload = payload as ApiResponse<T>;
    if (apiPayload.success === false) {
      throw new Error(getApiErrorMessage(payload, fallbackErrorMessage(response.status, response.statusText)));
    }

    return apiPayload.data;
  }

  return (payload?.data ?? payload) as T;
}

async function requestAny<T>(paths: string[], options: RequestInit = {}): Promise<T> {
  let lastError: unknown;

  for (const path of paths) {
    try {
      return await request<T>(path, options);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('API request failed.');
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function normalizeRole(role?: unknown): User['role'] {
  if (role === 0) return 'pm';
  if (role === 1) return 'developer';
  if (role === 2) return 'viewer';

  const normalized = String(role || '').toLowerCase();
  if (normalized.includes('owner')) return 'owner';
  if (normalized.includes('lead')) return 'pm';
  if (normalized.includes('manager') || normalized.includes('pm')) return 'pm';
  if (normalized.includes('viewer')) return 'viewer';
  return 'developer';
}

function normalizeStatus(status?: string | number): TaskStatus {
  if (status === 0) return 'ToDo';
  if (status === 1) return 'InProgress';
  if (status === 2) return 'Review';
  if (status === 3) return 'Done';

  const normalized = String(status || '').toLowerCase();
  if (normalized === 'todo' || normalized === 'to do') return 'ToDo';
  if (normalized === 'inprogress' || normalized === 'in progress') return 'InProgress';
  if (normalized === 'review' || normalized === 'approved') return 'Review';
  if (normalized === 'done' || normalized === 'completed') return 'Done';
  return 'ToDo';
}

function normalizePriority(priority?: string | number): TaskPriority {
  if (priority === 0) return 'low';
  if (priority === 1) return 'medium';
  if (priority === 2) return 'high';
  if (priority === 3) return 'critical';

  const normalized = String(priority || '').toLowerCase();
  if (normalized === 'critical') return 'critical';
  if (normalized === 'high') return 'high';
  if (normalized === 'low') return 'low';
  return 'medium';
}

function toApiTaskStatus(status: TaskStatus) {
  return { ToDo: 0, InProgress: 1, Review: 2, Done: 3 }[status];
}

function toApiPriority(priority?: TaskPriority) {
  if (!priority) return undefined;
  return { low: 0, medium: 1, high: 2, critical: 3 }[priority];
}

function toApiWorkspaceRole(role: User['role']) {
  return {
    owner: 'Owner',
    pm: 'ProjectManager',
    developer: 'Developer',
    viewer: 'Viewer',
  }[role];
}

function toApiProjectRole(role: User['role']) {
  return {
    owner: 0,
    pm: 0,
    developer: 1,
    viewer: 2,
  }[role];
}

function toApiDateTime(value?: string | null) {
  if (!value) return null;
  return value.includes('T') ? value : new Date(`${value}T00:00:00`).toISOString();
}

function normalizeSprintStatus(status?: string | number): Sprint['status'] {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'active') return 'active';
  if (normalized === 'completed' || normalized === 'closed') return 'completed';
  return 'future';
}

function dateOnly(value?: string | null) {
  return value ? value.slice(0, 10) : null;
}

function pagedItems<T>(value?: T[] | ApiPaged<T>) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.items || value.Items || [];
}

function normalizeRowVersion(rowVersion?: string | number[]) {
  if (!rowVersion) return undefined;
  if (typeof rowVersion === 'string') return rowVersion;

  let binary = '';
  rowVersion.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function readWorkspaceOwnerCache() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.workspaceOwners) || '{}') as Record<string, { name?: string; email?: string }>;
  } catch {
    return {};
  }
}

function getCachedWorkspaceOwner(workspaceId: string) {
  return readWorkspaceOwnerCache()[workspaceId];
}

function getCurrentUserCacheKey() {
  return (CURRENT_USER.id || CURRENT_USER.email || CURRENT_USER.githubHandle || CURRENT_USER.name || 'anonymous').toLowerCase();
}

function readJoinedWorkspacesCache() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.joinedWorkspaces) || '{}') as Record<string, RememberedWorkspace[]>;
  } catch {
    return {};
  }
}

export function getRememberedWorkspaces() {
  return readJoinedWorkspacesCache()[getCurrentUserCacheKey()] || [];
}

export function rememberJoinedWorkspace(workspace: {
  id?: string;
  name?: string;
  description?: string;
  memberCount?: number;
  role?: string;
}) {
  if (!workspace.id) return;

  const cache = readJoinedWorkspacesCache();
  const userKey = getCurrentUserCacheKey();
  const current = cache[userKey] || [];
  const existing = current.find((item) => item.id === workspace.id);
  const remembered: RememberedWorkspace = {
    id: workspace.id,
    name: workspace.name || existing?.name || 'Workspace',
    description: workspace.description ?? existing?.description ?? 'Workspace',
    memberCount: workspace.memberCount ?? existing?.memberCount ?? 0,
    role: workspace.role || existing?.role || 'Developer',
    joinedAt: existing?.joinedAt || new Date().toISOString(),
  };

  cache[userKey] = [remembered, ...current.filter((item) => item.id !== workspace.id)];
  localStorage.setItem(STORAGE_KEYS.joinedWorkspaces, JSON.stringify(cache));
}

export function forgetJoinedWorkspace(workspaceId: string) {
  if (!workspaceId) return;

  const cache = readJoinedWorkspacesCache();
  const userKey = getCurrentUserCacheKey();
  const next = (cache[userKey] || []).filter((workspace) => workspace.id !== workspaceId);

  if (next.length > 0) {
    cache[userKey] = next;
  } else {
    delete cache[userKey];
  }

  localStorage.setItem(STORAGE_KEYS.joinedWorkspaces, JSON.stringify(cache));
}

export function rememberWorkspaceOwner(workspaceId: string, ownerName?: string, ownerEmail?: string) {
  if (ownerName?.toLowerCase() === 'workspace owner') ownerName = undefined;
  if (!workspaceId || (!ownerName && !ownerEmail)) return;

  const cache = readWorkspaceOwnerCache();
  cache[workspaceId] = {
    name: ownerName || cache[workspaceId]?.name,
    email: ownerEmail || cache[workspaceId]?.email,
  };
  localStorage.setItem(STORAGE_KEYS.workspaceOwners, JSON.stringify(cache));
}

const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

function isEmptyGuid(value?: string | null) {
  return !value || value === EMPTY_GUID;
}

function apiUserId(user: Partial<ApiUser | ApiProjectMember>) {
  const id = user.userId || user.UserId || user.id || user.Id || '';
  return isEmptyGuid(id) ? '' : id;
}

function mapUser(user: ApiUser | ApiProjectMember): User {
  const nestedUser = user.user || user.User;
  const raw = nestedUser ? { ...nestedUser, ...user, role: user.role || user.Role || nestedUser.role || nestedUser.Role } : user;
  const id = apiUserId(raw) || raw.email || raw.Email || 'unknown-user';
  const email = raw.email || raw.Email || '';
  const username = raw.username || raw.userName || raw.UserName || '';
  const name = raw.fullName || raw.FullName || raw.name || raw.Name || username || email || 'Unknown User';
  return {
    id,
    name,
    email,
    avatar: initials(name),
    role: normalizeRole(raw.role || raw.Role),
    githubHandle: raw.githubHandle || username || '',
    skills: raw.skills || [],
    joinedDate: dateOnly(raw.joinedDate || raw.joinedAt || raw.JoinedAt || raw.createdAt || raw.CreatedAt) || '',
  };
}

function mapWorkspace(workspace: ApiWorkspace): Workspace {
  return {
    id: workspace.id,
    name: workspace.name,
    slug: slugify(workspace.name),
    logo: initials(workspace.name),
    ownerId: workspace.ownerId || '',
  };
}

function mapWorkspaceOwner(workspace: ApiWorkspace): User | null {
  const owner = workspace.owner || workspace.Owner;
  if (owner) {
    const user = mapUser({ ...owner, role: 'Owner' });
    user.role = 'owner';
    return user;
  }

  if (!workspace.ownerId) return null;

  if (workspace.ownerId === CURRENT_USER.id) {
    return { ...CURRENT_USER, role: 'owner' };
  }

  const cachedOwner = getCachedWorkspaceOwner(workspace.id);
  const ownerName = workspace.ownerFullName || workspace.ownerName || workspace.workspaceOwner || cachedOwner?.name || 'Workspace owner';
  const ownerEmail = workspace.ownerEmail || cachedOwner?.email || '';

  return {
    id: workspace.ownerId,
    name: ownerName,
    email: ownerEmail,
    avatar: initials(ownerName),
    role: 'owner',
    githubHandle: ownerEmail ? ownerEmail.split('@')[0] : `id:${workspace.ownerId.slice(0, 8)}`,
    skills: [],
    joinedDate: '',
  };
}

function mergeUserDetails(existing: User, incoming: User) {
  const incomingIsFallbackOwner = incoming.role === 'owner' && incoming.name.toLowerCase() === 'workspace owner' && !incoming.email;

  return {
    ...existing,
    ...incoming,
    name: incomingIsFallbackOwner ? existing.name : incoming.name || existing.name,
    email: incoming.email || existing.email,
    avatar: incomingIsFallbackOwner ? existing.avatar : incoming.avatar || existing.avatar,
    githubHandle: incoming.githubHandle?.startsWith('id:') && existing.githubHandle ? existing.githubHandle : incoming.githubHandle || existing.githubHandle,
    skills: incoming.skills.length > 0 ? incoming.skills : existing.skills,
    joinedDate: incoming.joinedDate || existing.joinedDate,
    role: existing.role === 'owner' || incoming.role === 'owner' ? 'owner' : incoming.role || existing.role,
  };
}

function getWorkspaceMemberDtos(workspace: ApiWorkspace): ApiUser[] {
  return (
    workspace.workspaceMembers ||
    workspace.WorkspaceMembers ||
    workspace.members ||
    workspace.Members ||
    workspace.workspaceUsers ||
    workspace.users ||
    workspace.Users ||
    workspace.memberships ||
    workspace.workspaceMemberships ||
    []
  );
}

function mapWorkspaceMembers(workspace: ApiWorkspace) {
  return getWorkspaceMemberDtos(workspace).map((member) => {
    const user = mapUser(member);
    if (workspace.ownerId && user.id === workspace.ownerId) {
      user.role = 'owner';
    }
    return user;
  });
}

function mergeUsers(users: User[]) {
  return users.reduce<User[]>((uniqueUsers, user) => {
    if (!user.id) return uniqueUsers;

    const existing = uniqueUsers.find((item) => item.id === user.id);
    if (!existing) {
      uniqueUsers.push(user);
      return uniqueUsers;
    }

    Object.assign(existing, mergeUserDetails(existing, user));
    return uniqueUsers;
  }, []);
}

function mapPendingInvitation(invitation: ApiPendingWorkspaceInvitation): PendingWorkspaceInvitation | null {
  const workspaceObject = typeof invitation.workspace === 'object' ? invitation.workspace : undefined;
  const invitationId =
    invitation.invitationId ||
    invitation.invitationID ||
    invitation.workspaceInvitationId ||
    invitation.id ||
    '';
  const workspaceId = invitation.workspaceId || invitation.workspaceID || workspaceObject?.id || '';
  const workspaceName =
    invitation.workspaceName ||
    workspaceObject?.name ||
    (typeof invitation.workspace === 'string' ? invitation.workspace : '') ||
    'Workspace';

  if (!invitationId) return null;

  return {
    invitationId,
    workspaceId,
    workspaceName,
    workspaceOwner: invitation.workspaceOwner || invitation.ownerName || invitation.invitedBy || '',
    status: invitation.status || 'Pending',
    invitedAt: invitation.invitedAt || invitation.createdAt || '',
  };
}

function mapProject(project: ApiProject): Project {
  const members = project.members || [];
  const status = String(project.status || '').toLowerCase();
  return {
    id: project.id,
    name: project.name,
    description: project.description || '',
    key: project.key || initials(project.name).slice(0, 5),
    color: project.color || '#5c5cf5',
    memberIds: members.map((member) => apiUserId(member)).filter(Boolean),
    sprintIds: (project.sprints || project.sprint || []).map((sprint) => sprint.id),
    createdAt: dateOnly(project.createdAt) || '',
    status: status === 'completed' ? 'completed' : status === 'paused' ? 'paused' : 'active',
  };
}

function mapSprint(sprint: ApiSprint, fallbackProjectId?: string): Sprint {
  return {
    id: sprint.id,
    projectId: sprint.projectId || fallbackProjectId || '',
    name: sprint.name,
    startDate: dateOnly(sprint.startDate) || '',
    endDate: dateOnly(sprint.endDate) || '',
    status: normalizeSprintStatus(sprint.status),
    goal: sprint.goal || '',
  };
}

function mapTask(task: ApiTask, fallbackProjectId?: string, fallbackSprintId?: string | null): Task {
  const id = task.id || task.taskId;

  if (!id) {
    throw new Error('The backend returned a task payload without a task id.');
  }

  const dependencies = task.dependencies || [];
  const comments = pagedItems(task.comments || task.Comments);
  const auditEntries = [
    ...(task.auditLog || []),
    ...pagedItems(task.auditLogs || task.AuditLogs),
  ];

  return {
    id,
    key: task.key || `QT-${id.slice(0, 4).toUpperCase()}`,
    title: task.title,
    description: task.description || '',
    status: normalizeStatus(task.status),
    priority: normalizePriority(task.priority),
    assigneeId: task.assigneeId || null,
    sprintId: task.sprintId ?? fallbackSprintId ?? null,
    dueDate: dateOnly(task.dueDate),
    subTasks: (task.subTasks || []).map((subTask) => ({
      id: subTask.id,
      title: subTask.title,
      completed: Boolean(subTask.completed ?? subTask.isCompleted),
    })),
    dependencies: dependencies.map((dependency) => ({
      taskId: dependency.taskId || dependency.dependsOnTaskId || '',
      title: dependency.title || dependency.dependsOnTaskTitle || 'Dependency',
      status: normalizeStatus(dependency.status ?? dependency.dependsOnTaskStatus),
      isBlocked: dependency.isBlocked,
    })),
    isBlocked: Boolean(task.isBlocked) || dependencies.some((dependency) => dependency.isBlocked || normalizeStatus(dependency.status ?? dependency.dependsOnTaskStatus) !== 'Done'),
    isDeleted: Boolean(task.isDeleted),
    rowVersion: normalizeRowVersion(task.rowVersion),
    projectId: task.projectId || fallbackProjectId || '',
    activity: [
      ...auditEntries.map((entry) => ({
        id: entry.id,
        type: 'audit' as const,
        action: entry.description || entry.action || `Action ${entry.actionType ?? ''}`.trim(),
        userId: entry.userId || entry.actorId || entry.changedBy || '',
        timestamp: entry.timestamp || entry.changedAt || new Date().toISOString(),
      })),
      ...comments.map((comment) => ({
        id: comment.id || comment.Id || crypto.randomUUID(),
        type: 'comment' as const,
        authorId: comment.authorId || comment.AuthorId || '',
        content: comment.content || comment.Content || comment.body || comment.Body || '',
        createdAt: comment.createdAt || comment.CreatedAt || new Date().toISOString(),
        attachments: (comment.attachments || comment.Attachments)?.map((attachment) => ({
          name: attachment.name || attachment.fileName || attachment.FileName || 'Attachment',
          size: attachment.size || (attachment.sizeBytes || attachment.SizeBytes ? `${Math.round((attachment.sizeBytes || attachment.SizeBytes || 0) / 1024)}KB` : ''),
          url: attachment.url || attachment.storageUri || attachment.StorageUri || '#',
        })),
      })),
    ],
    createdAt: dateOnly(task.createdAt) || '',
    updatedAt: dateOnly(task.updatedAt) || '',
    deletedAt: task.deletedAt || null,
    deletedBy: task.deletedBy || null,
  };
}

function mapDeletedTask(task: ApiTask): Task {
  const mapped = mapTask({ ...task, isDeleted: true }, task.projectId, task.sprintId ?? null);

  if (task.deletedAt || task.deletedBy) {
    mapped.activity = [
      ...mapped.activity,
      {
        id: `${mapped.id}-deleted`,
        type: 'audit',
        action: 'Deleted',
        userId: task.deletedBy || '',
        timestamp: task.deletedAt || task.updatedAt || new Date().toISOString(),
      },
    ];
  }

  return mapped;
}

function replaceArray<T>(target: T[], next: T[]) {
  target.splice(0, target.length, ...next);
}

function upsertUsers(users: User[]) {
  const byId = new Map(USERS.map((user) => [user.id, user]));
  users.forEach((user) => byId.set(user.id, user));
  replaceArray(USERS, Array.from(byId.values()));
}

function upsertProjects(projects: Project[]) {
  const byId = new Map(PROJECTS.map((project) => [project.id, project]));
  projects.forEach((project) => byId.set(project.id, project));
  replaceArray(PROJECTS, Array.from(byId.values()));
}

function upsertWorkspaceProject(project: Project) {
  upsertProjects([project]);
}

function upsertSprints(sprints: Sprint[]) {
  const byId = new Map(SPRINTS.map((sprint) => [sprint.id, sprint]));
  sprints.forEach((sprint) => byId.set(sprint.id, sprint));
  replaceArray(SPRINTS, Array.from(byId.values()));
}

function upsertTasks(tasks: Task[]) {
  const byId = new Map(TASKS.map((task) => [task.id, task]));
  tasks.forEach((task) => byId.set(task.id, task));
  replaceArray(TASKS, Array.from(byId.values()));
}

function applyProjectBoard(projectId: string, board: ApiBoard, project?: ApiProject) {
  const members = board.members || project?.members || [];
  const mappedUsers = members.map((member) => mapUser(member));
  const sprints = board.sprints || [];
  const mappedSprints = sprints.map((sprint) => mapSprint(sprint, projectId));
  const mappedTasks = [
    ...sprints.flatMap((sprint) => (sprint.tasks || []).map((task) => mapTask(task, projectId, sprint.id))),
    ...(board.backlogTasks || []).map((task) => mapTask(task, projectId, null)),
  ];

  upsertUsers(mappedUsers);
  upsertSprints(mappedSprints);
  upsertTasks(mappedTasks);

  const localProject = PROJECTS.find((item) => item.id === projectId);
  if (localProject) {
    localProject.memberIds = members.map((member) => apiUserId(member)).filter(Boolean);
    localProject.sprintIds = mappedSprints.map((sprint) => sprint.id);
  }

  return {
    users: mappedUsers,
    sprints: mappedSprints,
    tasks: mappedTasks,
  };
}

async function refreshProjectBoard(projectId: string, project?: ApiProject) {
  const board = await request<ApiBoard>(`/api/projects/${projectId}/board`);
  return applyProjectBoard(projectId, board, project);
}

function getTokenValue(data: TokenResponse | undefined, key: 'access' | 'refresh') {
  if (!data) return '';
  if (key === 'access') return data.accessToken || data.AccessToken || data.token || data.Token || '';
  return data.refreshToken || data.RefreshToken || '';
}

function getTokenUser(data: TokenResponse | undefined) {
  return data?.user || data?.User;
}

function getTokenMessage(data: TokenResponse | undefined, fallback: string) {
  return data?.message || data?.Message || fallback;
}

function applyAuthSession(data: TokenResponse | undefined, fallbackEmail?: string) {
  const accessToken = getTokenValue(data, 'access');
  const refreshToken = getTokenValue(data, 'refresh');
  const user = getTokenUser(data);

  if (accessToken) localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
  if (refreshToken) localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);

  if (user) {
    Object.assign(CURRENT_USER, mapUser(user));
    upsertUsers([CURRENT_USER]);
    return CURRENT_USER;
  }

  if (fallbackEmail) {
    const fallbackName = fallbackEmail.split('@')[0] || fallbackEmail;
    Object.assign(CURRENT_USER, {
      id: CURRENT_USER.id || fallbackEmail,
      email: fallbackEmail,
      name: CURRENT_USER.name || fallbackName,
      avatar: initials(CURRENT_USER.name || fallbackName),
      role: CURRENT_USER.role || 'developer',
      githubHandle: CURRENT_USER.githubHandle || fallbackName,
      skills: CURRENT_USER.skills || [],
      joinedDate: CURRENT_USER.joinedDate || '',
    });
    upsertUsers([CURRENT_USER]);
    return CURRENT_USER;
  }

  return undefined;
}

export async function login(email: string, password: string) {
  const data = await request<TokenResponse>('/api/auth/login', {
    method: 'POST',
    skipAuthRefresh: true,
    body: JSON.stringify({ email, password }),
  });

  if (!getTokenValue(data, 'access')) {
    throw new Error(getTokenMessage(data, 'Login response did not include an access token.'));
  }

  applyAuthSession(data, email);
  return getTokenUser(data) || CURRENT_USER;
}

export async function register(fullName: string, email: string, password: string, confirmPassword = password) {
  return request<MessageResult>('/api/auth/signup', {
    method: 'POST',
    skipAuthRefresh: true,
    body: JSON.stringify({ fullName, email, password, confirmPassword }),
  });
}

export async function confirmEmail(email: string, confirmationToken: string) {
  return request('/api/auth/confirm-email', {
    method: 'POST',
    skipAuthRefresh: true,
    body: JSON.stringify({ email, confirmationToken }),
  });
}

export async function resendEmailConfirmation(email: string) {
  return request('/api/auth/resend-confirmation', {
    method: 'POST',
    skipAuthRefresh: true,
    body: JSON.stringify({ email }),
  });
}

export async function refreshSession(refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken) || '') {
  if (!refreshToken) return undefined;

  const data = await request<TokenResponse>('/api/auth/refresh', {
    method: 'POST',
    skipAuthRefresh: true,
    body: JSON.stringify({ refreshToken }),
  });

  if (!getTokenValue(data, 'access')) return undefined;

  applyAuthSession(data);
  return data;
}

function clearAuthSession() {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
}

export async function logoutFromBackend() {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken) || '';

  try {
    if (refreshToken) {
      await request('/api/auth/logout', {
        method: 'POST',
        skipAuthRefresh: true,
        body: JSON.stringify({ refreshToken }),
      });
    }
  } finally {
    clearAuthSession();
  }
}

export async function forgotPassword(email: string) {
  return request('/api/auth/forgot-password', {
    method: 'POST',
    skipAuthRefresh: true,
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(email: string, otp: string, newPassword: string, confirmPassword: string) {
  return request('/api/auth/reset-password', {
    method: 'POST',
    skipAuthRefresh: true,
    body: JSON.stringify({ email, otp, newPassword, confirmPassword }),
  });
}

export async function acceptInvitation(invitationId: string, email?: string) {
  const data = await request<TokenResponse | undefined>(`/api/workspaces/invitations/${invitationId}/accept`, {
    method: 'POST',
    skipAuthRefresh: true,
  });

  applyAuthSession(data, email);
  return getTokenUser(data);
}

export function logout() {
  clearAuthSession();
}

export function hasStoredSession() {
  return Boolean(localStorage.getItem(STORAGE_KEYS.accessToken));
}

export function isUnauthorizedError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

export async function fetchWorkspaces() {
  return request<ApiWorkspace[]>('/api/workspaces');
}

export async function fetchPendingInvitations() {
  const invitations = await request<ApiPendingWorkspaceInvitation[]>('/api/workspaces/invitations/pending');
  return invitations.map(mapPendingInvitation).filter((invitation): invitation is PendingWorkspaceInvitation => Boolean(invitation));
}

export async function rejectInvitation(invitationId: string) {
  await request(`/api/workspaces/invitations/${invitationId}/reject`, { method: 'POST' });
}

export async function resendInvitation(invitationId: string) {
  await request(`/api/workspaces/invitations/${invitationId}/resend`, { method: 'POST' });
}

export async function createWorkspace(name: string, description: string) {
  const workspace = await request<ApiWorkspace>('/api/workspaces', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
  CURRENT_USER.role = 'owner';
  const stored = USERS.find((user) => user.id === CURRENT_USER.id);
  if (stored) stored.role = 'owner';
  rememberJoinedWorkspace({
    id: workspace.id,
    name: workspace.name,
    description: workspace.description || description || 'Workspace',
    memberCount: workspace.memberCount || 1,
    role: 'Owner',
  });
  return workspace;
}

export async function updateWorkspace(workspaceId: string, name: string, description?: string) {
  const updated = await request<ApiWorkspace>(`/api/workspaces/${workspaceId}`, {
    method: 'PUT',
    body: JSON.stringify({ name, description: description || null, members: null }),
  });
  Object.assign(WORKSPACE, mapWorkspace(updated));
  return WORKSPACE;
}

export async function deleteWorkspace(workspaceId: string) {
  await request(`/api/workspaces/${workspaceId}`, { method: 'DELETE' });
  forgetJoinedWorkspace(workspaceId);
}

export async function leaveWorkspace(workspaceId: string) {
  await request(`/api/workspaces/${workspaceId}/members/me`, { method: 'DELETE' });
  forgetJoinedWorkspace(workspaceId);
}

export async function transferWorkspaceOwnership(workspaceId: string, newOwnerId: string) {
  await request(`/api/workspaces/${workspaceId}/transfer-ownership`, {
    method: 'PUT',
    body: JSON.stringify({ newOwnerId }),
  });
  WORKSPACE.ownerId = newOwnerId;
  const nextOwner = USERS.find((user) => user.id === newOwnerId);
  if (nextOwner) nextOwner.role = 'owner';
  CURRENT_USER.role = 'pm';
}

export async function updateWorkspaceMemberRole(workspaceId: string, userId: string, role: User['role']) {
  if (role === 'owner') {
    throw new Error('Use ownership transfer to make a member the workspace owner.');
  }

  await request(`/api/workspaces/${workspaceId}/members/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role: toApiWorkspaceRole(role) }),
  });

  const user = USERS.find((item) => item.id === userId);
  if (user) user.role = role;
  return user;
}

export async function createProject(input: CreateProjectInput) {
  const created = await request<ApiProject>('/api/projects', {
    method: 'POST',
    body: JSON.stringify({
      workspaceId: input.workspaceId,
      name: input.name,
      description: input.description || null,
      key: input.key || null,
    }),
  });
  const project = mapProject(created);
  upsertWorkspaceProject(project);
  return project;
}

export async function deleteProject(projectId: string) {
  await request(`/api/projects/${projectId}`, { method: 'DELETE' });
  replaceArray(PROJECTS, PROJECTS.filter((project) => project.id !== projectId));
  replaceArray(SPRINTS, SPRINTS.filter((sprint) => sprint.projectId !== projectId));
  replaceArray(TASKS, TASKS.filter((task) => task.projectId !== projectId));
}

export async function fetchProjectMembers(projectId: string) {
  const members = await request<ApiProjectMember[]>(`/api/projects/${projectId}/members`);
  const mappedMembers = members.map((member) => {
    const memberId = apiUserId(member);
    const memberEmail = member.email || member.Email || '';
    const memberName = member.fullName || member.FullName || member.name || member.Name || '';
    const existingUser = USERS.find(
      (user) =>
        user.id === memberId ||
        Boolean(memberEmail && user.email.toLowerCase() === memberEmail.toLowerCase()) ||
        Boolean(memberName && user.name.toLowerCase() === memberName.toLowerCase())
    );
    return mapUser({
      ...existingUser,
      ...member,
      id: memberId || existingUser?.id || '',
      role: memberId === WORKSPACE.ownerId ? 'owner' : member.role ?? member.Role ?? existingUser?.role,
    });
  }).filter((member) => member.id !== 'unknown-user' && !isEmptyGuid(member.id));

  upsertUsers(mappedMembers);

  const project = PROJECTS.find((item) => item.id === projectId);
  if (project) {
    project.memberIds = mappedMembers.map((member) => member.id);
  }

  return mappedMembers;
}

export async function assignProjectMember(projectId: string, userId: string, role: User['role'] = 'developer') {
  await request(`/api/projects/${projectId}/members`, {
    method: 'POST',
    body: JSON.stringify({ userId, role: toApiProjectRole(role) }),
  });

  const project = PROJECTS.find((item) => item.id === projectId);
  if (project && !project.memberIds.includes(userId)) {
    project.memberIds = [...project.memberIds, userId];
  }

  return fetchProjectMembers(projectId).catch(() => {
    const user = USERS.find((item) => item.id === userId);
    return user ? [user] : [];
  });
}

export async function removeProjectMember(projectId: string, userId: string) {
  if (isEmptyGuid(userId)) {
    throw new Error('Cannot remove this member because the backend did not return a valid userId.');
  }

  await request(`/api/projects/${projectId}/members/${userId}`, { method: 'DELETE' });

  const project = PROJECTS.find((item) => item.id === projectId);
  if (project) {
    project.memberIds = project.memberIds.filter((memberId) => memberId !== userId);
  }
}

export async function inviteWorkspaceMember(workspaceId: string, email: string, role: User['role'] = 'developer', message?: string) {
  return request(`/api/workspaces/${workspaceId}/members`, {
    method: 'POST',
    body: JSON.stringify({ email, message: message || null }),
  });
}

export async function fetchWorkspaceMembers(workspaceId: string) {
  const workspace = await request<ApiWorkspace>(`/api/workspaces/${workspaceId}`);
  Object.assign(WORKSPACE, mapWorkspace(workspace));
  const workspaceMembers = mapWorkspaceMembers(workspace);
  const workspaceOwner = mapWorkspaceOwner(workspace);

  const workspaceProjects = await request<ApiProject[]>(`/api/workspaces/${workspaceId}/projects`).catch(() => workspace.projects || []);
  const projectMembers = workspaceProjects.flatMap((project) => (project.members || []).map(mapUser));

  const mergedMembers = mergeUsers([CURRENT_USER, ...(workspaceOwner ? [workspaceOwner] : []), ...workspaceMembers, ...projectMembers]);
  if (mergedMembers.length > 0) {
    replaceArray(USERS, mergedMembers);
  }

  return USERS;
}

export async function hydrateWorkspace(workspaceId: string) {
  const workspace = await request<ApiWorkspace>(`/api/workspaces/${workspaceId}`);
  Object.assign(WORKSPACE, mapWorkspace(workspace));

  const workspaceMembers = getWorkspaceMemberDtos(workspace);
  const mappedWorkspaceMembers = mapWorkspaceMembers(workspace);
  upsertUsers(mappedWorkspaceMembers);

  const currentWorkspaceMember = workspaceMembers.find((member) => member.id === CURRENT_USER.id || ('userId' in member && member.userId === CURRENT_USER.id));
  if (currentWorkspaceMember?.role || workspace.ownerId === CURRENT_USER.id) {
    CURRENT_USER.role = workspace.ownerId === CURRENT_USER.id ? 'owner' : normalizeRole(currentWorkspaceMember?.role);
  }
  rememberJoinedWorkspace({
    id: workspace.id,
    name: workspace.name,
    description: workspace.description || 'Workspace',
    memberCount: workspace.memberCount || workspaceMembers.length || mappedWorkspaceMembers.length || 0,
    role: workspace.ownerId === CURRENT_USER.id ? 'Owner' : workspace.role || currentWorkspaceMember?.role || 'Developer',
  });

  const workspaceProjects = await request<ApiProject[]>(`/api/workspaces/${workspaceId}/projects`).catch(() => workspace.projects || []);
  const mappedProjects = workspaceProjects.map(mapProject);
  replaceArray(PROJECTS, mappedProjects);

  const projectBoards = await Promise.all(
    workspaceProjects.map(async (project) => {
      const board = await request<ApiBoard>(`/api/projects/${project.id}/board`).catch<ApiBoard>(() => ({
        projectId: project.id,
        sprints: project.sprints || project.sprint || [],
        backlogTasks: project.tasks || [],
        members: project.members || [],
      }));

      return { project, board };
    })
  );

  const nextSprints: Sprint[] = [];
  const nextTasks: Task[] = [];
  const nextUsers: User[] = [];

  projectBoards.forEach(({ project, board }) => {
    const members = board.members || project.members || [];
    nextUsers.push(...members.map((member) => {
      const user = mapUser(member);
      if (workspace.ownerId && user.id === workspace.ownerId) {
        user.role = 'owner';
      }
      return user;
    }));

    const sprints = board.sprints || [];
    nextSprints.push(...sprints.map((sprint) => mapSprint(sprint, project.id)));
    nextTasks.push(
      ...sprints.flatMap((sprint) => (sprint.tasks || []).map((task) => mapTask(task, project.id, sprint.id))),
      ...(board.backlogTasks || []).map((task) => mapTask(task, project.id, null))
    );

    const localProject = PROJECTS.find((item) => item.id === project.id);
    if (localProject) {
      localProject.memberIds = members.map((member) => apiUserId(member)).filter(Boolean);
      localProject.sprintIds = sprints.map((sprint) => sprint.id);
    }
  });

  const mergedUsers = mergeUsers([CURRENT_USER, ...mappedWorkspaceMembers, ...nextUsers]);
  replaceArray(USERS, mergedUsers);
  replaceArray(SPRINTS, nextSprints);
  replaceArray(TASKS, nextTasks);

  return {
    workspace: WORKSPACE,
    projects: PROJECTS,
    sprints: SPRINTS,
    tasks: TASKS,
    users: USERS,
  };
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const localTask = TASKS.find((task) => task.id === taskId);
  const latestTask = await request<ApiTask>(`/api/tasks/${taskId}`).catch(() => undefined);
  const latest = latestTask ? mapTask(latestTask, localTask?.projectId, localTask?.sprintId) : undefined;
  const rowVersion = latest?.rowVersion || localTask?.rowVersion;

  if (latest && localTask) {
    Object.assign(localTask, latest);
  }

  if (!rowVersion) {
    throw new Error('Cannot change task status because the backend did not provide a rowVersion.');
  }

  const updated = await request<ApiTask | undefined>(`/api/tasks/${taskId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status: toApiTaskStatus(status), rowVersion }),
  });

  if (localTask) {
    if (updated?.id || updated?.taskId) {
      Object.assign(localTask, mapTask(updated, localTask.projectId, localTask.sprintId));
    } else {
      const refreshed = await request<ApiTask>(`/api/tasks/${taskId}`).catch(() => undefined);
      Object.assign(localTask, refreshed ? mapTask(refreshed, localTask.projectId, localTask.sprintId) : { status });
    }
  }

  return localTask;
}

export async function createTask(input: CreateTaskInput) {
  const created = await request<ApiTask | undefined>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      projectId: input.projectId,
      title: input.title,
      sprintId: input.sprintId || null,
      description: input.description || null,
      assigneeId: input.assigneeId || null,
      dueDate: toApiDateTime(input.dueDate),
      status: input.status ? toApiTaskStatus(input.status) : undefined,
      priority: toApiPriority(input.priority),
    }),
  });

  if (created?.id || created?.taskId) {
    const task = mapTask(created, input.projectId, input.sprintId ?? null);
    upsertTasks([task]);
    return task;
  }

  throw new Error('The backend created the task but did not return the created task payload.');
}

export async function createSprint(input: CreateSprintInput) {
  const created = await request<ApiSprint | undefined>('/api/sprints', {
    method: 'POST',
    body: JSON.stringify({
      projectId: input.projectId,
      name: input.name,
      startDate: toApiDateTime(input.startDate),
      endDate: toApiDateTime(input.endDate),
      goal: input.goal || null,
    }),
  });

  if (!created?.id) {
    throw new Error('The backend created the sprint but did not return the created sprint payload.');
  }

  const sprint = mapSprint(created, input.projectId);
  upsertSprints([sprint]);

  const project = PROJECTS.find((item) => item.id === input.projectId);
  if (project && !project.sprintIds.includes(sprint.id)) {
    project.sprintIds = [...project.sprintIds, sprint.id];
  }

  return sprint;
}

export async function fetchTask(taskId: string, fallbackProjectId?: string, fallbackSprintId?: string | null) {
  const task = mapTask(await request<ApiTask>(`/api/tasks/${taskId}`), fallbackProjectId, fallbackSprintId);
  upsertTasks([task]);
  return task;
}

export async function fetchDeletedTasks(workspaceId: string) {
  const tasks = await request<ApiTask[]>(`/api/tasks/deleted?workspaceId=${encodeURIComponent(workspaceId)}`);
  const deletedTasks = tasks.map(mapDeletedTask);
  upsertTasks(deletedTasks);
  return deletedTasks;
}

export async function assignTask(taskId: string, assigneeId: string | null) {
  await request(`/api/tasks/${taskId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ assigneeId }),
  });
  return fetchTask(taskId);
}

export async function restoreTask(taskId: string) {
  await request(`/api/tasks/${taskId}/restore`, { method: 'POST' });
  const task = TASKS.find((item) => item.id === taskId);
  if (task) {
    task.isDeleted = false;
    task.deletedAt = null;
    task.deletedBy = null;
  }
}

export async function deleteTask(taskId: string) {
  await request(`/api/tasks/${taskId}`, { method: 'DELETE' });
  const task = TASKS.find((item) => item.id === taskId);
  if (task) {
    const deletedAt = new Date().toISOString();
    task.isDeleted = true;
    task.deletedAt = deletedAt;
    task.deletedBy = CURRENT_USER.id;
    task.activity = [
      ...task.activity,
      {
        id: `${task.id}-deleted-${Date.now()}`,
        type: 'audit',
        action: 'Deleted',
        userId: CURRENT_USER.id,
        timestamp: deletedAt,
      },
    ];
  }
}

export async function addSubTask(taskId: string, title: string) {
  await request(`/api/tasks/${taskId}/subtasks`, {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
  return fetchTask(taskId);
}

export async function toggleSubTask(taskId: string, subTaskId: string, isCompleted: boolean) {
  await request(`/api/tasks/${taskId}/subtasks/${subTaskId}/toggle`, {
    method: 'PUT',
    body: JSON.stringify({ isCompleted }),
  });
  return fetchTask(taskId);
}

export async function addDependency(taskId: string, dependsOnTaskId: string) {
  await request(`/api/tasks/${taskId}/dependencies`, {
    method: 'POST',
    body: JSON.stringify({ dependsOnTaskId }),
  });
  return fetchTask(taskId);
}

export async function moveTaskToSprint(taskId: string, sprintId: string | null) {
  const localTask = TASKS.find((item) => item.id === taskId);

  await request(`/api/tasks/${taskId}/sprint`, {
    method: 'PUT',
    body: JSON.stringify({ sprintId }),
  });

  if (localTask) {
    localTask.sprintId = sprintId;
    localTask.updatedAt = new Date().toISOString();
  }

  return fetchTask(taskId, localTask?.projectId, sprintId);
}

export async function addComment(taskId: string, body: string) {
  const formData = new FormData();
  formData.append('taskId', taskId);
  formData.append('body', body);

  const comment = await request<ApiComment>('/api/comments', {
    method: 'POST',
    body: formData,
    headers: {},
  });

  return comment;
}

export async function activateSprint(sprintId: string) {
  await request(`/api/sprints/${sprintId}/activate`, { method: 'POST' });
  const sprint = SPRINTS.find((item) => item.id === sprintId);
  if (sprint) sprint.status = 'active';
}

export async function closeSprint(sprintId: string) {
  await request(`/api/sprints/${sprintId}/close`, { method: 'POST' });
  const sprint = SPRINTS.find((item) => item.id === sprintId);
  if (sprint) sprint.status = 'completed';
}

export async function deleteSprint(sprintId: string) {
  const sprint = SPRINTS.find((item) => item.id === sprintId);

  await request(`/api/sprints/${sprintId}`, { method: 'DELETE' });

  replaceArray(SPRINTS, SPRINTS.filter((item) => item.id !== sprintId));
  TASKS.forEach((task) => {
    if (task.sprintId === sprintId) {
      task.sprintId = null;
    }
  });

  if (sprint) {
    const project = PROJECTS.find((item) => item.id === sprint.projectId);
    if (project) {
      project.sprintIds = project.sprintIds.filter((id) => id !== sprintId);
    }
  }
}

export const apiConfig = {
  baseUrl: API_BASE_URL,
};
