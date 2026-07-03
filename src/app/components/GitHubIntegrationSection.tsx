import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  Github,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  ApiError,
  connectGitHubRepository,
  getGitHubAnalytics,
  getGitHubIngestionStatus,
  getGitHubSyncStatus,
  GitHubAnalytics,
  GitHubConnection,
  GitHubOperationStatus,
  syncGitHubAnalytics,
} from '../api/client';
import { canManageProject } from '../utils/permissions';

type GitHubIntegrationSectionProps = {
  projectId: string;
};

// Date formatter used for repository sync timestamps.
function formatDate(value?: string) {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function githubError(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.status === 403) {
    return 'You do not have permission to perform this action.';
  }

  const message = error instanceof Error ? error.message : fallback;
  const normalized = message.toLowerCase();
  if (normalized.includes('rate limit')) return 'GitHub rate limit reached. Please try again later.';
  if (normalized.includes('token') || normalized.includes('repository') || normalized.includes('access')) {
    return 'Unable to access this repository. Check the repository name and token permissions.';
  }
  return message || fallback;
}

function normalizedStatus(status?: string) {
  return String(status || '').toLowerCase();
}

function isGitHubSyncRunning(status?: GitHubOperationStatus | null) {
  const normalized = normalizedStatus(status?.status);
  return normalized === 'pending' || normalized === 'inprogress' || normalized === 'in_progress';
}

function isGitHubSyncSucceeded(status?: GitHubOperationStatus | null) {
  const normalized = normalizedStatus(status?.status);
  return normalized === 'success' || normalized === 'succeeded';
}

function isGitHubSyncFailed(status?: GitHubOperationStatus | null) {
  const normalized = normalizedStatus(status?.status);
  return normalized === 'failed' || normalized === 'invalidpat' || normalized === 'invalid_pat';
}

function isGitHubIngestionRunning(status?: GitHubOperationStatus | null) {
  const normalized = normalizedStatus(status?.status);
  return normalized === 'queued' || normalized === 'running';
}

function isGitHubIngestionSucceeded(status?: GitHubOperationStatus | null) {
  return normalizedStatus(status?.status) === 'succeeded';
}

function isGitHubIngestionFailed(status?: GitHubOperationStatus | null) {
  return normalizedStatus(status?.status) === 'failed';
}

function statusMessage(status: GitHubOperationStatus, fallback: string) {
  return status.error || status.statusMessage || fallback;
}

function isMissingStatus(error: unknown) {
  return error instanceof ApiError && error.status === 404;
}

function OperationStatus({
  title,
  status,
  active,
  failed,
}: {
  title: string;
  status: GitHubOperationStatus;
  active: boolean;
  failed: boolean;
}) {
  const progress = Math.max(0, Math.min(100, status.progressPercent ?? 0));
  const color = failed ? '#dc2626' : active ? 'var(--primary)' : '#16a34a';
  const background = failed ? '#fef2f2' : active ? 'var(--secondary)' : '#f0fdf4';
  const borderColor = failed ? '#fecaca' : active ? 'var(--border)' : '#bbf7d0';

  return (
    <div className="rounded-md border px-3 py-3 text-xs" style={{ background, borderColor }}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {active ? <RefreshCw size={14} className="animate-spin" /> : failed ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
          <span className="text-[var(--foreground)]">{title}</span>
        </div>
        <span style={{ color }}>{status.status}</span>
      </div>
      <p className="mt-1.5 text-[var(--muted-foreground)]">
        {statusMessage(status, active ? 'Synchronization is running.' : 'Synchronization status updated.')}
      </p>
      {(active || progress > 0) && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--muted)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: color }} />
        </div>
      )}
    </div>
  );
}

function ConnectRepositoryDialog({
  projectId,
  onClose,
  onConnected,
}: {
  projectId: string;
  onClose: () => void;
  onConnected: (connection: GitHubConnection) => void;
}) {
  // Modal for collecting repository details and a one-time access token.
  const [repositoryOwner, setRepositoryOwner] = useState('');
  const [repositoryName, setRepositoryName] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const connection = await connectGitHubRepository(projectId, {
        repositoryOwner: repositoryOwner.trim(),
        repositoryName: repositoryName.trim(),
        accessToken,
      });
      setAccessToken('');
      onConnected(connection);
      onClose();
    } catch (requestError) {
      setAccessToken('');
      setError(githubError(requestError, 'Unable to connect this repository.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md overflow-hidden rounded-lg border shadow-2xl"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}>
          <Github size={18} />
          <div>
            <h2 className="text-sm text-[var(--foreground)]">Connect GitHub Repository</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Credentials are sent once to QuanTask.</p>
          </div>
          <button type="button" onClick={onClose} className="ml-auto p-1 text-[var(--muted-foreground)]" title="Close">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-4 p-5">
          {error && (
            <div className="flex gap-2 rounded-md border px-3 py-2 text-xs text-red-700" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}
          <label className="block">
            <span className="mb-1.5 block text-xs text-[var(--muted-foreground)]">Repository owner</span>
            <input
              required
              autoFocus
              value={repositoryOwner}
              onChange={(event) => setRepositoryOwner(event.target.value)}
              placeholder="owner-name"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none"
              style={{ background: 'var(--input-background)', borderColor: 'var(--border)' }}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs text-[var(--muted-foreground)]">Repository name</span>
            <input
              required
              value={repositoryName}
              onChange={(event) => setRepositoryName(event.target.value)}
              placeholder="repository-name"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none"
              style={{ background: 'var(--input-background)', borderColor: 'var(--border)' }}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
              <KeyRound size={12} />
              GitHub access token
            </span>
            <input
              required
              type="password"
              autoComplete="off"
              value={accessToken}
              onChange={(event) => setAccessToken(event.target.value)}
              placeholder="github_pat_..."
              className="w-full rounded-md border px-3 py-2 text-sm outline-none"
              style={{ background: 'var(--input-background)', borderColor: 'var(--border)' }}
            />
          </label>
          <p className="flex items-start gap-2 text-xs leading-relaxed text-[var(--muted-foreground)]">
            <ShieldCheck size={14} className="mt-0.5 flex-shrink-0 text-emerald-600" />
            The token is never stored in this browser or shown again after submission.
          </p>
        </div>
        <div className="flex justify-end gap-2 border-t px-5 py-4" style={{ borderColor: 'var(--border)' }}>
          <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-xs text-[var(--muted-foreground)]">
            Cancel
          </button>
          <button
            disabled={submitting}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-xs text-white disabled:opacity-50"
          >
            {submitting ? 'Connecting...' : 'Connect Repository'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function GitHubIntegrationSection({ projectId }: GitHubIntegrationSectionProps) {
  // Project settings section for connecting GitHub and showing synced development analytics.
  const canManage = canManageProject(projectId);
  const [analytics, setAnalytics] = useState<GitHubAnalytics | null>(null);
  const [connection, setConnection] = useState<GitHubConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<GitHubOperationStatus | null>(null);
  const [ingestionStatus, setIngestionStatus] = useState<GitHubOperationStatus | null>(null);
  const [showConnect, setShowConnect] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const syncTimer = useRef<number | null>(null);
  const ingestionTimer = useRef<number | null>(null);

  const clearSyncTimer = useCallback(() => {
    if (syncTimer.current !== null) {
      window.clearTimeout(syncTimer.current);
      syncTimer.current = null;
    }
  }, []);

  const clearIngestionTimer = useCallback(() => {
    if (ingestionTimer.current !== null) {
      window.clearTimeout(ingestionTimer.current);
      ingestionTimer.current = null;
    }
  }, []);

  // Loads the latest analytics snapshot; 404 simply means the project is not connected yet.
  const loadAnalytics = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const result = await getGitHubAnalytics(projectId);
      setAnalytics(result);
    } catch (requestError) {
      if (!(requestError instanceof ApiError && requestError.status === 404)) {
        setError(githubError(requestError, 'Unable to load GitHub analytics.'));
      }
      setAnalytics(null);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [projectId]);

  const pollSyncStatus = useCallback(async (announceSuccess = false) => {
    clearSyncTimer();
    try {
      const status = await getGitHubSyncStatus(projectId);
      setSyncStatus(status);

      if (isGitHubSyncRunning(status)) {
        setSyncing(true);
        syncTimer.current = window.setTimeout(() => {
          void pollSyncStatus(announceSuccess);
        }, 3000);
        return;
      }

      setSyncing(false);
      if (isGitHubSyncSucceeded(status)) {
        if (announceSuccess) setMessage('GitHub analytics synced successfully.');
        await loadAnalytics(false);
        return;
      }

      if (isGitHubSyncFailed(status)) {
        const invalidPat = normalizedStatus(status.status).includes('invalid');
        setError(invalidPat
          ? 'GitHub token is invalid. Ask a project manager to reconnect GitHub with a valid token.'
          : statusMessage(status, 'GitHub synchronization failed.'));
      }
    } catch (requestError) {
      if (isMissingStatus(requestError) && announceSuccess) {
        setSyncing(true);
        syncTimer.current = window.setTimeout(() => {
          void pollSyncStatus(announceSuccess);
        }, 3000);
        return;
      }

      setSyncing(false);
      if (!isMissingStatus(requestError)) setError(githubError(requestError, 'Unable to read GitHub sync status.'));
    }
  }, [clearSyncTimer, loadAnalytics, projectId]);

  const pollIngestionStatus = useCallback(async (announceSuccess = false) => {
    clearIngestionTimer();
    try {
      const status = await getGitHubIngestionStatus(projectId);
      setIngestionStatus(status);

      if (isGitHubIngestionRunning(status)) {
        setIngesting(true);
        ingestionTimer.current = window.setTimeout(() => {
          void pollIngestionStatus(announceSuccess);
        }, 3000);
        return;
      }

      setIngesting(false);
      if (isGitHubIngestionSucceeded(status)) {
        if (announceSuccess) setMessage('Repository data is ready. You can sync analytics now.');
        return;
      }

      if (isGitHubIngestionFailed(status)) {
        setError(statusMessage(status, 'Repository ingestion failed.'));
      }
    } catch (requestError) {
      if (isMissingStatus(requestError) && announceSuccess) {
        setIngesting(true);
        ingestionTimer.current = window.setTimeout(() => {
          void pollIngestionStatus(announceSuccess);
        }, 3000);
        return;
      }

      setIngesting(false);
      if (!isMissingStatus(requestError)) setError(githubError(requestError, 'Unable to read GitHub ingestion status.'));
    }
  }, [clearIngestionTimer, projectId]);

  useEffect(() => {
    clearSyncTimer();
    clearIngestionTimer();
    setConnection(null);
    setMessage('');
    setError('');
    setSyncStatus(null);
    setIngestionStatus(null);
    setSyncing(false);
    setIngesting(false);
    void loadAnalytics();
    void pollSyncStatus(false);
    void pollIngestionStatus(false);

    return () => {
      clearSyncTimer();
      clearIngestionTimer();
    };
  }, [clearIngestionTimer, clearSyncTimer, loadAnalytics, pollIngestionStatus, pollSyncStatus, projectId]);

  // Explicit sync asks the backend to refresh GitHub metrics for this project.
  const sync = async () => {
    clearSyncTimer();
    setSyncing(true);
    setMessage('');
    setError('');
    try {
      const status = await syncGitHubAnalytics(projectId);
      if (status) setSyncStatus(status);
      setMessage('GitHub synchronization started.');
      await pollSyncStatus(true);
    } catch (requestError) {
      setSyncing(false);
      setError(githubError(requestError, 'Unable to sync GitHub analytics.'));
    }
  };

  const repositoryName = analytics?.repositoryFullName || connection?.repositoryFullName;
  const defaultBranch = analytics?.defaultBranch || connection?.defaultBranch;
  const lastSync = analytics?.syncedAt || connection?.lastSyncedAt;
  const syncDisabled = syncing || ingesting;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base text-[var(--foreground)]">GitHub Integration</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Connect source activity to project analytics and PDF reports.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowConnect(true)}
            className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs text-[var(--foreground)]"
            style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
          >
            <Github size={14} />
            {repositoryName ? 'Update Repository' : 'Connect Repository'}
          </button>
        )}
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs text-emerald-700" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <CheckCircle2 size={14} />
          {message}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs text-red-700" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
          <AlertCircle size={14} />
          {error}
        </div>
      )}
      {ingestionStatus && (ingesting || isGitHubIngestionFailed(ingestionStatus)) && (
        <OperationStatus
          title="Repository ingestion"
          status={ingestionStatus}
          active={ingesting}
          failed={isGitHubIngestionFailed(ingestionStatus)}
        />
      )}
      {syncStatus && (syncing || isGitHubSyncFailed(syncStatus)) && (
        <OperationStatus
          title="GitHub synchronization"
          status={syncStatus}
          active={syncing}
          failed={isGitHubSyncFailed(syncStatus)}
        />
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-[var(--muted-foreground)]">
          <RefreshCw size={15} className="animate-spin" />
          Loading GitHub analytics...
        </div>
      ) : repositoryName ? (
        <>
          <div className="grid gap-4 border-y py-4 sm:grid-cols-3" style={{ borderColor: 'var(--border)' }}>
            <div>
              <p className="text-[10px] uppercase text-[var(--muted-foreground)]">Repository</p>
              <a
                href={analytics?.repositoryHtmlUrl || connection?.repositoryHtmlUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 flex items-center gap-1 text-sm text-[var(--primary)]"
              >
                {repositoryName}
                <ExternalLink size={12} />
              </a>
            </div>
            <div>
              <p className="text-[10px] uppercase text-[var(--muted-foreground)]">Default branch</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm"><GitBranch size={13} />{defaultBranch || 'Not available'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-[var(--muted-foreground)]">Last synced</p>
              <p className="mt-1 text-sm">{formatDate(lastSync)}</p>
            </div>
          </div>

          {analytics ? (
            <>
              {analytics.dataLimitWarning && (
                <div className="rounded-md border px-3 py-2 text-xs text-amber-800" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
                  {analytics.dataLimitWarning}
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ['Total commits', analytics.totalCommits],
                  ['Pull requests', analytics.totalPullRequests],
                  ['Merged PRs', analytics.mergedPullRequests],
                  ['Open PRs', analytics.openPullRequests],
                  ['Closed PRs', analytics.closedPullRequests],
                  ['Open issues', analytics.openIssues],
                  ['Closed issues', analytics.closedIssues],
                  ['Bus factor risk', analytics.busFactorRisk],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border p-3" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
                    <p className="text-[10px] uppercase text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-1 text-lg text-[var(--foreground)]">{value}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="text-sm">Top contributor</h3>
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    {analytics.topContributor || 'No contributor data'}
                    {analytics.topContributor ? ` · ${analytics.topContributorCommitPercentage}% of commits` : ''}
                  </p>
                </div>
                <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="text-sm">Top languages</h3>
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    {analytics.languages.slice(0, 4).map((item) => `${item.language} ${item.percentage}%`).join(' · ') || 'No language data'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-md border border-dashed px-4 py-6 text-center">
              <p className="text-sm text-[var(--foreground)]">GitHub analytics are not available yet.</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Sync the repository to fetch the latest data.</p>
            </div>
          )}

          {canManage && (
            <button
              disabled={syncDisabled}
              onClick={sync}
              className="flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-xs text-white disabled:opacity-50"
            >
              <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing GitHub data...' : ingesting ? 'Preparing repository...' : 'Sync GitHub Analytics'}
            </button>
          )}
        </>
      ) : (
        <div className="rounded-md border border-dashed px-5 py-8 text-center" style={{ borderColor: 'var(--border)' }}>
          <Github size={24} className="mx-auto mb-3 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--foreground)]">No GitHub analytics are available for this project.</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-[var(--muted-foreground)]">
            {canManage
              ? 'Connect a repository, or sync an existing connection, to include development analytics in reports.'
              : 'A project manager can connect and sync the repository. Project members can view the resulting analytics here.'}
          </p>
          {canManage && (
            <div className="mt-4 flex justify-center gap-2">
              <button onClick={() => setShowConnect(true)} className="rounded-md border px-3 py-2 text-xs" style={{ borderColor: 'var(--border)' }}>
                Connect Repository
              </button>
              <button disabled={syncDisabled} onClick={sync} className="rounded-md bg-[var(--primary)] px-3 py-2 text-xs text-white disabled:opacity-50">
                {syncing ? 'Syncing...' : ingesting ? 'Preparing...' : 'Try Sync'}
              </button>
            </div>
          )}
        </div>
      )}

      {showConnect && (
        <ConnectRepositoryDialog
          projectId={projectId}
          onClose={() => setShowConnect(false)}
          onConnected={(result) => {
            setConnection(result);
            setAnalytics(null);
            setMessage('GitHub repository connected. Preparing repository data...');
            setError('');
            void pollIngestionStatus(true);
          }}
        />
      )}
    </div>
  );
}
