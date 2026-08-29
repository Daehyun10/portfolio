'use client';

import { useEditMode } from './EditModeProvider';

/// 독 위에 뜨는 연필 버튼. 로그인한 본인에게만 보인다.
export default function EditToolbar() {
  const { canEdit, editing, dirty, busy, error, start, cancel, save } = useEditMode();
  if (!canEdit) return null;

  if (!editing) {
    return (
      <button
        type="button"
        onClick={start}
        title="이 화면의 글 수정"
        aria-label="이 화면의 글 수정"
        className="fixed bottom-6 right-6 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card text-muted transition-colors duration-150 hover:border-fg hover:text-fg"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="M4 20h4L19 9a2.8 2.8 0 1 0-4-4L4 16v4Z" />
          <path d="M14.5 5.5 18.5 9.5" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 border border-line bg-card px-3 py-2">
      {error ? (
        <span className="max-w-[16rem] text-xs text-accent">{error}</span>
      ) : (
        <span className="text-xs text-muted">
          {dirty ? '수정한 내용이 있습니다' : '글자를 눌러 수정하세요'}
        </span>
      )}

      <button
        type="button"
        onClick={cancel}
        disabled={busy}
        className="border border-line px-3 py-1 text-sm text-muted transition-colors duration-150 hover:border-fg hover:text-fg disabled:opacity-45"
      >
        취소
      </button>
      <button
        type="button"
        onClick={() => void save()}
        disabled={busy || !dirty}
        className="bg-fg px-3 py-1 text-sm text-bg transition-colors duration-150 hover:bg-accent disabled:opacity-45"
      >
        {busy ? '저장 중' : '저장'}
      </button>
    </div>
  );
}
