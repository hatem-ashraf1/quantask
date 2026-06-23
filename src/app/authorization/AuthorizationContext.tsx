import { createContext, ReactNode, useContext, useMemo, useSyncExternalStore } from 'react';
import {
  canAccess,
  getAuthorizationState,
  getRolesForResource,
  hasAccessToRoles,
  subscribeAuthorization,
} from './store';
import {
  AuthorizationRole,
  AuthorizationState,
  Permission,
  PermissionOptions,
  ResourceTarget,
} from './types';

type AuthorizationContextValue = AuthorizationState & {
  can: (permission: Permission, options?: PermissionOptions) => boolean;
  hasRole: (allowedRoles: AuthorizationRole[], target: ResourceTarget, resourceId?: string) => boolean;
  rolesFor: (target: ResourceTarget, resourceId?: string) => AuthorizationRole[];
};

const AuthorizationContext = createContext<AuthorizationContextValue | null>(null);

export function AuthorizationProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeAuthorization,
    getAuthorizationState,
    getAuthorizationState
  );

  const value = useMemo<AuthorizationContextValue>(() => ({
    ...snapshot,
    can: (permission, options) => canAccess(permission, options, snapshot),
    hasRole: (allowedRoles, target, resourceId) =>
      hasAccessToRoles(allowedRoles, target, resourceId, snapshot),
    rolesFor: (target, resourceId) => getRolesForResource(target, resourceId, snapshot),
  }), [snapshot]);

  return (
    <AuthorizationContext.Provider value={value}>
      {children}
    </AuthorizationContext.Provider>
  );
}

export function useAuthorization() {
  const context = useContext(AuthorizationContext);
  if (!context) throw new Error('useAuthorization must be used inside AuthorizationProvider.');
  return context;
}
