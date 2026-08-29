'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi, login, tokenStore } from '@/lib/admin-client';
import type { Project } from '@/lib/types';

interface FormState {
  id: string | null;
  slug: string;
  title: string;
  summary: string;
  description: string;
  period: string;
  role: string;
  stack: string;
  thumbnail: string;
  githubUrl: string;
  liveUrl: string;
  featured: boolean;
  published: boolean;
}

const EMPTY_FORM: FormState = {
  id: null,
  slug: '',
  title: '',
  summary: '',
  description: '',
  period: '',
  role: '',
  stack: '',
  thumbnail: '',
  githubUrl: '',
  liveUrl: '',
  featured: false,
  published: true,
};

const inputClass =
  'w-full border border-line bg-bg px-2.5 py-1.5 text-sm outline-none transition-colors duration-150 placeholder:text-muted hover:border-muted focus:border-accent';

const primaryClass =
  'bg-fg px-4 py-1.5 text-sm text-bg transition-colors duration-150 hover:bg-accent disabled:opacity-45';

const secondaryClass =
  'border border-line px-4 py-1.5 text-sm text-muted transition-colors duration-150 hover:border-fg hover:text-fg';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setProjects(await adminApi.listProjects());
      setAuthenticated(true);
    } catch (e) {
      setAuthenticated(false);
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    // 저장된 토큰이 아직 유효한지 목록 조회로 확인한다.
    if (tokenStore.get()) void refresh();
  }, [refresh]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError(null);
    setBusy(true);
    try {
      await login(String(data.get('email')), String(data.get('password')));
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const { id, stack, ...rest } = form;
    const payload = {
      ...rest,
      stack: stack
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      // 빈 문자열은 생략해서 보내야 서버의 문자열 검증에 걸리지 않는다.
      period: rest.period || undefined,
      role: rest.role || undefined,
      thumbnail: rest.thumbnail || undefined,
      githubUrl: rest.githubUrl || undefined,
      liveUrl: rest.liveUrl || undefined,
    };

    try {
      if (id) await adminApi.updateProject(id, payload);
      else await adminApi.createProject(payload);
      setForm(EMPTY_FORM);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleUpload(file: File) {
    setBusy(true);
    try {
      const { url } = await adminApi.uploadImage(file);
      setForm((prev) => ({ ...prev, thumbnail: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(project: Project) {
    if (!confirm(`"${project.title}" 프로젝트를 삭제할까요?`)) return;
    setBusy(true);
    try {
      await adminApi.deleteProject(project.id);
      if (form.id === project.id) setForm(EMPTY_FORM);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  function edit(project: Project) {
    setForm({
      id: project.id,
      slug: project.slug,
      title: project.title,
      summary: project.summary,
      description: project.description,
      period: project.period ?? '',
      role: project.role ?? '',
      stack: project.stack.join(', '),
      thumbnail: project.thumbnail ?? '',
      githubUrl: project.githubUrl ?? '',
      liveUrl: project.liveUrl ?? '',
      featured: project.featured,
      published: project.published,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!authenticated) {
    return (
      <main className="mx-auto max-w-3xl px-6 pt-32">
        <p className="text-xs tracking-[0.2em] text-muted">ADMIN</p>
        <h1 className="display mt-4 text-2xl">관리자 로그인</h1>

        <form onSubmit={handleLogin} className="mt-8 max-w-xs space-y-3">
          <input name="email" type="email" required placeholder="이메일" className={inputClass} />
          <input
            name="password"
            type="password"
            required
            placeholder="비밀번호"
            className={inputClass}
          />
          {error && <p className="text-sm text-accent">{error}</p>}
          <button type="submit" disabled={busy} className={primaryClass}>
            {busy ? '확인 중...' : '로그인'}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 pb-40 pt-24">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs tracking-[0.2em] text-muted">ADMIN</p>
          <h1 className="display mt-4 text-2xl">프로젝트 관리</h1>
        </div>
        <button
          onClick={() => {
            tokenStore.clear();
            setAuthenticated(false);
          }}
          className="text-sm text-muted transition-colors duration-150 hover:text-fg"
        >
          로그아웃
        </button>
      </div>

      {error && <p className="mt-6 text-sm text-accent">{error}</p>}

      <form onSubmit={handleSave} className="mt-10 space-y-3 border-t border-line pt-7">
        <h2 className="text-xs tracking-[0.2em] text-muted">
          {form.id ? '프로젝트 수정' : '새 프로젝트'}
        </h2>

        <div className="grid gap-3 sm:grid-cols-[14rem_1fr]">
          <input
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="slug (예: my-project)"
            className={inputClass}
          />
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="제목"
            className={inputClass}
          />
        </div>

        <input
          required
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          placeholder="한 줄 요약"
          className={inputClass}
        />
        <textarea
          required
          rows={7}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="상세 설명"
          className={`${inputClass} leading-relaxed`}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={form.period}
            onChange={(e) => setForm({ ...form, period: e.target.value })}
            placeholder="기간 (2025.01 - 2025.03)"
            className={inputClass}
          />
          <input
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            placeholder="역할"
            className={inputClass}
          />
          <input
            value={form.stack}
            onChange={(e) => setForm({ ...form, stack: e.target.value })}
            placeholder="스택 (쉼표로 구분)"
            className={inputClass}
          />
          <input
            value={form.githubUrl}
            onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
            placeholder="GitHub URL"
            className={inputClass}
          />
          <input
            value={form.liveUrl}
            onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
            placeholder="배포 URL"
            className={inputClass}
          />
          <input
            value={form.thumbnail}
            onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
            placeholder="썸네일 URL"
            className={inputClass}
          />
        </div>

        <label className="block pt-1 text-xs text-muted">
          썸네일 업로드 (5MB 이하)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUpload(file);
            }}
            className="mt-2 block w-full text-xs"
          />
        </label>

        <div className="flex gap-6 pt-1 text-sm text-muted">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="accent-accent"
            />
            공개
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="accent-accent"
            />
            홈에 노출
          </label>
        </div>

        <div className="flex gap-2 pt-3">
          <button type="submit" disabled={busy} className={primaryClass}>
            {form.id ? '수정 저장' : '추가'}
          </button>
          {form.id && (
            <button type="button" onClick={() => setForm(EMPTY_FORM)} className={secondaryClass}>
              취소
            </button>
          )}
        </div>
      </form>

      <div className="mt-14 border-t border-line">
        {projects.map((project) => (
          <div key={project.id} className="flex items-center gap-4 border-b border-line py-3.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">
                {project.title}
                {!project.published && <span className="ml-2 text-xs text-muted">비공개</span>}
              </p>
              <p className="truncate text-xs text-muted">/{project.slug}</p>
            </div>
            <button
              onClick={() => edit(project)}
              className="text-sm text-muted transition-colors duration-150 hover:text-fg"
            >
              수정
            </button>
            <button
              onClick={() => void handleDelete(project)}
              className="text-sm text-muted transition-colors duration-150 hover:text-accent"
            >
              삭제
            </button>
          </div>
        ))}
        {projects.length === 0 && (
          <p className="border-b border-line py-6 text-sm text-muted">등록된 항목이 없습니다.</p>
        )}
      </div>
    </main>
  );
}
