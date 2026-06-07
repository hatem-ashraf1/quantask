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
  projectId: string;
  activity: (Comment | AuditEntry)[];
  createdAt: string;
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

// ─── Mock Users ──────────────────────────────────────────────────────────────
export const USERS: User[] = [
  {
    id: 'u1',
    name: 'Alex Rivera',
    email: 'alex@quantask.dev',
    avatar: 'AR',
    role: 'owner',
    githubHandle: 'alexrivera',
    skills: ['TypeScript', 'React', 'Node.js', 'GraphQL'],
    joinedDate: '2024-01-15',
  },
  {
    id: 'u2',
    name: 'Priya Patel',
    email: 'priya@quantask.dev',
    avatar: 'PP',
    role: 'pm',
    githubHandle: 'priyapatel',
    skills: ['Agile', 'Scrum', 'Python', 'SQL'],
    joinedDate: '2024-01-18',
  },
  {
    id: 'u3',
    name: 'Marcus Chen',
    email: 'marcus@quantask.dev',
    avatar: 'MC',
    role: 'developer',
    githubHandle: 'marcuschen',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
    joinedDate: '2024-02-01',
  },
  {
    id: 'u4',
    name: 'Sofia Reyes',
    email: 'sofia@quantask.dev',
    avatar: 'SR',
    role: 'developer',
    githubHandle: 'sofiareyes',
    skills: ['React', 'TypeScript', 'Tailwind', 'Testing'],
    joinedDate: '2024-02-10',
  },
  {
    id: 'u5',
    name: 'Jordan Lee',
    email: 'jordan@quantask.dev',
    avatar: 'JL',
    role: 'developer',
    githubHandle: 'jordanlee',
    skills: ['Go', 'Kubernetes', 'AWS', 'Terraform'],
    joinedDate: '2024-02-20',
  },
  {
    id: 'u6',
    name: 'Dana Kim',
    email: 'dana@quantask.dev',
    avatar: 'DK',
    role: 'viewer',
    githubHandle: 'danakim',
    skills: ['Design', 'Figma', 'UX Research'],
    joinedDate: '2024-03-05',
  },
];

// ─── Mock Sprints ─────────────────────────────────────────────────────────────
export const SPRINTS: Sprint[] = [
  {
    id: 's1',
    projectId: 'p1',
    name: 'Sprint 1 — Foundation',
    startDate: '2024-01-15',
    endDate: '2024-01-29',
    status: 'completed',
    goal: 'Set up core infrastructure and authentication',
  },
  {
    id: 's2',
    projectId: 'p1',
    name: 'Sprint 2 — AI Engine',
    startDate: '2024-01-30',
    endDate: '2024-02-13',
    status: 'active',
    goal: 'Build the GitHub NLP analysis pipeline and skill mapping',
  },
  {
    id: 's3',
    projectId: 'p1',
    name: 'Sprint 3 — Dashboard',
    startDate: '2024-02-14',
    endDate: '2024-02-28',
    status: 'future',
    goal: 'Complete the analytics dashboard and reporting layer',
  },
];

// ─── Mock Tasks ───────────────────────────────────────────────────────────────
export const TASKS: Task[] = [
  {
    id: 't1',
    key: 'QT-101',
    title: 'Implement GitHub OAuth integration',
    description:
      'Set up OAuth 2.0 flow with GitHub to pull commit history and PR data for skill analysis. Ensure token refresh and scoped permissions are handled correctly.',
    status: 'Done',
    priority: 'high',
    assigneeId: 'u3',
    sprintId: 's2',
    dueDate: '2024-02-05',
    subTasks: [
      { id: 'st1', title: 'Register OAuth app on GitHub', completed: true },
      { id: 'st2', title: 'Implement callback handler', completed: true },
      { id: 'st3', title: 'Store tokens securely in vault', completed: true },
    ],
    dependencies: [],
    isBlocked: false,
    isDeleted: false,
    projectId: 'p1',
    createdAt: '2024-01-31',
    activity: [
      {
        id: 'a1',
        type: 'audit',
        action: 'Task created by Alex Rivera',
        userId: 'u1',
        timestamp: '2024-01-31T09:00:00Z',
      },
      {
        id: 'a2',
        type: 'audit',
        action: 'Status changed to InProgress',
        userId: 'u3',
        timestamp: '2024-02-01T10:30:00Z',
      },
      {
        id: 'a3',
        type: 'comment',
        authorId: 'u3',
        content:
          'GitHub API rate limits are tricky — using conditional requests with ETags to stay under the limit. Will document in the wiki.',
        createdAt: '2024-02-02T14:00:00Z',
        attachments: [{ name: 'oauth-flow.png', size: '1.2MB', url: '#' }],
      },
      {
        id: 'a4',
        type: 'audit',
        action: 'Status changed to Review',
        userId: 'u3',
        timestamp: '2024-02-04T16:00:00Z',
      },
      {
        id: 'a5',
        type: 'audit',
        action: 'Status changed to Done — approved by Priya Patel',
        userId: 'u2',
        timestamp: '2024-02-05T11:00:00Z',
      },
    ],
  },
  {
    id: 't2',
    key: 'QT-102',
    title: 'Build NLP skill extraction pipeline',
    description:
      'Analyze commit messages, PR descriptions, and code diff metadata to extract programming language usage, frameworks, and domain expertise per developer.',
    status: 'InProgress',
    priority: 'critical',
    assigneeId: 'u3',
    sprintId: 's2',
    dueDate: '2024-02-10',
    subTasks: [
      { id: 'st4', title: 'Set up spaCy NLP environment', completed: true },
      { id: 'st5', title: 'Parse commit message corpus', completed: true },
      { id: 'st6', title: 'Build skill frequency matrix', completed: false },
      { id: 'st7', title: 'Output ranked skill scores to Redis', completed: false },
    ],
    dependencies: [{ taskId: 't1', title: 'Implement GitHub OAuth integration', status: 'Done' }],
    isBlocked: false,
    isDeleted: false,
    projectId: 'p1',
    createdAt: '2024-02-01',
    activity: [
      {
        id: 'a6',
        type: 'audit',
        action: 'Task created',
        userId: 'u2',
        timestamp: '2024-02-01T09:00:00Z',
      },
      {
        id: 'a7',
        type: 'audit',
        action: 'Assigned to Marcus Chen',
        userId: 'u2',
        timestamp: '2024-02-01T09:05:00Z',
      },
      {
        id: 'a8',
        type: 'comment',
        authorId: 'u2',
        content: 'Marcus, can you give an ETA on the skill matrix? This blocks QT-103.',
        createdAt: '2024-02-06T11:00:00Z',
      },
    ],
  },
  {
    id: 't3',
    key: 'QT-103',
    title: 'Design AI assignee recommendation API',
    description:
      'Expose a REST endpoint that accepts a task description and returns a ranked list of developers based on skill match scores computed by the NLP pipeline.',
    status: 'ToDo',
    priority: 'high',
    assigneeId: null,
    sprintId: 's2',
    dueDate: '2024-02-13',
    subTasks: [
      { id: 'st8', title: 'Define API contract (OpenAPI spec)', completed: false },
      { id: 'st9', title: 'Implement ranking algorithm', completed: false },
      { id: 'st10', title: 'Add confidence score to response', completed: false },
    ],
    dependencies: [{ taskId: 't2', title: 'Build NLP skill extraction pipeline', status: 'InProgress' }],
    isBlocked: true,
    isDeleted: false,
    projectId: 'p1',
    createdAt: '2024-02-01',
    activity: [
      {
        id: 'a9',
        type: 'audit',
        action: 'Task created',
        userId: 'u2',
        timestamp: '2024-02-01T09:10:00Z',
      },
    ],
  },
  {
    id: 't4',
    key: 'QT-104',
    title: 'Implement Kanban board drag-and-drop',
    description:
      'Build the real-time drag-and-drop Kanban board using react-dnd. Status transitions must emit WebSocket events for concurrency conflict detection.',
    status: 'InProgress',
    priority: 'high',
    assigneeId: 'u4',
    sprintId: 's2',
    dueDate: '2024-02-08',
    subTasks: [
      { id: 'st11', title: 'Set up react-dnd drag context', completed: true },
      { id: 'st12', title: 'Implement droppable column targets', completed: true },
      { id: 'st13', title: 'Add optimistic UI updates', completed: false },
      { id: 'st14', title: 'WebSocket concurrency conflict handler', completed: false },
    ],
    dependencies: [],
    isBlocked: false,
    isDeleted: false,
    projectId: 'p1',
    createdAt: '2024-02-01',
    activity: [
      {
        id: 'a10',
        type: 'audit',
        action: 'Task created',
        userId: 'u1',
        timestamp: '2024-02-01T10:00:00Z',
      },
      {
        id: 'a11',
        type: 'audit',
        action: 'Assigned to Sofia Reyes',
        userId: 'u1',
        timestamp: '2024-02-01T10:02:00Z',
      },
      {
        id: 'a12',
        type: 'comment',
        authorId: 'u4',
        content:
          'Drag preview is rendering incorrectly in Firefox. Will need to use a custom DragLayer. Adding ~2h to estimate.',
        createdAt: '2024-02-03T15:30:00Z',
      },
    ],
  },
  {
    id: 't5',
    key: 'QT-105',
    title: 'Multi-tenant workspace isolation',
    description:
      'Enforce row-level security on all database queries. Each workspace must be fully isolated — no cross-tenant data leakage in any API response.',
    status: 'Review',
    priority: 'critical',
    assigneeId: 'u5',
    sprintId: 's2',
    dueDate: '2024-02-07',
    subTasks: [
      { id: 'st15', title: 'Add workspace_id FK to all tables', completed: true },
      { id: 'st16', title: 'Configure Postgres RLS policies', completed: true },
      { id: 'st17', title: 'Write penetration test suite', completed: true },
      { id: 'st18', title: 'Security review sign-off', completed: false },
    ],
    dependencies: [],
    isBlocked: false,
    isDeleted: false,
    projectId: 'p1',
    createdAt: '2024-01-31',
    activity: [
      {
        id: 'a13',
        type: 'audit',
        action: 'Status changed to Review',
        userId: 'u5',
        timestamp: '2024-02-06T17:00:00Z',
      },
      {
        id: 'a14',
        type: 'comment',
        authorId: 'u2',
        content: 'Jordan, security team needs the pen test report before we can approve. Can you share the artifacts?',
        createdAt: '2024-02-07T09:00:00Z',
        attachments: [{ name: 'pentest-report-draft.pdf', size: '4.8MB', url: '#' }],
      },
    ],
  },
  {
    id: 't6',
    key: 'QT-106',
    title: 'Sprint velocity analytics dashboard',
    description:
      'Build a burndown chart and velocity tracker per sprint. Export to PDF. Data must roll up from task completion timestamps, not manual entry.',
    status: 'ToDo',
    priority: 'medium',
    assigneeId: null,
    sprintId: 's3',
    dueDate: '2024-02-20',
    subTasks: [
      { id: 'st19', title: 'Design data model for velocity metrics', completed: false },
      { id: 'st20', title: 'Build burndown chart with Recharts', completed: false },
      { id: 'st21', title: 'PDF export via puppeteer', completed: false },
    ],
    dependencies: [],
    isBlocked: false,
    isDeleted: false,
    projectId: 'p1',
    createdAt: '2024-02-05',
    activity: [],
  },
  {
    id: 't7',
    key: 'QT-107',
    title: 'Notification system — real-time alerts',
    description:
      'Implement WebSocket-based notifications for deadline reminders, task assignments, and review requests. Must support email fallback.',
    status: 'ToDo',
    priority: 'medium',
    assigneeId: 'u4',
    sprintId: 's2',
    dueDate: '2024-02-12',
    subTasks: [
      { id: 'st22', title: 'WebSocket notification bus', completed: false },
      { id: 'st23', title: 'Email fallback with SendGrid', completed: false },
    ],
    dependencies: [],
    isBlocked: false,
    isDeleted: false,
    projectId: 'p1',
    createdAt: '2024-02-02',
    activity: [],
  },
  {
    id: 't8',
    key: 'QT-108',
    title: 'Soft delete & restore for tasks',
    description:
      'Implement soft delete flag on tasks. Deleted tasks appear in Trash view with full restore capability. Hard delete only after 30-day retention.',
    status: 'Done',
    priority: 'low',
    assigneeId: 'u3',
    sprintId: 's1',
    dueDate: '2024-01-28',
    subTasks: [
      { id: 'st24', title: 'Add deleted_at column with index', completed: true },
      { id: 'st25', title: 'Build Trash UI view', completed: true },
      { id: 'st26', title: 'Restore API endpoint', completed: true },
    ],
    dependencies: [],
    isBlocked: false,
    isDeleted: false,
    projectId: 'p1',
    createdAt: '2024-01-20',
    activity: [],
  },
  // Deleted tasks for Trash view
  {
    id: 't9',
    key: 'QT-099',
    title: 'Experiment: LLM-based task auto-generation',
    description: 'POC for generating sub-tasks from task title using GPT-4o. Shelved — scope too large for current sprint.',
    status: 'ToDo',
    priority: 'low',
    assigneeId: null,
    sprintId: null,
    dueDate: null,
    subTasks: [],
    dependencies: [],
    isBlocked: false,
    isDeleted: true,
    projectId: 'p1',
    createdAt: '2024-01-25',
    activity: [
      {
        id: 'a15',
        type: 'audit',
        action: 'Task deleted by Alex Rivera',
        userId: 'u1',
        timestamp: '2024-02-01T12:00:00Z',
      },
    ],
  },
  {
    id: 't10',
    key: 'QT-098',
    title: 'Deprecated: Legacy CSV import tool',
    description: 'Old CSV import — replaced by the new API-first data ingestion layer.',
    status: 'Done',
    priority: 'low',
    assigneeId: 'u4',
    sprintId: 's1',
    dueDate: null,
    subTasks: [],
    dependencies: [],
    isBlocked: false,
    isDeleted: true,
    projectId: 'p1',
    createdAt: '2024-01-10',
    activity: [
      {
        id: 'a16',
        type: 'audit',
        action: 'Task deleted by Priya Patel',
        userId: 'u2',
        timestamp: '2024-02-03T10:00:00Z',
      },
    ],
  },
];

// ─── Mock Projects ────────────────────────────────────────────────────────────
export const PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'QuanTask Core Engine',
    description: 'The main AI-driven task and project management backend — NLP pipeline, API layer, and data model.',
    key: 'QT',
    color: '#5c5cf5',
    memberIds: ['u1', 'u2', 'u3', 'u4', 'u5'],
    sprintIds: ['s1', 's2', 's3'],
    createdAt: '2024-01-15',
    status: 'active',
  },
  {
    id: 'p2',
    name: 'Developer Dashboard',
    description: 'React frontend for the developer portal — Kanban, analytics, GitHub integration UI.',
    key: 'DD',
    color: '#22c55e',
    memberIds: ['u1', 'u2', 'u4'],
    sprintIds: [],
    createdAt: '2024-02-01',
    status: 'active',
  },
  {
    id: 'p3',
    name: 'Infrastructure & DevOps',
    description: 'Kubernetes cluster setup, CI/CD pipelines, monitoring stack, and multi-region deployment.',
    key: 'INF',
    color: '#f59e0b',
    memberIds: ['u1', 'u5'],
    sprintIds: [],
    createdAt: '2024-01-20',
    status: 'active',
  },
];

// ─── Mock Workspace ────────────────────────────────────────────────────────────
export const WORKSPACE: Workspace = {
  id: 'w1',
  name: 'QuanTask HQ',
  slug: 'quantask-hq',
  logo: 'QT',
  ownerId: 'u1',
};

// ─── Mock Notifications ───────────────────────────────────────────────────────
export const NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'deadline',
    message: 'QT-104 "Kanban drag-and-drop" is due in 24 hours',
    taskId: 't4',
    read: false,
    timestamp: '2024-02-07T08:00:00Z',
  },
  {
    id: 'n2',
    type: 'assigned',
    message: 'You were assigned to QT-107 "Notification system"',
    taskId: 't7',
    read: false,
    timestamp: '2024-02-06T15:30:00Z',
  },
  {
    id: 'n3',
    type: 'review',
    message: 'QT-105 is ready for your review',
    taskId: 't5',
    read: false,
    timestamp: '2024-02-06T17:05:00Z',
  },
  {
    id: 'n4',
    type: 'blocked',
    message: 'QT-103 is blocked — waiting on QT-102',
    taskId: 't3',
    read: true,
    timestamp: '2024-02-05T12:00:00Z',
  },
  {
    id: 'n5',
    type: 'mention',
    message: 'Priya Patel mentioned you in QT-105',
    taskId: 't5',
    read: true,
    timestamp: '2024-02-07T09:00:00Z',
  },
];

// ─── AI Suggestions (mock) ────────────────────────────────────────────────────
export const AI_SUGGESTIONS = [
  { userId: 'u3', matchScore: 94, matchReason: 'Python · FastAPI · 47 relevant commits', confidence: 'high' as const },
  { userId: 'u5', matchScore: 78, matchReason: 'Go · REST APIs · 23 relevant commits', confidence: 'medium' as const },
  { userId: 'u4', matchScore: 51, matchReason: 'TypeScript · 12 relevant commits', confidence: 'low' as const },
];

export const CURRENT_USER = USERS[0]; // Alex Rivera (Owner)

// ─── Helper ────────────────────────────────────────────────────────────────────
export const getUserById = (id: string) => USERS.find((u) => u.id === id);
export const getSprintById = (id: string) => SPRINTS.find((s) => s.id === id);
export const getProjectById = (id: string) => PROJECTS.find((p) => p.id === id);
