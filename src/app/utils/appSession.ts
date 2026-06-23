const APP_NAVIGATION_KEY = 'quantask_app_navigation';

export type AppNavigationSession = {
  workspaceId: string;
  projectId: string;
  view: string;
};

export function getAppNavigationSession(): AppNavigationSession | null {
  try {
    const session = JSON.parse(
      sessionStorage.getItem(APP_NAVIGATION_KEY) || 'null'
    ) as AppNavigationSession | null;

    if (!session?.workspaceId) return null;
    return session;
  } catch {
    sessionStorage.removeItem(APP_NAVIGATION_KEY);
    return null;
  }
}

export function saveAppNavigationSession(session: AppNavigationSession) {
  sessionStorage.setItem(APP_NAVIGATION_KEY, JSON.stringify(session));
}

export function clearAppNavigationSession() {
  sessionStorage.removeItem(APP_NAVIGATION_KEY);
}
