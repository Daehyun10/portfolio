'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { revalidateProjects } from '@/app/actions';
import { adminApi, tokenStore } from '@/lib/admin-client';
import type { Project } from '@/lib/types';

interface TroubleDraft {
  title: string;
  problem: string;
  solution: string;
}

interface ImageDraft {
  url: string;
  caption: string;
}

interface Draft {
  slug: string;
  title: string;
  summary: string;
  description: string;
  period: string;
  role: string;
  teamSize: string;
  stack: string;
  githubUrl: string;
  liveUrl: string;
  featured: boolean;
  published: boolean;
  troubles: TroubleDraft[];
  images: ImageDraft[];
}

const EMPTY_DRAFT: Draft = {
  slug: '',
  title: '',
  summary: '',
  description: '',
  period: '',
  role: '',
  teamSize: '',
  stack: '',
  githubUrl: '',
  liveUrl: '',
  featured: true,
  published: true,
  troubles: [],
  images: [],
};

/// 기존 작업을 폼이 다룰 수 있는 형태로 바꾼다.
function toDraft(project: Project): Draft {
  return {
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    description: project.description,
    period: project.period ?? '',
    role: project.role ?? '',
    teamSize: project.teamSize ? String(project.teamSize) : '',
    stack: project.stack.join(', '),
    githubUrl: project.githubUrl ?? '',
    liveUrl: project.liveUrl ?? '',
    featured: project.featured,
    published: project.published,
    troubles: project.troubles.map((t) => ({
      title: t.title,
      problem: t.problem,
      solution: t.solution,
    })),
    images: project.images.map((img) => ({ url: img.url, caption: img.caption ?? '' })),
  };
}

const inputClass =
  'w-full border border-line bg-bg px-2.5 py-1.5 text-sm outline-none transition-colors duration-150 placeholder:text-muted hover:border-muted focus:border-accent';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs tracking-[0.14em] text-muted">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export default function ProjectComposer({
  project,
  onDone,
}: {
  /// 넘기면 수정 모드로 열린다. 없으면 새로 만드는 모드.
  project?: Project;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [open, setOpen] = useState(Boolean(project));
  const [draft, setDraft] = useState<Draft>(project ? toDraft(project) : EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 토큰이 실제로 유효할 때만 추가 버튼을 노출한다. 방문자에게는 아무것도 보이지 않는다.
    if (!tokenStore.get()) return;
    adminApi
      .me()
      .then(() => setAllowed(true))
      .catch(() => setAllowed(false));
  }, []);

  if (!allowed) return null;

  function patch(next: Partial<Draft>) {
    setDraft((prev) => ({ ...prev, ...next }));
  }

  function patchTrouble(index: number, next: Partial<TroubleDraft>) {
    setDraft((prev) => ({
      ...prev,
      troubles: prev.troubles.map((t, i) => (i === index ? { ...t, ...next } : t)),
    }));
  }

  /// 여러 장을 한 번에 고를 수 있게 하되, 업로드는 순서대로 진행해 순서가 뒤섞이지 않게 한다.
  async function handleFiles(files: FileList) {
    setUploading(true);
    setError(null);
    try {
      const uploaded: ImageDraft[] = [];
      for (const file of Array.from(files)) {
        const { url } = await adminApi.uploadImage(file);
        uploaded.push({ url, caption: '' });
      }
      setDraft((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= draft.images.length) return;
    const next = [...draft.images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    patch({ images: next });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const payload = {
      slug: draft.slug.trim(),
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      description: draft.description.trim(),
      // 비어 있는 값은 보내지 않는다. 서버가 빈 문자열을 거르지 않기 때문.
      period: draft.period.trim() || undefined,
      role: draft.role.trim() || undefined,
      teamSize: draft.teamSize ? Number(draft.teamSize) : undefined,
      githubUrl: draft.githubUrl.trim() || undefined,
      liveUrl: draft.liveUrl.trim() || undefined,
      stack: draft.stack
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      featured: draft.featured,
      published: draft.published,
      troubles: draft.troubles
        .filter((t) => t.title.trim() && t.problem.trim() && t.solution.trim())
        .map((t, i) => ({
          title: t.title.trim(),
          problem: t.problem.trim(),
          solution: t.solution.trim(),
          order: i,
        })),
      images: draft.images.map((img, i) => ({
        url: img.url,
        caption: img.caption.trim() || undefined,
        order: i,
      })),
    };

    try {
      if (project) await adminApi.updateProject(project.id, payload);
      else await adminApi.createProject(payload);

      await revalidateProjects();
      if (!project) setDraft(EMPTY_DRAFT);
      setOpen(false);
      router.refresh();
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-6 flex w-full items-center gap-2 border border-dashed border-line px-4 py-3 text-sm text-muted transition-colors duration-150 hover:border-fg hover:text-fg"
      >
        <span aria-hidden className="text-base leading-none">
          +
        </span>
        새 작업 추가
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-10 border-t border-line pt-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xs tracking-[0.2em] text-muted">{project ? '작업 수정' : '새 작업'}</h2>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
            onDone?.();
          }}
          className="text-sm text-muted transition-colors duration-150 hover:text-fg"
        >
          닫기
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-[14rem_1fr]">
          <Field label="주소(slug)">
            <input
              required
              value={draft.slug}
              onChange={(e) => patch({ slug: e.target.value })}
              placeholder="my-game"
              className={inputClass}
            />
          </Field>
          <Field label="제목">
            <input
              required
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="한 줄 요약">
          <input
            required
            value={draft.summary}
            onChange={(e) => patch({ summary: e.target.value })}
            className={inputClass}
          />
        </Field>

        <Field label="개요">
          <textarea
            required
            rows={7}
            value={draft.description}
            onChange={(e) => patch({ description: e.target.value })}
            className={`${inputClass} leading-relaxed`}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="기간">
            <input
              value={draft.period}
              onChange={(e) => patch({ period: e.target.value })}
              placeholder="2025.01 - 2025.03"
              className={inputClass}
            />
          </Field>
          <Field label="역할">
            <input
              value={draft.role}
              onChange={(e) => patch({ role: e.target.value })}
              placeholder="기획 · 개발"
              className={inputClass}
            />
          </Field>
          <Field label="인원">
            <input
              type="number"
              min={1}
              value={draft.teamSize}
              onChange={(e) => patch({ teamSize: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="기술 (쉼표로 구분)">
            <input
              value={draft.stack}
              onChange={(e) => patch({ stack: e.target.value })}
              placeholder="Unity, C#"
              className={inputClass}
            />
          </Field>
          <Field label="GitHub URL">
            <input
              value={draft.githubUrl}
              onChange={(e) => patch({ githubUrl: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="배포 URL">
            <input
              value={draft.liveUrl}
              onChange={(e) => patch({ liveUrl: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="border-t border-line pt-5">
          <div className="flex items-baseline justify-between">
            <h3 className="text-xs tracking-[0.2em] text-muted">스크린샷</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-xs text-muted">
                {uploading ? '올리는 중' : `${draft.images.length}장`}
              </span>
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-muted transition-colors duration-150 hover:text-fg disabled:opacity-45"
              >
                + 스크린샷 추가
              </button>
            </div>
          </div>

          {/* 실제 입력은 숨기고 버튼으로 연다. 다른 추가 버튼들과 모양을 맞춘다. */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) void handleFiles(files);
              // 같은 파일을 다시 고를 수 있도록 입력값을 비운다.
              e.target.value = '';
            }}
          />

          {draft.images.map((image, i) => (
            <div key={image.url} className="mt-4 flex gap-3 border-l border-line pl-4">
              <span className="tnum w-5 shrink-0 pt-1 text-xs text-muted">
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* 업로드 직후 확인용이라 최적화 없이 그대로 띄운다. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={`스크린샷 ${i + 1}`}
                className="h-16 w-24 shrink-0 border border-line object-cover"
              />

              <div className="min-w-0 flex-1">
                <input
                  value={image.caption}
                  onChange={(e) =>
                    patch({
                      images: draft.images.map((img, j) =>
                        j === i ? { ...img, caption: e.target.value } : img,
                      ),
                    })
                  }
                  placeholder="설명 (선택)"
                  className={inputClass}
                />

                <div className="mt-1.5 flex gap-3 text-xs text-muted">
                  <button
                    type="button"
                    onClick={() => moveImage(i, i - 1)}
                    disabled={i === 0}
                    className="transition-colors duration-150 hover:text-fg disabled:opacity-35"
                  >
                    위로
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(i, i + 1)}
                    disabled={i === draft.images.length - 1}
                    className="transition-colors duration-150 hover:text-fg disabled:opacity-35"
                  >
                    아래로
                  </button>
                  <button
                    type="button"
                    onClick={() => patch({ images: draft.images.filter((_, j) => j !== i) })}
                    className="transition-colors duration-150 hover:text-accent"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-line pt-5">
          <div className="flex items-baseline justify-between">
            <h3 className="text-xs tracking-[0.2em] text-muted">문제와 해결</h3>
            <button
              type="button"
              onClick={() =>
                patch({ troubles: [...draft.troubles, { title: '', problem: '', solution: '' }] })
              }
              className="text-sm text-muted transition-colors duration-150 hover:text-fg"
            >
              + 항목 추가
            </button>
          </div>

          {draft.troubles.map((trouble, i) => (
            <div key={i} className="mt-4 grid gap-3 border-l border-line pl-4">
              <input
                value={trouble.title}
                onChange={(e) => patchTrouble(i, { title: e.target.value })}
                placeholder="무엇이 문제였는지 한 줄로"
                className={inputClass}
              />
              <textarea
                rows={3}
                value={trouble.problem}
                onChange={(e) => patchTrouble(i, { problem: e.target.value })}
                placeholder="문제 상황"
                className={`${inputClass} leading-relaxed`}
              />
              <textarea
                rows={3}
                value={trouble.solution}
                onChange={(e) => patchTrouble(i, { solution: e.target.value })}
                placeholder="해결 방법"
                className={`${inputClass} leading-relaxed`}
              />
              <button
                type="button"
                onClick={() => patch({ troubles: draft.troubles.filter((_, j) => j !== i) })}
                className="justify-self-start text-sm text-muted transition-colors duration-150 hover:text-accent"
              >
                이 항목 삭제
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-6 pt-1 text-sm text-muted">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) => patch({ published: e.target.checked })}
              className="accent-accent"
            />
            공개
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={(e) => patch({ featured: e.target.checked })}
              className="accent-accent"
            />
            첫 화면에 노출
          </label>
        </div>

        {error && <p className="text-sm text-accent">{error}</p>}

        <div className="flex items-center gap-2 border-t border-line pt-5">
          <button
            type="submit"
            disabled={busy}
            className="bg-fg px-4 py-1.5 text-sm text-bg transition-colors duration-150 hover:bg-accent disabled:opacity-45"
          >
            {busy ? '저장 중' : project ? '수정 저장' : '추가'}
          </button>
          <button
            type="button"
            onClick={() => setDraft(EMPTY_DRAFT)}
            className="border border-line px-4 py-1.5 text-sm text-muted transition-colors duration-150 hover:border-fg hover:text-fg"
          >
            내용 비우기
          </button>
        </div>
      </div>
    </form>
  );
}
