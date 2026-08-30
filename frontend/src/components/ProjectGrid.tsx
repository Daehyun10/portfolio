'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { revalidateProjects } from '@/app/actions';
import { adminApi } from '@/lib/admin-client';
import type { Project } from '@/lib/types';
import ProjectCard from './ProjectCard';
import ProjectComposer from './ProjectComposer';
import { useEditMode } from './EditModeProvider';

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const { canEdit } = useEditMode();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(project: Project) {
    // 되돌릴 수 없는 동작이라 한 번 더 묻는다.
    if (!confirm(`"${project.title}" 작업을 삭제할까요? 되돌릴 수 없습니다.`)) return;

    setBusyId(project.id);
    setError(null);
    try {
      await adminApi.deleteProject(project.id);
      await revalidateProjects();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  }

  if (editing) {
    // 수정 중에는 목록 대신 폼만 보여, 어떤 작업을 고치는지 헷갈리지 않게 한다.
    return (
      <ProjectComposer
        key={editing.id}
        project={editing}
        onDone={() => setEditing(null)}
      />
    );
  }

  return (
    <>
      {error && <p className="mb-4 text-sm text-accent">{error}</p>}

      <div className="grid gap-5 sm:grid-cols-2">
        {projects.map((project) => (
          <div key={project.id} className="flex flex-col">
            <ProjectCard project={project} />

            {canEdit && (
              <div className="mt-1.5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(project)}
                  className="text-xs text-muted transition-colors duration-150 hover:text-fg"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => void remove(project)}
                  disabled={busyId === project.id}
                  className="text-xs text-muted transition-colors duration-150 hover:text-accent disabled:opacity-45"
                >
                  {busyId === project.id ? '삭제 중' : '삭제'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
