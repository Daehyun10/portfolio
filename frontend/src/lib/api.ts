import type { About, Project } from './types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    throw new ApiError(message ?? `요청에 실패했습니다 (${res.status})`, res.status);
  }
  return res.json() as Promise<T>;
}

/// 서버 컴포넌트용 조회. 백엔드가 꺼져 있어도 페이지가 죽지 않도록 폴백을 준다.
export async function getProjects(featuredOnly = false): Promise<Project[]> {
  try {
    return await request<Project[]>(`/projects${featuredOnly ? '?featured=true' : ''}`, {
      next: { revalidate: 60, tags: ['projects'] },
    } as RequestInit);
  } catch {
    return [];
  }
}

export async function getProject(slug: string): Promise<Project | null> {
  try {
    return await request<Project>(`/projects/${slug}`, {
      next: { revalidate: 60, tags: ['projects'] },
    } as RequestInit);
  } catch {
    return null;
  }
}

export async function getAbout(): Promise<About | null> {
  try {
    return await request<About>('/about', {
      next: { revalidate: 60, tags: ['about'] },
    } as RequestInit);
  } catch {
    return null;
  }
}

export { request, ApiError };
