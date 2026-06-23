import { FormEvent, useEffect, useState } from 'react';
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
  GitHubAnalytics,
  GitHubConnection,
  syncGitHubAnalytics,
} from '../api/client';
import { canManageProject } from '../utils/permissions';

type GitHubIntegrationSectionProps = {
  projectId: string;
};

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

function ConnectRepositoryDialog({
  projectId,
  onClose,
  onConnected,
}: {
  projectId: string;
  onClose: () => void;
  onConnected: (connection: GitHubConnection) => void;
}) {
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
  const canManage = canManageProject(projectId);
  const [analytics, setAnalytics] = useState<GitHubAnalytics | null>(null);
  const [connection, setConnection] = useState<GitHubConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showConnect, setShowConnect] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getGitHubAnalytics(projectId);
      setAnalytics(result);
    } catch (requestError) {
      if (!(requestError instanceof ApiError && requestError.status === 404)) {
        setError(githubError(requestError, 'Unable to load GitHub analytics.'));
      }
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setConnection(null);
    setMessage('');
    void loadAnalytics();
  }, [projectId]);

  const sync = async () => {
    setSyncing(true);
    setMessage('');
    setError('');
    try {
      const result = await syncGitHubAnalytics(projectId);
      setAnalytics(result);
      setMessage('GitHub analytics synced successfully.');
    } catch (requestError) {
      setError(githubError(requestError, 'Unable to sync GitHub analytics.'));
    } finally {
      setSyncing(false);
    }
  };

  const repositoryName = analytics?.repositoryFullName || connection?.repositoryFullName;
  const defaultBranch = analytics?.defaultBranch || connection?.defaultBranch;
  const lastSync = analytics?.syncedAt || connection?.lastSyncedAt;

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
              disabled={syncing}
              onClick={sync}
              className="flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-xs text-white disabled:opacity-50"
            >
              <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing GitHub data...' : 'Sync GitHub Analytics'}
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
              <button disabled={syncing} onClick={sync} className="rounded-md bg-[var(--primary)] px-3 py-2 text-xs text-white disabled:opacity-50">
                {syncing ? 'Syncing...' : 'Try Sync'}
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
            setMessage('GitHub repository connected. Sync it to create the first analytics snapshot.');
            setError('');
          }}
        />
      )}
    </div>
  );
}
