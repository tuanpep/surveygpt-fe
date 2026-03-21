import { api } from './api';
import type { AuthTokens, SignInInput, SignUpInput, ForgotPasswordInput, User } from '@/types/api';

export async function signIn(input: SignInInput): Promise<AuthTokens> {
  const tokens = await api.post('auth/signin', { json: input }).json<AuthTokens>();
  localStorage.setItem('sf_access_token', tokens.accessToken);
  if (tokens.refreshToken) {
    localStorage.setItem('sf_refresh_token', tokens.refreshToken);
  }
  return tokens;
}

export async function signUp(input: SignUpInput): Promise<AuthTokens> {
  const tokens = await api.post('auth/signup', { json: input }).json<AuthTokens>();
  localStorage.setItem('sf_access_token', tokens.accessToken);
  if (tokens.refreshToken) {
    localStorage.setItem('sf_refresh_token', tokens.refreshToken);
  }
  return tokens;
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<void> {
  await api.post('auth/forgot-password', { json: input });
}

export async function getMe(): Promise<User> {
  return api.get('auth/me').json<User>();
}

export function signOut(): void {
  localStorage.removeItem('sf_access_token');
  localStorage.removeItem('sf_refresh_token');
  window.dispatchEvent(new CustomEvent('auth:signout'));
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('sf_access_token');
}
