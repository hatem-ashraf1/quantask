export type UserRole = 'owner' | 'pm' | 'developer' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  githubHandle: string;
  skills: string[];
  joinedDate: string;
}

export type TaskStatus = 'ToDo' | 'InProgress' | 'Review' | 'Done';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Dependency {
  taskId: string;
  title: string;
  status: TaskStatus;
  isBlocked?: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  attachments?: { name: string; size: string; url: string }[];
  type: 'comment';
}

export interface AuditEntry {
  id: string;
  action: string;
  userId: string;
  timestamp: string;
  type: 'audit';
}

export interface Task {
  id: string;
  key: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  sprintId: string | null;
  dueDate: string | null;
  subTasks: SubTask[];
  dependencies: Dependency[];
  isBlocked: boolean;
  isDeleted: boolean;
  rowVersion?: string;
  projectId: string;
  activity: (Comment | AuditEntry)[];
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'future' | 'active' | 'completed';
  goal: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  key: string;
  color: string;
  memberIds: string[];
  sprintIds: string[];
  createdAt: string;
  status: 'active' | 'paused' | 'completed';
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo: string;
  ownerId: string;
}

export interface Notification {
  id: string;
  type: 'deadline' | 'assigned' | 'review' | 'mention' | 'blocked';
  message: string;
  taskId?: string;
  read: boolean;
  timestamp: string;
}

export const USERS: User[] = [];
export const SPRINTS: Sprint[] = [];
export const TASKS: Task[] = [];
export const PROJECTS: Project[] = [];
export const NOTIFICATIONS: Notification[] = [];
export const AI_SUGGESTIONS: {
  userId: string;
  matchScore: number;
  matchReason: string;
  confidence: 'high' | 'medium' | 'low';
}[] = [];

export const WORKSPACE: Workspace = {
  id: '',
  name: '',
  slug: '',
  logo: '',
  ownerId: '',
};

export const CURRENT_USER: User = {
  id: '',
  name: '',
  email: '',
  avatar: '',
  role: 'developer',
  githubHandle: '',
  skills: [],
  joinedDate: '',
};

export const getUserById = (id: string) => USERS.find((u) => u.id === id);
export const getSprintById = (id: string) => SPRINTS.find((s) => s.id === id);
export const getProjectById = (id: string) => PROJECTS.find((p) => p.id === id);
