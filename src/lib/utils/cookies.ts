/**
 * Reads the XSRF-TOKEN cookie set by Spring Security.
 * This cookie is intentionally NOT HttpOnly so frontend clients can read and include it in request headers.
 */
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
