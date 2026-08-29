'use client';

import { API_URL } from './api';
import type { Project } from './types';

const TOKEN_KEY = 'portfolio.token';

export const tokenStore = {
  get: () => (typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY)),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function authed<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const isFormData = init.body instanceof FormData;

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (res.status === 401) {
    tokenStore.clear();
    throw new Error('세션이 만료되었습니다. 다시 로그인해 주세요.');
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    throw new Error(message ?? `요청에 실패했습니다 (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');

  const data = (await res.json()) as { accessToken: string };
  tokenStore.set(data.accessToken);
  return data;
}

export const adminApi = {
  me: () => authed<{ id: string; email: string; name: string }>('/auth/me'),
  listProjects: () => authed<Project[]>('/projects/admin'),
  createProject: (body: unknown) =>
    authed<Project>('/projects', { method: 'POST', body: JSON.stringify(body) }),
  updateProject: (id: string, body: unknown) =>
    authed<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteProject: (id: string) => authed<{ id: string }>(`/projects/${id}`, { method: 'DELETE' }),
  updateSiteText: (entries: { key: string; value: string }[]) =>
    authed<Record<string, string>>('/site-text', {
      method: 'PUT',
      body: JSON.stringify({ entries }),
    }),
  updateAbout: (body: unknown) =>
    authed<unknown>('/about', { method: 'PUT', body: JSON.stringify(body) }),
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return authed<{ url: string }>('/upload/image', { method: 'POST', body: form });
  },
};
