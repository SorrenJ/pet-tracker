import { apiFetch } from './client';
import type { DistanceUnit } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  distanceUnit: DistanceUnit;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function register(email: string, password: string, name: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
}

export async function getMe(): Promise<AuthUser> {
  const res = await apiFetch<{ user: AuthUser }>('/auth/me');
  return res.user;
}

export async function updateMe(fields: { name?: string; distanceUnit?: DistanceUnit }): Promise<AuthUser> {
  const res = await apiFetch<{ user: AuthUser }>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
  return res.user;
}
