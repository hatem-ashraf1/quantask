import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Download,
  FileClock,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  ApiError,
  createWorkspaceReport,
  downloadReport,
  getGitHubAnalytics,
  getMyReports,
  getReportStatus,
  ReportJob,
} from '../api/client';
import { PROJECTS, WORKSPACE } from '../data/store';
import { canViewProject } from '../utils/permissions';

const POLL_INTERVAL_MS = 4000;
const MAX_POLL_DURATION_MS = 3 * 60 * 1000;

function formatDate(value?: string) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function reportError(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.status === 403) return 'You do not have permission to perform this action.';
    if (error.status === 404) return 'Report not found.';
    if (error.status === 410) return 'This report has expired.';
    if (error.status === 409) return 'This report is not ready yet.';
  }
  return error instanceof Error ? error.message : fallback;
}

function statusStyle(status: ReportJob['status']) {
  if (status === 'Completed') return { background: '#dcfce7', color: '#15803d' };
  if (status === 'Failed') return { background: '#fee2e2', color: '#b91c1c' };
  if (status === 'Expired') return { background: '#f3f4f6', color: '#4b5563' };
  return { background: '#e0f2fe', color: '#0369a1' };
}

function GenerateReportDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (job: ReportJob) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [projectId, setProjectId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(today);
  const [includeGitHub, setIncludeGitHub] = useState(false);
  const [githubAvailable, setGitHubAvailable] = useState(false);
  const [checkingGitHub, setCheckingGitHub] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const accessibleProjects = PROJECTS.filter(
    (project) => canViewProject(project.id)
  );

  useEffect(() => {
    let active = true;
    setIncludeGitHub(false);
    setGitHubAvailable(false);
    if (!projectId) {
      setCheckingGitHub(false);
      return;
    }

    setCheckingGitHub(true);
    getGitHubAnalytics(projectId)
      .then(() => {
        if (active) setGitHubAvailable(true);
      })
      .catch(() => {
        if (active) setGitHubAvailable(false);
      })
      .finally(() => {
        if (active) setCheckingGitHub(false);
      });

    return () => {
      active = false;
    };
  }, [projectId]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (fromDate && toDate && fromDate > toDate) {
      setError('From date must be before or equal to the to date.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const job = await createWorkspaceReport(WORKSPACE.id, {
        projectId: projectId || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        includeGitHub,
      });
      onCreated(job);
      onClose();
    } catch (requestError) {
      setError(reportError(requestError, 'Unable to generate this report.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-lg overflow-hidden rounded-lg border shadow-2xl"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}>
          <FileText size={18} />
          <div>
            <h2 className="text-sm">Generate PDF Report</h2>
            <p className="text-xs text-[var(--muted-foreground)]">The report will be prepared in the background.</p>
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
            <span className="mb-1.5 block text-xs text-[var(--muted-foreground)]">Report scope</span>
            <select
              value={projectId}
              onChange={(event) => {
                setProjectId(event.target.value);
                if (!event.target.value) setIncludeGitHub(false);
              }}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none"
              style={{ background: 'var(--input-background)', borderColor: 'var(--border)' }}
            >
              <option value="">Entire workspace</option>
              {accessibleProjects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-xs text-[var(--muted-foreground)]">From date</span>
              <input
                type="date"
                max={today}
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none"
                style={{ background: 'var(--input-background)', borderColor: 'var(--border)' }}
              />
            </label>
            <label>
              <span className="mb-1.5 block text-xs text-[var(--muted-foreground)]">To date</span>
              <input
                type="date"
                max={today}
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none"
                style={{ background: 'var(--input-background)', borderColor: 'var(--border)' }}
              />
            </label>
          </div>
          <label className={`flex items-start gap-3 rounded-md border p-3 ${!projectId ? 'opacity-60' : ''}`} style={{ borderColor: 'var(--border)' }}>
            <input
              type="checkbox"
              disabled={!projectId || !githubAvailable || checkingGitHub}
              checked={includeGitHub}
              onChange={(event) => setIncludeGitHub(event.target.checked)}
              className="mt-0.5"
            />
            <span>
              <span className="block text-xs text-[var(--foreground)]">Include GitHub analytics</span>
              <span className="mt-0.5 block text-[10px] text-[var(--muted-foreground)]">
                {!projectId
                  ? 'Choose a project to include its GitHub analytics.'
                  : checkingGitHub
                    ? 'Checking for a synced GitHub analytics snapshot...'
                    : githubAvailable
                      ? 'Uses the latest synced analytics snapshot for the selected project.'
                      : 'Connect and sync a GitHub repository first to include GitHub analytics.'}
              </span>
            </span>
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t px-5 py-4" style={{ borderColor: 'var(--border)' }}>
          <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-xs text-[var(--muted-foreground)]">Cancel</button>
          <button disabled={submitting} className="flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-xs text-white disabled:opacity-50">
            {submitting && <Loader2 size={13} className="animate-spin" />}
            {submitting ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function ReportsView() {
  const [reports, setReports] = useState<ReportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [downloadingId, setDownloadingId] = useState('');
  const pollingStartedAt = useRef<number | null>(null);
  const pollingTimedOut = useRef(false);

  const activeReports = useMemo(
    () => reports.filter((report) => report.status === 'Pending' || report.status === 'Processing'),
    [reports]
  );

  const loadReports = async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      setReports(await getMyReports());
    } catch (requestError) {
      setError(reportError(requestError, 'Unable to load reports.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadReports();
  }, []);

  useEffect(() => {
    if (activeReports.length === 0) {
      pollingStartedAt.current = null;
      pollingTimedOut.current = false;
      return;
    }

    pollingStartedAt.current ??= Date.now();
    if (Date.now() - pollingStartedAt.current >= MAX_POLL_DURATION_MS) {
      if (!pollingTimedOut.current) {
        setMessage('The report is still being generated. You can check it later from this page.');
        pollingTimedOut.current = true;
      }
      return;
    }

    const timer = window.setInterval(async () => {
      if (pollingStartedAt.current && Date.now() - pollingStartedAt.current >= MAX_POLL_DURATION_MS) {
        window.clearInterval(timer);
        if (!pollingTimedOut.current) {
          setMessage('The report is still being generated. You can check it later from this page.');
          pollingTimedOut.current = true;
        }
        return;
      }

      const updates = await Promise.all(
        activeReports.map((report) => getReportStatus(report.jobId).catch(() => report))
      );
      setReports((current) => current.map((report) => updates.find((item) => item.jobId === report.jobId) || report));
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [activeReports.map((report) => `${report.jobId}:${report.status}`).join('|')]);

  const startDownload = async (report: ReportJob) => {
    setDownloadingId(report.jobId);
    setError('');
    try {
      await downloadReport(report.jobId, report.reportName);
    } catch (requestError) {
      setError(reportError(requestError, 'Unable to download this report.'));
    } finally {
      setDownloadingId('');
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6" style={{ background: 'var(--background)' }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-lg text-[var(--foreground)]">Analytics Reports</h1>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Generate, track, and download workspace and project performance reports.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => void loadReports(true)}
              disabled={refreshing}
              title="Refresh reports"
              className="flex h-9 w-9 items-center justify-center rounded-md border text-[var(--muted-foreground)] disabled:opacity-50"
              style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setShowGenerate(true)}
              className="flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-xs text-white"
            >
              <Plus size={14} />
              Generate PDF Report
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-4 flex items-center gap-2 rounded-md border px-3 py-2 text-xs text-blue-700" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
            <FileClock size={14} />
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md border px-3 py-2 text-xs text-red-700" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-[var(--muted-foreground)]">
            <Loader2 size={16} className="animate-spin" />
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-md border border-dashed px-6 py-16 text-center" style={{ borderColor: 'var(--border)' }}>
            <FileText size={28} className="mx-auto mb-3 text-[var(--muted-foreground)]" />
            <h2 className="text-sm text-[var(--foreground)]">No reports generated yet.</h2>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Generate your first analytics report to track project progress.</p>
            <button onClick={() => setShowGenerate(true)} className="mt-4 rounded-md bg-[var(--primary)] px-4 py-2 text-xs text-white">
              Generate Report
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
            <div className="min-w-[850px]">
              <div className="grid grid-cols-[minmax(220px,1fr)_110px_170px_170px_130px] gap-3 border-b px-4 py-3 text-[10px] uppercase text-[var(--muted-foreground)]" style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}>
                <span>Report name</span>
                <span>Status</span>
                <span>Created</span>
                <span>Completed</span>
                <span>Action</span>
              </div>
              {reports.map((report) => {
                const isActive = report.status === 'Pending' || report.status === 'Processing';
                return (
                  <div key={report.jobId} className="grid grid-cols-[minmax(220px,1fr)_110px_170px_170px_130px] items-center gap-3 border-b px-4 py-4 last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-[var(--foreground)]">{report.reportName}</p>
                      {report.errorMessage && <p className="mt-1 truncate text-[10px] text-red-600" title={report.errorMessage}>{report.errorMessage}</p>}
                    </div>
                    <span className="w-fit rounded-full px-2 py-1 text-[10px]" style={statusStyle(report.status)}>
                      {report.status}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">{formatDate(report.createdAt)}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">{formatDate(report.completedAt)}</span>
                    <div>
                      {report.status === 'Completed' ? (
                        <button
                          disabled={downloadingId === report.jobId}
                          onClick={() => void startDownload(report)}
                          className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs text-[var(--foreground)] disabled:opacity-50"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          {downloadingId === report.jobId ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                          {downloadingId === report.jobId ? 'Downloading' : 'Download'}
                        </button>
                      ) : isActive ? (
                        <span className="flex items-center gap-1.5 text-xs text-blue-700">
                          <Loader2 size={12} className="animate-spin" />
                          Generating
                        </span>
                      ) : report.status === 'Failed' ? (
                        <span className="flex items-center gap-1.5 text-xs text-red-600"><AlertCircle size={12} />View error</span>
                      ) : (
                        <button onClick={() => setShowGenerate(true)} className="text-xs text-[var(--primary)]">Generate again</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showGenerate && (
        <GenerateReportDialog
          onClose={() => setShowGenerate(false)}
          onCreated={(job) => {
            setReports((current) => [job, ...current.filter((item) => item.jobId !== job.jobId)]);
            setMessage('Report generation started. You can continue using QuanTask while it is prepared.');
            pollingStartedAt.current = Date.now();
            pollingTimedOut.current = false;
          }}
        />
      )}
    </div>
  );
}
