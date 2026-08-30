'use client';

import { useCallback, useEffect, useState } from 'react';
import ProjectComposer from '@/components/ProjectComposer';
import { adminApi, login, tokenStore } from '@/lib/admin-client';
import type { Project } from '@/lib/types';

const inputClass =
  'w-full border border-line bg-bg px-2.5 py-1.5 text-sm outline-none transition-colors duration-150 placeholder:text-muted hover:border-muted focus:border-accent';

const primaryClass =
  'bg-fg px-4 py-1.5 text-sm text-bg transition-colors duration-150 hover:bg-accent disabled:opacity-45';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
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

  async function handleDelete(project: Project) {
    if (!confirm(`"${project.title}" 작업을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    setBusy(true);
    try {
      await adminApi.deleteProject(project.id);
      if (editing?.id === project.id) setEditing(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
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

      {/* 작업 페이지와 같은 폼을 쓴다. 폼이 갈라지면 한쪽에만 기능이 빠진다. */}
      <div className="mt-10">
        {editing ? (
          <ProjectComposer
            key={editing.id}
            project={editing}
            onDone={() => {
              setEditing(null);
              void refresh();
            }}
          />
        ) : (
          <ProjectComposer onDone={() => void refresh()} />
        )}
      </div>

      {!editing && (
        <div className="mt-10 border-t border-line">
          {projects.map((project) => (
            <div key={project.id} className="flex items-center gap-4 border-b border-line py-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">
                  {project.title}
                  {!project.published && <span className="ml-2 text-xs text-muted">비공개</span>}
                </p>
                <p className="truncate text-xs text-muted">
                  /{project.slug}
                  {project.images.length > 0 && ` · 스크린샷 ${project.images.length}장`}
                  {project.troubles.length > 0 && ` · 문제와 해결 ${project.troubles.length}개`}
                </p>
              </div>

              <button
                onClick={() => setEditing(project)}
                className="text-sm text-muted transition-colors duration-150 hover:text-fg"
              >
                수정
              </button>
              <button
                onClick={() => void handleDelete(project)}
                disabled={busy}
                className="text-sm text-muted transition-colors duration-150 hover:text-accent disabled:opacity-45"
              >
                삭제
              </button>
            </div>
          ))}

          {projects.length === 0 && (
            <p className="border-b border-line py-6 text-sm text-muted">등록된 작업이 없습니다.</p>
          )}
        </div>
      )}
    </main>
  );
}
