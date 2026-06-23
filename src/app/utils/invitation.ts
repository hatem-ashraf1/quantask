import { stripAppBasePath } from '../authorization/navigation';

const PENDING_INVITATION_TOKEN_KEY = 'quantask_pending_invitation_token';
const INVITATION_ATTEMPT_KEY = 'quantask_invitation_attempt';

export type InvitationAttempt = {
  token: string;
  workspaceIds: string[];
  startedAt: number;
};

export function getInvitationTokenFromUrl() {
  if (stripAppBasePath(window.location.pathname) !== '/accept-invitation') return '';
  return new URLSearchParams(window.location.search).get('token')?.trim() || '';
}

export function getPendingInvitationToken() {
  return sessionStorage.getItem(PENDING_INVITATION_TOKEN_KEY) || '';
}

export function storePendingInvitationToken(token: string) {
  if (token) {
    sessionStorage.setItem(PENDING_INVITATION_TOKEN_KEY, token);
  }
}

export function clearPendingInvitationToken() {
  sessionStorage.removeItem(PENDING_INVITATION_TOKEN_KEY);
  sessionStorage.removeItem(INVITATION_ATTEMPT_KEY);
}

export function getInvitationAttempt() {
  try {
    const attempt = JSON.parse(sessionStorage.getItem(INVITATION_ATTEMPT_KEY) || 'null') as InvitationAttempt | null;
    return attempt?.token ? attempt : null;
  } catch {
    return null;
  }
}

export function storeInvitationAttempt(attempt: InvitationAttempt) {
  sessionStorage.setItem(INVITATION_ATTEMPT_KEY, JSON.stringify(attempt));
}

export function clearInvitationAttempt() {
  sessionStorage.removeItem(INVITATION_ATTEMPT_KEY);
}
