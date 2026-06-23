export type ApiAuthorizationEvent =
  | { type: 'forbidden'; message: string }
  | { type: 'unauthorized'; message: string };

const API_AUTHORIZATION_EVENT = 'quantask:api-authorization';

export function emitApiAuthorizationEvent(detail: ApiAuthorizationEvent) {
  window.dispatchEvent(new CustomEvent<ApiAuthorizationEvent>(API_AUTHORIZATION_EVENT, { detail }));
}

export function subscribeApiAuthorizationEvents(listener: (event: ApiAuthorizationEvent) => void) {
  const handler = (event: Event) => listener((event as CustomEvent<ApiAuthorizationEvent>).detail);
  window.addEventListener(API_AUTHORIZATION_EVENT, handler);
  return () => window.removeEventListener(API_AUTHORIZATION_EVENT, handler);
}
