'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { revalidateSiteText } from '@/app/actions';
import { adminApi, tokenStore } from '@/lib/admin-client';
import type { About } from '@/lib/types';

interface EditModeValue {
  canEdit: boolean;
  editing: boolean;
  dirty: boolean;
  busy: boolean;
  error: string | null;
  value: (id: string) => string;
  setDraft: (id: string, next: string) => void;
  start: () => void;
  cancel: () => void;
  save: () => Promise<void>;
}

const EditModeContext = createContext<EditModeValue | null>(null);

export function useEditMode() {
  const ctx = useContext(EditModeContext);
  if (!ctx) throw new Error('useEditMode는 EditModeProvider 안에서만 쓸 수 있습니다.');
  return ctx;
}

export default function EditModeProvider({
  text,
  about,
  children,
}: {
  text: Record<string, string>;
  about?: About | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [canEdit, setCanEdit] = useState(false);
  const [editing, setEditing] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 토큰이 실제로 유효할 때만 연필 버튼을 띄운다.
    if (!tokenStore.get()) return;
    adminApi
      .me()
      .then(() => setCanEdit(true))
      .catch(() => setCanEdit(false));
  }, []);

  // About 본문도 같은 편집 모드에서 다루려고 키를 만들어 합쳐 둔다.
  const base = useMemo(() => {
    const merged: Record<string, string> = { ...text };
    if (about) {
      merged['about.headline'] = about.headline;
      merged['about.intro'] = about.intro;
      for (const s of about.sections) {
        merged[`about.section.${s.id}.title`] = s.title;
        merged[`about.section.${s.id}.body`] = s.body;
      }
    }
    return merged;
  }, [text, about]);

  const value = useCallback((id: string) => drafts[id] ?? base[id] ?? '', [drafts, base]);

  const setDraft = useCallback(
    (id: string, next: string) => {
      setDrafts((prev) => {
        // 원래 값으로 되돌아오면 변경 목록에서 빼서 불필요한 저장을 막는다.
        if (next === (base[id] ?? '')) {
          const { [id]: _drop, ...rest } = prev;
          return rest;
        }
        return { ...prev, [id]: next };
      });
    },
    [base],
  );

  const dirty = Object.keys(drafts).length > 0;

  async function save() {
    setBusy(true);
    setError(null);

    const changed = Object.entries(drafts);
    const siteEntries = changed
      .filter(([key]) => !key.startsWith('about.section.') && key !== 'about.headline' && key !== 'about.intro')
      .map(([key, value]) => ({ key, value }));
    const aboutChanged = changed.some(
      ([key]) => key.startsWith('about.section.') || key === 'about.headline' || key === 'about.intro',
    );

    try {
      if (siteEntries.length > 0) await adminApi.updateSiteText(siteEntries);

      if (aboutChanged && about) {
        await adminApi.updateAbout({
          headline: value('about.headline'),
          intro: value('about.intro'),
          email: about.email ?? undefined,
          githubUrl: about.githubUrl ?? undefined,
          sections: about.sections.map((s, i) => ({
            title: value(`about.section.${s.id}.title`),
            body: value(`about.section.${s.id}.body`),
            order: i,
          })),
          skills: about.skills.map((s, i) => ({
            name: s.name,
            category: s.category ?? undefined,
            level: s.level,
            order: i,
          })),
        });
      }

      await revalidateSiteText();
      setDrafts({});
      setEditing(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <EditModeContext.Provider
      value={{
        canEdit,
        editing,
        dirty,
        busy,
        error,
        value,
        setDraft,
        start: () => setEditing(true),
        cancel: () => {
          setDrafts({});
          setEditing(false);
          setError(null);
        },
        save,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}
