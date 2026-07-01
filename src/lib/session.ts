export interface SessionUser {
  uid: string;
  email: string;
  role: "admin" | "end-user" | null;
}

export interface SessionPayload {
  idToken: string;
  refreshToken: string;
  user: SessionUser;
}

/** Returns true if the JWT expires within `bufferSeconds` (default 5 min). */
export function isTokenExpiringSoon(
  idToken: string,
  bufferSeconds = 300,
): boolean {
  try {
    const segment = idToken.split(".")[1];
    if (!segment) return true;
    const payload = JSON.parse(
      atob(segment.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp?: number };
    if (!payload.exp) return true;
    return payload.exp * 1000 < Date.now() + bufferSeconds * 1000;
  } catch {
    return true;
  }
}

export function isAuthTokenError(message: string): boolean {
  return /invalid or expired|id token|token expired|unauthorized/i.test(message);
}
