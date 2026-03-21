import ky from 'ky';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

function getAccessToken(): string | null {
  return localStorage.getItem('sf_access_token');
}

function getRefreshToken(): string | null {
  return localStorage.getItem('sf_refresh_token');
}

function setAuthTokens(accessToken: string, refreshToken?: string): void {
  localStorage.setItem('sf_access_token', accessToken);
  if (refreshToken) {
    localStorage.setItem('sf_refresh_token', refreshToken);
  } else {
    localStorage.removeItem('sf_refresh_token');
  }
}

function clearAuth(): void {
  localStorage.removeItem('sf_access_token');
  localStorage.removeItem('sf_refresh_token');
  window.dispatchEvent(new CustomEvent('auth:signout'));
}

let isRefreshing = false;
let pendingRequests: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await ky.post(`${API_BASE_URL}/auth/refresh`, {
      json: { refreshToken },
    }).json<{ accessToken: string; refreshToken?: string }>();

    setAuthTokens(response.accessToken, response.refreshToken);
    return response.accessToken;
  } catch {
    clearAuth();
    window.location.href = '/signin';
    throw new Error('Session expired. Please sign in again.');
  }
}

async function getValidToken(): Promise<string | null> {
  const token = getAccessToken();
  if (!token) return null;

  if (isRefreshing) {
    return new Promise<string | null>((resolve, reject) => {
      pendingRequests.push({ resolve, reject });
    });
  }

  return token;
}

function onRefreshSuccess(token: string): void {
  isRefreshing = false;
  pendingRequests.forEach(({ resolve }) => resolve(token));
  pendingRequests = [];
}

function onRefreshFailure(): void {
  isRefreshing = false;
  pendingRequests.forEach(({ reject }) => reject(new Error('Token refresh failed')));
  pendingRequests = [];
}

export const api = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 30000,
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = await getValidToken();
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
        request.headers.set('Content-Type', 'application/json');
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        if (response.status === 401 && !request.url?.includes('/auth/')) {
          if (!isRefreshing) {
            isRefreshing = true;
            try {
              const newToken = await refreshAccessToken();
              onRefreshSuccess(newToken);
              // Retry the original request with the new token
              request.headers.set('Authorization', `Bearer ${newToken}`);
              return ky(request);
            } catch (err) {
              onRefreshFailure();
              return response;
            }
          } else {
            // Wait for the in-flight refresh to complete, then retry
            return new Promise<Response>((resolve, reject) => {
              pendingRequests.push({
                resolve: (token) => {
                  request.headers.set('Authorization', `Bearer ${token}`);
                  ky(request).then(resolve).catch(reject);
                },
                reject: (err) => {
                  reject(err);
                },
              });
            });
          }
        }
        return response;
      },
    ],
  },
});
