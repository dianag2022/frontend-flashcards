let tokenGetter: (() => string | null) | null = null;
let tokenRefresher: (() => Promise<string | null>) | null = null;
let refreshInFlight: Promise<string | null> | null = null;

export function configureAuthToken(config: {
  getToken: () => string | null;
  refresh: () => Promise<string | null>;
}) {
  tokenGetter = config.getToken;
  tokenRefresher = config.refresh;
}

export async function refreshAuthToken(): Promise<string | null> {
  if (!tokenRefresher) return null;

  if (!refreshInFlight) {
    refreshInFlight = tokenRefresher().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}
