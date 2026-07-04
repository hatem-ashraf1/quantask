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
import { emitApiAuthorizationEvent } from '../authorization/apiEvents';
import {
  clearAuthorizationState,
  normalizeProjectRole,
  normalizeWorkspaceRole,
  removeProjectAuthorizationRole,
  removeWorkspaceAuthorizationRole,
  replaceProjectAuthorizationRoles,
  setAuthorizationScope,
  setAuthorizationUser,
  setProjectAuthorizationRole,
  setWorkspaceAuthorizationRole,
} from '../authorization/store';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  errors?: { code: string; message: string }[];
  statusCode: number;
};

type ApiRequestInit = RequestInit & {
  skipAuthRefresh?: boolean;
  suppressAuthEvents?: boolean;
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
  Bio?: string;
  profilePictureUrl?: string;
  ProfilePictureUrl?: string;
  role?: string;
  Role?: string;
  githubHandle?: string;
  gitHubHandle?: string;
  GitHubHandle?: string;
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

export type InvitationAcceptanceResult = {
  workspaceId?: string;
  WorkspaceId?: string;
};

export type ConnectGitHubRequest = {
  repositoryOwner: string;
  repositoryName: string;
  accessToken: string;
};

export type GitHubConnection = {
  projectId: string;
  repositoryFullName: string;
  defaultBranch: string;
  repositoryCreatedAt: string;
  lastPushAt?: string;
  lastSyncedAt?: string;
  isPrivate: boolean;
  repositoryHtmlUrl: string;
  isConnected: boolean;
  lastSyncStatus?: string;
  lastSyncError?: string;
  lastSyncStartedAt?: string;
  lastSyncCompletedAt?: string;
};

export type GitHubLanguageStat = {
  language: string;
  bytes: number;
  percentage: number;
};

export type GitHubContributorStat = {
  login: string;
  displayName?: string;
  commits: number;
  percentage: number;
  avatarUrl?: string;
  htmlUrl?: string;
};

export type GitHubAnalytics = {
  projectId: string;
  repositoryFullName: string;
  isPrivate: boolean;
  repositoryHtmlUrl: string;
  defaultBranch: string;
  totalCommits: number;
  totalPullRequests: number;
  openPullRequests: number;
  closedPullRequests: number;
  mergedPullRequests: number;
  openIssues: number;
  closedIssues: number;
  languages: GitHubLanguageStat[];
  contributors: GitHubContributorStat[];
  busFactorRisk: string;
  topContributor?: string;
  topContributorCommitPercentage: number;
  isDataTruncated: boolean;
  dataLimitWarning?: string;
  lastSyncStatus?: string;
  lastSyncError?: string;
  lastSyncStartedAt?: string;
  lastSyncCompletedAt?: string;
  syncedAt: string;
};

export type GitHubOperationStatus = {
  projectId?: string;
  status: string;
  progressPercent?: number;
  statusMessage?: string;
  startedAt?: string;
  completedAt?: string | null;
  error?: string | null;
};

export type ReportStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Expired';

export type CreateReportRequest = {
  projectId?: string;
  fromDate?: string;
  toDate?: string;
  includeGitHub: boolean;
};

export type ReportJob = {
  jobId: string;
  reportName: string;
  status: ReportStatus;
  downloadUrl?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
  expiresAt?: string;
  workspaceId?: string;
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

type ApiGitHubOperationStatus = {
  projectId?: string;
  ProjectId?: string;
  status?: string;
  Status?: string;
  progressPercent?: number;
  ProgressPercent?: number;
  statusMessage?: string;
  StatusMessage?: string;
  startedAt?: string;
  StartedAt?: string;
  completedAt?: string | null;
  CompletedAt?: string | null;
  error?: string | null;
  Error?: string | null;
  data?: ApiGitHubOperationStatus;
  Data?: ApiGitHubOperationStatus;
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

type UpdateTaskInput = {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string | null;
};

type ApiSmartAssigneeRecommendation = {
  developerKey?: string;
  DeveloperKey?: string;
  developerId?: string;
  DeveloperId?: string;
  name?: string;
  Name?: string;
  email?: string;
  Email?: string;
  score?: number;
  Score?: number;
  rank?: number;
  Rank?: number;
};

type ApiSmartAssigneeResponse = {
  taskTitle?: string;
  TaskTitle?: string;
  recommendations?: ApiSmartAssigneeRecommendation[];
  Recommendations?: ApiSmartAssigneeRecommendation[];
  assigneeId?: string;
  userId?: string;
  recommendedUserId?: string;
  matchScore?: number;
  score?: number;
  confidence?: string;
  reason?: string;
  matchReason?: string;
};

export type SmartAssigneeRecommendation = {
  developerKey: string;
  developerId: string;
  name: string;
  email: string;
  score: number;
  rank: number;
};

function normalizeSmartAssigneeScore(score?: number) {
  if (typeof score !== 'number' || Number.isNaN(score)) return 0;
  const percentage = score > 0 && score <= 1 ? score * 100 : score;
  return Math.max(0, Math.min(100, percentage));
}

type ApiForecastResponse = {
  estimatedWorkingHours?: number;
  EstimatedWorkingHours?: number;
  estimatedHours?: number;
  EstimatedHours?: number;
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

type UpdateProjectInput = {
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
  currentUser: 'quantask_current_user',
  workspaceOwners: 'quantask_workspace_owners',
  joinedWorkspaces: 'quantask_joined_workspaces',
  reportWorkspaces: 'quantask_report_workspaces',
};

const DEFAULT_API_BASE_URL = 'http://quantask.runasp.net';
const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || DEFAULT_API_BASE_URL).replace(/\/$/, '');

function authHeaders() {
  const token = sessionStorage.getItem(STORAGE_KEYS.accessToken);
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

  if (message === 'EMAIL_NOT_CONFIRMED') return 'Please confirm your email before signing in.';
  if (message === 'INVALID_CREDENTIALS') return 'The email or password is incorrect.';
  if (message === 'EMAIL_ALREADY_EXISTS') return 'An account with this email already exists.';
  if (message.includes('Failed to fetch')) return 'Network request failed. Please check your connection and try again.';
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
  const { skipAuthRefresh, suppressAuthEvents, ...fetchOptions } = options;
  const hadAuthenticatedSession = Boolean(sessionStorage.getItem(STORAGE_KEYS.accessToken));

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

  if (response.status === 401 && !skipAuthRefresh && sessionStorage.getItem(STORAGE_KEYS.refreshToken)) {
    const refreshed = await refreshSession().catch(() => undefined);
    if (refreshed) {
      return request<T>(path, { ...options, skipAuthRefresh: true });
    }
  }

  if (!response.ok) {
    const message = getApiErrorMessage(payload, fallbackErrorMessage(response.status, response.statusText));
    if (response.status === 403 && !suppressAuthEvents) {
      emitApiAuthorizationEvent({
        type: 'forbidden',
        message: 'You do not have the required permissions to perform this action.',
      });
    }
    if (
      response.status === 401 &&
      hadAuthenticatedSession &&
      sessionStorage.getItem(STORAGE_KEYS.accessToken) &&
      !suppressAuthEvents
    ) {
      clearAuthSession();
      clearAuthorizationState();
      emitApiAuthorizationEvent({
        type: 'unauthorized',
        message: 'Your session has expired. Please sign in again.',
      });
    }
    throw new ApiError(message, response.status);
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

function normalizeGitHubOperationStatus(value: unknown): GitHubOperationStatus | undefined {
  if (!value || typeof value !== 'object') return undefined;

  const raw = value as ApiGitHubOperationStatus;
  const status = raw.status || raw.Status;
  if (!status && (raw.data || raw.Data)) return normalizeGitHubOperationStatus(raw.data || raw.Data);
  if (!status) return undefined;

  return {
    projectId: raw.projectId || raw.ProjectId,
    status,
    progressPercent: raw.progressPercent ?? raw.ProgressPercent,
    statusMessage: raw.statusMessage || raw.StatusMessage,
    startedAt: raw.startedAt || raw.StartedAt,
    completedAt: raw.completedAt ?? raw.CompletedAt ?? null,
    error: raw.error ?? raw.Error ?? null,
  };
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
  const raw = nestedUser
    ? {
        ...nestedUser,
        ...user,
        role: user.role ?? user.Role ?? nestedUser.role ?? nestedUser.Role,
      }
    : user;
  const id = apiUserId(raw) || raw.email || raw.Email || 'unknown-user';
  const email = raw.email || raw.Email || '';
  const username = raw.username || raw.userName || raw.UserName || '';
  const name = raw.fullName || raw.FullName || raw.name || raw.Name || username || email || 'Unknown User';
  return {
    id,
    name,
    email,
    avatar: initials(name),
    role: normalizeRole(raw.role ?? raw.Role),
    githubHandle: raw.githubHandle || raw.gitHubHandle || raw.GitHubHandle || username || '',
    skills: raw.skills || [],
    joinedDate: dateOnly(raw.joinedDate || raw.joinedAt || raw.JoinedAt || raw.createdAt || raw.CreatedAt) || '',
    bio: raw.bio || raw.Bio || '',
    profilePictureUrl: raw.profilePictureUrl || raw.ProfilePictureUrl || '',
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
    bio: incoming.bio ?? existing.bio,
    profilePictureUrl: incoming.profilePictureUrl || existing.profilePictureUrl,
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

function applyCurrentWorkspaceRole(workspace: ApiWorkspace, workspaceMembers = getWorkspaceMemberDtos(workspace)) {
  const currentWorkspaceMember = workspaceMembers.find(
    (member) => apiUserId(member) === CURRENT_USER.id
  );
  const resolvedRole =
    workspace.ownerId === CURRENT_USER.id
      ? 'owner'
      : normalizeRole(currentWorkspaceMember?.role ?? currentWorkspaceMember?.Role ?? workspace.role);

  setAuthorizationUser(CURRENT_USER.id);
  setWorkspaceAuthorizationRole(
    workspace.id,
    normalizeWorkspaceRole(workspace.role, workspace.ownerId === CURRENT_USER.id)
  );
  CURRENT_USER.role = resolvedRole;

  const storedCurrentUser = USERS.find((user) => user.id === CURRENT_USER.id);
  if (storedCurrentUser) {
    storedCurrentUser.role = resolvedRole;
  }
  persistCurrentUserSession();

  return resolvedRole;
}

export function applySelectedWorkspaceRole(role?: string, workspaceId?: string) {
  const resolvedRole = normalizeRole(role);
  if (workspaceId) {
    setAuthorizationScope(workspaceId);
    setWorkspaceAuthorizationRole(workspaceId, normalizeWorkspaceRole(role));
  }
  CURRENT_USER.role = resolvedRole;

  const storedCurrentUser = USERS.find((user) => user.id === CURRENT_USER.id);
  if (storedCurrentUser) {
    storedCurrentUser.role = resolvedRole;
  }
  persistCurrentUserSession();

  return resolvedRole;
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

function persistCurrentUserSession() {
  if (!CURRENT_USER.id && !CURRENT_USER.email) return;
  sessionStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(CURRENT_USER));
}

export function restoreCurrentUserSession() {
  try {
    const storedUser = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.currentUser) || 'null') as User | null;
    if (!storedUser?.id && !storedUser?.email) return false;

    Object.assign(CURRENT_USER, storedUser);
    setAuthorizationUser(CURRENT_USER.id);
    upsertUsers([CURRENT_USER]);
    return true;
  } catch {
    sessionStorage.removeItem(STORAGE_KEYS.currentUser);
    return false;
  }
}

function applyAuthSession(data: TokenResponse | undefined, fallbackEmail?: string) {
  const accessToken = getTokenValue(data, 'access');
  const refreshToken = getTokenValue(data, 'refresh');
  const user = getTokenUser(data);

  if (accessToken) sessionStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
  if (refreshToken) sessionStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);

  if (user) {
    Object.assign(CURRENT_USER, mapUser(user));
    setAuthorizationUser(CURRENT_USER.id);
    upsertUsers([CURRENT_USER]);
    persistCurrentUserSession();
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
    setAuthorizationUser(CURRENT_USER.id);
    upsertUsers([CURRENT_USER]);
    persistCurrentUserSession();
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

export async function register(
  fullName: string,
  email: string,
  password: string,
  confirmPassword = password,
  gitHubHandle?: string,
) {
  return request<MessageResult>('/api/auth/signup', {
    method: 'POST',
    skipAuthRefresh: true,
    body: JSON.stringify({
      fullName,
      email,
      password,
      confirmPassword,
      gitHubHandle: gitHubHandle?.trim() || null,
    }),
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

export async function refreshSession(refreshToken = sessionStorage.getItem(STORAGE_KEYS.refreshToken) || '') {
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
  sessionStorage.removeItem(STORAGE_KEYS.accessToken);
  sessionStorage.removeItem(STORAGE_KEYS.refreshToken);
  sessionStorage.removeItem(STORAGE_KEYS.currentUser);
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  clearAuthorizationState();
}

export async function logoutFromBackend() {
  const refreshToken = sessionStorage.getItem(STORAGE_KEYS.refreshToken) || '';

  try {
    if (refreshToken) {
      await request('/api/auth/logout', {
        method: 'POST',
        skipAuthRefresh: true,
        suppressAuthEvents: true,
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch {
    void 0;
  } finally {
    clearAuthSession();
  }
}

export async function fetchMyProfile() {
  const profile = await request<ApiUser>('/api/users/profile');
  Object.assign(CURRENT_USER, {
    ...CURRENT_USER,
    ...mapUser(profile),
    role: CURRENT_USER.role,
  });
  upsertUsers([CURRENT_USER]);
  persistCurrentUserSession();
  return CURRENT_USER;
}

export async function updateMyProfile(input: { fullName: string; bio?: string; githubHandle?: string }) {
  const profile = await request<ApiUser>('/api/users/profile', {
    method: 'PATCH',
    body: JSON.stringify({
      fullName: input.fullName,
      bio: input.bio || '',
      githubHandle: input.githubHandle?.trim() || null,
    }),
  });
  const mappedProfile = mapUser(profile);
  if (!mappedProfile.githubHandle && input.githubHandle) {
    mappedProfile.githubHandle = input.githubHandle.trim();
  }
  Object.assign(CURRENT_USER, {
    ...CURRENT_USER,
    ...mappedProfile,
    role: CURRENT_USER.role,
  });
  upsertUsers([CURRENT_USER]);
  persistCurrentUserSession();
  return CURRENT_USER;
}

export async function uploadMyProfilePicture(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await request<{ profilePictureUrl?: string; ProfilePictureUrl?: string; url?: string; Url?: string }>(
    '/api/users/profile/picture',
    {
      method: 'POST',
      body: formData,
      headers: {},
    }
  );
  const profilePictureUrl = response.profilePictureUrl || response.ProfilePictureUrl || response.url || response.Url || '';
  if (profilePictureUrl) {
    CURRENT_USER.profilePictureUrl = profilePictureUrl;
    upsertUsers([CURRENT_USER]);
    persistCurrentUserSession();
  }
  return profilePictureUrl;
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

export async function acceptInvitation(invitationToken: string) {
  return request<InvitationAcceptanceResult | undefined>(
    `/api/workspaces/invitations/${encodeURIComponent(invitationToken)}/accept`,
    {
    method: 'POST',
    }
  );
}

export function logout() {
  clearAuthSession();
}

export function hasStoredSession() {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  return Boolean(sessionStorage.getItem(STORAGE_KEYS.accessToken));
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
  persistCurrentUserSession();
  setAuthorizationScope(workspace.id);
  setWorkspaceAuthorizationRole(workspace.id, 'workspace-owner');
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
  await request(`/api/workspaces/${workspaceId}`, {
    method: 'PUT',
    body: JSON.stringify({ name, description: description || null, members: null }),
  });
  Object.assign(WORKSPACE, mapWorkspace({
    id: workspaceId,
    name: name.trim() || WORKSPACE.name,
    ownerId: WORKSPACE.ownerId,
  }));
  return WORKSPACE;
}

export async function deleteWorkspace(workspaceId: string) {
  await request(`/api/workspaces/${workspaceId}`, { method: 'DELETE' });
  forgetJoinedWorkspace(workspaceId);
  removeWorkspaceAuthorizationRole(workspaceId);
}

export async function leaveWorkspace(workspaceId: string) {
  await request(`/api/workspaces/${workspaceId}/members/me`, { method: 'DELETE' });
  forgetJoinedWorkspace(workspaceId);
  removeWorkspaceAuthorizationRole(workspaceId);
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
  setWorkspaceAuthorizationRole(workspaceId, 'workspace-member');
  persistCurrentUserSession();
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
  setProjectAuthorizationRole(project.id, 'project-manager');
  return project;
}

export async function updateProject(projectId: string, input: UpdateProjectInput) {
  const localProject = PROJECTS.find((project) => project.id === projectId);
  const updated = await request<ApiProject | undefined>(`/api/projects/${projectId}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: input.name,
      description: input.description || null,
      key: input.key || null,
    }),
  }).catch(async (error) => {
    if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
      return request<ApiProject | undefined>(`/api/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: input.name,
          description: input.description || null,
          key: input.key || null,
        }),
      });
    }
    throw error;
  });

  const project = updated?.id ? mapProject(updated) : {
    ...(localProject || {
      id: projectId,
      color: '#5c5cf5',
      memberIds: [],
      sprintIds: [],
      createdAt: '',
      status: 'active' as const,
    }),
    name: input.name,
    description: input.description || '',
    key: input.key || localProject?.key || initials(input.name).slice(0, 5),
  };

  upsertWorkspaceProject(project);
  return project;
}

export async function deleteProject(projectId: string) {
  await request(`/api/projects/${projectId}`, { method: 'DELETE' });
  replaceArray(PROJECTS, PROJECTS.filter((project) => project.id !== projectId));
  replaceArray(SPRINTS, SPRINTS.filter((sprint) => sprint.projectId !== projectId));
  replaceArray(TASKS, TASKS.filter((task) => task.projectId !== projectId));
  removeProjectAuthorizationRole(projectId);
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

  const currentMember = mappedMembers.find((member) => member.id === CURRENT_USER.id);
  const currentProjectRole = normalizeProjectRole(currentMember?.role);
  if (currentProjectRole) {
    setProjectAuthorizationRole(projectId, currentProjectRole);
  } else {
    removeProjectAuthorizationRole(projectId);
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
  if (userId === CURRENT_USER.id) {
    const projectRole = normalizeProjectRole(toApiProjectRole(role));
    if (projectRole) setProjectAuthorizationRole(projectId, projectRole);
  }

  return fetchProjectMembers(projectId).catch(() => {
    const user = USERS.find((item) => item.id === userId);
    return user ? [user] : [];
  });
}

export async function updateProjectMemberRole(projectId: string, userId: string, role: User['role']) {
  await request(`/api/projects/${projectId}/members/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ newRole: toApiProjectRole(role) }),
  });

  if (userId === CURRENT_USER.id) {
    const projectRole = normalizeProjectRole(toApiProjectRole(role));
    if (projectRole) setProjectAuthorizationRole(projectId, projectRole);
  }

  const members = await fetchProjectMembers(projectId);
  const updatedMember = members.find((member) => member.id === userId);
  if (!updatedMember || updatedMember.role !== role) {
    throw new Error('The backend accepted the role update but did not return the requested project role.');
  }
  return members;
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
  if (userId === CURRENT_USER.id) removeProjectAuthorizationRole(projectId);
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
  applyCurrentWorkspaceRole(workspace);

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
  const currentWorkspaceRole = applyCurrentWorkspaceRole(workspace, workspaceMembers);
  replaceProjectAuthorizationRoles({});
  upsertUsers(mappedWorkspaceMembers);

  rememberJoinedWorkspace({
    id: workspace.id,
    name: workspace.name,
    description: workspace.description || 'Workspace',
    memberCount: workspace.memberCount || workspaceMembers.length || mappedWorkspaceMembers.length || 0,
    role: currentWorkspaceRole,
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
    const currentProjectMember = members.find((member) => apiUserId(member) === CURRENT_USER.id);
    const currentProjectRole = normalizeProjectRole(
      currentProjectMember?.role ?? currentProjectMember?.Role
    );
    if (currentProjectRole) {
      setProjectAuthorizationRole(project.id, currentProjectRole);
    }
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

export async function updateTaskDetails(taskId: string, input: UpdateTaskInput) {
  const localTask = TASKS.find((task) => task.id === taskId);
  const latestTask = await request<ApiTask>(`/api/tasks/${taskId}`).catch(() => undefined);
  const latest = latestTask ? mapTask(latestTask, localTask?.projectId, localTask?.sprintId) : undefined;
  const rowVersion = latest?.rowVersion || localTask?.rowVersion;

  if (latest && localTask) {
    Object.assign(localTask, latest);
  }

  const body = JSON.stringify({
    title: input.title,
    description: input.description || null,
    priority: toApiPriority(input.priority),
    dueDate: toApiDateTime(input.dueDate),
    rowVersion,
  });

  const updated = await request<ApiTask | undefined>(`/api/tasks/${taskId}`, {
    method: 'PUT',
    body,
  }).catch(async (error) => {
    if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
      return request<ApiTask | undefined>(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        body,
      });
    }
    throw error;
  });

  if (updated?.id || updated?.taskId) {
    const task = mapTask(updated, localTask?.projectId, localTask?.sprintId);
    upsertTasks([task]);
    return task;
  }

  if (localTask) {
    Object.assign(localTask, {
      title: input.title,
      description: input.description || '',
      priority: input.priority || localTask.priority,
      dueDate: input.dueDate || null,
      updatedAt: new Date().toISOString(),
    });
    return localTask;
  }

  return fetchTask(taskId);
}

export async function fetchDeletedTasks(workspaceId: string) {
  const tasks = await request<ApiTask[]>(`/api/tasks/deleted?workspaceId=${encodeURIComponent(workspaceId)}`);
  const deletedTasks = tasks.map(mapDeletedTask);
  upsertTasks(deletedTasks);
  return deletedTasks;
}

export async function assignTask(taskId: string, assigneeId: string | null) {
  if (!assigneeId) {
    throw new Error('The backend does not support unassigning an existing task yet.');
  }

  await request(`/api/tasks/${taskId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ assigneeId }),
  });
  return fetchTask(taskId);
}

export async function getSmartAssignee(projectId: string, input: { taskTitle: string; taskDescription?: string }) {
  const response = await request<ApiSmartAssigneeResponse>(`/api/tasks/projects/${projectId}/smart-assignee`, {
    method: 'POST',
    body: JSON.stringify({
      taskTitle: input.taskTitle,
      taskDescription: input.taskDescription || '',
    }),
  });

  const recommendations = (response.recommendations || response.Recommendations || [])
    .map((recommendation, index): SmartAssigneeRecommendation => ({
      developerKey: recommendation.developerKey || recommendation.DeveloperKey || '',
      developerId: recommendation.developerId || recommendation.DeveloperId || '',
      name: recommendation.name || recommendation.Name || '',
      email: recommendation.email || recommendation.Email || '',
      score: normalizeSmartAssigneeScore(recommendation.score ?? recommendation.Score),
      rank: recommendation.rank ?? recommendation.Rank ?? index + 1,
    }))
    .sort((a, b) => a.rank - b.rank);
  const bestRecommendation = recommendations[0];
  const recommendedUserId =
    response.assigneeId ||
    response.userId ||
    response.recommendedUserId ||
    bestRecommendation?.developerId ||
    '';

  return {
    ...response,
    taskTitle: response.taskTitle || response.TaskTitle || input.taskTitle,
    recommendations,
    assigneeId: recommendedUserId || undefined,
    userId: recommendedUserId || undefined,
    recommendedUserId: recommendedUserId || undefined,
    matchScore: normalizeSmartAssigneeScore(response.matchScore ?? response.score ?? bestRecommendation?.score),
    score: normalizeSmartAssigneeScore(response.score ?? response.matchScore ?? bestRecommendation?.score),
  };
}

export async function forecastTaskWorkingHours(taskId: string) {
  const response = await request<ApiForecastResponse>(`/api/tasks/${taskId}/forecast`, {
    method: 'POST',
  });

  const estimatedWorkingHours =
    response.estimatedWorkingHours ??
    response.EstimatedWorkingHours ??
    response.estimatedHours ??
    response.EstimatedHours;

  if (typeof estimatedWorkingHours !== 'number') {
    throw new Error('The forecast response did not include working hours.');
  }

  return estimatedWorkingHours;
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

export async function addComment(taskId: string, body: string, files: File[] = []) {
  const formData = new FormData();
  formData.append('taskId', taskId);
  formData.append('body', body);
  files.forEach((file, index) => {
    formData.append(`attachments[${index}].file`, file);
  });

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

export async function connectGitHubRepository(projectId: string, input: ConnectGitHubRequest) {
  return request<GitHubConnection>(`/api/projects/${projectId}/github/connect`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getGitHubAnalytics(projectId: string) {
  return request<GitHubAnalytics>(`/api/projects/${projectId}/github/analytics`);
}

export async function syncGitHubAnalytics(projectId: string) {
  const result = await request<unknown>(`/api/projects/${projectId}/github/sync`, {
    method: 'POST',
  });
  return normalizeGitHubOperationStatus(result);
}

export async function getGitHubSyncStatus(projectId: string) {
  const result = await request<unknown>(`/api/projects/${projectId}/github/sync/status`);
  const status = normalizeGitHubOperationStatus(result);
  if (!status) throw new Error('The backend did not return a GitHub sync status.');
  return status;
}

export async function getGitHubIngestionStatus(projectId: string) {
  const result = await request<unknown>(`/api/projects/${projectId}/github/ingestion/status`);
  const status = normalizeGitHubOperationStatus(result);
  if (!status) throw new Error('The backend did not return a GitHub ingestion status.');
  return status;
}

function readReportWorkspaceCache() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.reportWorkspaces) || '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

function rememberReportWorkspace(jobId: string | undefined, workspaceId: string) {
  if (!jobId || !workspaceId) return;
  const cache = readReportWorkspaceCache();
  cache[jobId] = workspaceId;
  localStorage.setItem(STORAGE_KEYS.reportWorkspaces, JSON.stringify(cache));
}

function reportNameMatchesWorkspace(reportName: string, workspaceName: string) {
  const normalizedReportName = reportName.trim().toLowerCase();
  const normalizedWorkspaceName = workspaceName.trim().toLowerCase();
  return Boolean(normalizedWorkspaceName && normalizedReportName.startsWith(`${normalizedWorkspaceName} report`));
}

function withCachedReportWorkspace(report: ReportJob): ReportJob {
  return {
    ...report,
    workspaceId: report.workspaceId || readReportWorkspaceCache()[report.jobId],
  };
}

export async function createWorkspaceReport(workspaceId: string, input: CreateReportRequest) {
  const report = await request<ReportJob>(`/api/workspaces/${workspaceId}/reports`, {
    method: 'POST',
    body: JSON.stringify({
      projectId: input.projectId || null,
      fromDate: input.fromDate || null,
      toDate: input.toDate || null,
      includeGitHub: true,
    }),
  });
  rememberReportWorkspace(report.jobId, workspaceId);
  return { ...report, workspaceId };
}

export async function getReportStatus(jobId: string) {
  return withCachedReportWorkspace(await request<ReportJob>(`/api/reports/${jobId}/status`));
}

export async function getMyReports() {
  const reports = await request<ReportJob[]>('/api/reports/my');
  return reports.map(withCachedReportWorkspace);
}

export async function getWorkspaceReports(workspaceId: string, workspaceName: string) {
  const reports = await getMyReports();
  return reports.filter((report) => {
    if (report.workspaceId) return report.workspaceId === workspaceId;
    return reportNameMatchesWorkspace(report.reportName, workspaceName);
  });
}

function reportFileName(contentDisposition: string | null, fallback: string) {
  const utf8Match = contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i);
  const basicMatch = contentDisposition?.match(/filename="?([^";]+)"?/i);
  const value = utf8Match?.[1] || basicMatch?.[1];

  if (!value) return fallback;

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function downloadReport(jobId: string, fallbackName = 'QuanTask Report.pdf', retried = false) {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${normalizePath(`/api/reports/${jobId}/download`)}`, {
      headers: authHeaders(),
    });
  } catch {
    throw new Error(`Unable to reach the backend at ${API_BASE_URL}.`);
  }

  if (response.status === 401 && !retried && sessionStorage.getItem(STORAGE_KEYS.refreshToken)) {
    const refreshed = await refreshSession().catch(() => undefined);
    if (refreshed) return downloadReport(jobId, fallbackName, true);
  }

  if (!response.ok) {
    const payload = parseResponsePayload(await response.text());
    if (response.status === 403) {
      emitApiAuthorizationEvent({
        type: 'forbidden',
        message: 'You do not have the required permissions to perform this action.',
      });
    }
    if (response.status === 401 && sessionStorage.getItem(STORAGE_KEYS.accessToken)) {
      clearAuthSession();
      emitApiAuthorizationEvent({
        type: 'unauthorized',
        message: 'Your session has expired. Please sign in again.',
      });
    }
    throw new ApiError(
      getApiErrorMessage(payload, fallbackErrorMessage(response.status, response.statusText)),
      response.status
    );
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = reportFileName(response.headers.get('Content-Disposition'), fallbackName);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export const apiConfig = {
  baseUrl: API_BASE_URL,
};
