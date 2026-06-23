import { ReactNode } from 'react';
import { useAuthorization } from './AuthorizationContext';
import { AuthorizationRole, ResourceTarget } from './types';

type HasAccessProps = {
  allowedRoles: AuthorizationRole[];
  targetResource: ResourceTarget;
  resourceId?: string;
  children: ReactNode;
  fallback?: ReactNode;
};

export function HasAccess({
  allowedRoles,
  targetResource,
  resourceId,
  children,
  fallback = null,
}: HasAccessProps) {
  const { hasRole } = useAuthorization();
  return hasRole(allowedRoles, targetResource, resourceId) ? children : fallback;
}
