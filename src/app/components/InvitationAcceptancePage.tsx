import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, LoaderCircle, LogIn, RotateCcw } from 'lucide-react';
import { acceptInvitation, ApiError, fetchWorkspaces } from '../api/client';
import {
  clearInvitationAttempt,
  getInvitationAttempt,
  storeInvitationAttempt,
} from '../utils/invitation';

type InvitationState = 'loading' | 'success' | 'error';
type InvitationErrorKind = 'invalid' | 'expired' | 'accepted' | 'wrong-account' | 'unauthorized' | 'retryable';

interface InvitationAcceptancePageProps {
  token: string;
  onAccepted: (workspaceId?: string) => void;
  onAuthenticationRequired: () => void;
  onUseAnotherAccount: () => void;
}

const acceptanceRequests = new Map<string, Promise<string | undefined>>();

function classifyInvitationError(error: unknown): { kind: InvitationErrorKind; message: string } {
  const message = error instanceof Error ? error.message : '';
  const normalized = message.toLowerCase();

  if (normalized.includes('expired')) {
    return { kind: 'expired', message: 'This invitation has expired.' };
  }

  if (
    normalized.includes('already been accepted') ||
    normalized.includes('already accepted') ||
    normalized.includes('not in pending status')
  ) {
    return { kind: 'accepted', message: 'This invitation has already been accepted.' };
  }

  if (
    normalized.includes('does not match') ||
    normalized.includes('different email') ||
    normalized.includes('another account')
  ) {
    return {
      kind: 'wrong-account',
      message: 'This invitation was sent to another account.\nPlease sign in with the correct email.',
    };
  }

  if (error instanceof ApiError && error.status === 401) {
    return { kind: 'unauthorized', message: 'Please sign in to accept this invitation.' };
  }

  if (
    (error instanceof ApiError && error.status === 404) ||
    normalized.includes('not found') ||
    normalized.includes('invalid token') ||
    normalized.includes('invalid invitation')
  ) {
    return { kind: 'invalid', message: 'This invitation link is invalid.' };
  }

  return {
    kind: 'retryable',
    message: message || 'We could not accept this invitation. Please try again.',
  };
}

async function acceptAndFindWorkspace(token: string) {
  const previousAttempt = getInvitationAttempt();
  let beforeIds: Set<string>;

  if (
    previousAttempt?.token === token &&
    Date.now() - previousAttempt.startedAt < 30_000
  ) {
    beforeIds = new Set(previousAttempt.workspaceIds);
    await new Promise((resolve) => window.setTimeout(resolve, 1500));

    const current = await fetchWorkspaces();
    const joinedWorkspace = current.find((workspace) => !beforeIds.has(workspace.id));
    if (joinedWorkspace) {
      clearInvitationAttempt();
      return joinedWorkspace.id;
    }
  } else {
    const before = await fetchWorkspaces();
    beforeIds = new Set(before.map((workspace) => workspace.id));
  }

  storeInvitationAttempt({
    token,
    workspaceIds: Array.from(beforeIds),
    startedAt: Date.now(),
  });

  try {
    const acceptance = await acceptInvitation(token);

    const after = await fetchWorkspaces();
    const joinedWorkspace = after.find((workspace) => !beforeIds.has(workspace.id));
    clearInvitationAttempt();
    return (
      acceptance?.workspaceId ||
      acceptance?.WorkspaceId ||
      joinedWorkspace?.id ||
      (after.length === 1 ? after[0].id : undefined)
    );
  } catch (error) {
    clearInvitationAttempt();
    throw error;
  }
}

function getAcceptanceRequest(token: string) {
  const existing = acceptanceRequests.get(token);
  if (existing) return existing;

  const request = acceptAndFindWorkspace(token);
  acceptanceRequests.set(token, request);
  request.catch(() => acceptanceRequests.delete(token));
  return request;
}

export function InvitationAcceptancePage({
  token,
  onAccepted,
  onAuthenticationRequired,
  onUseAnotherAccount,
}: InvitationAcceptancePageProps) {
  const [state, setState] = useState<InvitationState>('loading');
  const [errorKind, setErrorKind] = useState<InvitationErrorKind>('retryable');
  const [message, setMessage] = useState('Accepting your workspace invitation...');
  const [attempt, setAttempt] = useState(0);
  const redirectTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    if (!token) {
      setState('error');
      setErrorKind('invalid');
      setMessage('This invitation link is invalid.');
      return;
    }

    setState('loading');
    setMessage('Accepting your workspace invitation...');

    getAcceptanceRequest(token)
      .then((workspaceId) => {
        if (!active) return;
        setState('success');
        setMessage('Invitation accepted successfully.');
        redirectTimerRef.current = window.setTimeout(() => onAccepted(workspaceId), 1200);
      })
      .catch((error) => {
        if (!active) return;
        const invitationError = classifyInvitationError(error);
        if (invitationError.kind === 'unauthorized') {
          onAuthenticationRequired();
          return;
        }
        setState('error');
        setErrorKind(invitationError.kind);
        setMessage(invitationError.message);
      });

    return () => {
      active = false;
      if (redirectTimerRef.current !== null) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, [attempt, onAccepted, onAuthenticationRequired, token]);

  const retry = () => {
    acceptanceRequests.delete(token);
    setAttempt((current) => current + 1);
  };

  const isWrongAccount = errorKind === 'wrong-account';
  const canRetry = errorKind === 'retryable';

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-10"
      style={{ background: 'var(--background)', fontFamily: 'var(--font-family-body)' }}
    >
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs"
            style={{ background: 'var(--primary)', fontFamily: 'var(--font-family-mono)' }}
          >
            QT
          </div>
          <span className="text-lg text-[var(--foreground)]">QuanTask</span>
        </div>

        <div
          className="border rounded-lg px-6 py-8 text-center"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          {state === 'loading' && (
            <>
              <LoaderCircle size={34} className="mx-auto mb-4 animate-spin text-[var(--primary)]" />
              <h1 className="text-lg text-[var(--foreground)] mb-2">Joining workspace</h1>
              <p className="text-sm text-[var(--muted-foreground)]">{message}</p>
            </>
          )}

          {state === 'success' && (
            <>
              <CheckCircle2 size={36} className="mx-auto mb-4 text-green-500" />
              <h1 className="text-lg text-[var(--foreground)] mb-2">You are in</h1>
              <p className="text-sm text-[var(--muted-foreground)]">{message}</p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">Opening your workspace...</p>
            </>
          )}

          {state === 'error' && (
            <>
              <AlertTriangle size={36} className="mx-auto mb-4 text-amber-500" />
              <h1 className="text-lg text-[var(--foreground)] mb-2">Invitation could not be accepted</h1>
              <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-line">{message}</p>

              <div className="mt-6 flex justify-center">
                {canRetry && (
                  <button
                    type="button"
                    onClick={retry}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white"
                    style={{ background: 'var(--primary)' }}
                  >
                    <RotateCcw size={14} />
                    Retry
                  </button>
                )}

                {isWrongAccount && (
                  <button
                    type="button"
                    onClick={onUseAnotherAccount}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white"
                    style={{ background: 'var(--primary)' }}
                  >
                    <LogIn size={14} />
                    Sign in with another account
                  </button>
                )}

                {!canRetry && !isWrongAccount && (
                  <button
                    type="button"
                    onClick={() => onAccepted()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border"
                    style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  >
                    Continue
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
