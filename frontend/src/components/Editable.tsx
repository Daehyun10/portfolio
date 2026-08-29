'use client';

import { useEditMode } from './EditModeProvider';

/**
 * 편집 모드가 아니면 평범한 텍스트로 렌더하고,
 * 편집 모드에서는 그 자리에서 바로 고칠 수 있는 영역이 된다.
 */
export default function Editable({
  id,
  as: Tag = 'span',
  className,
}: {
  id: string;
  as?: React.ElementType;
  className?: string;
}) {
  const { editing, value, setDraft } = useEditMode();
  const text = value(id);

  if (!editing) return <Tag className={className}>{text}</Tag>;

  return (
    <Tag
      className={`${className ?? ''} -mx-1 rounded-xs bg-card px-1 outline-1 outline-dashed outline-line focus:outline focus:outline-1 focus:outline-accent`}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-edit-id={id}
      // 편집 중 리렌더로 커서가 튀지 않도록 blur 시점에만 값을 반영한다.
      onBlur={(e: React.FocusEvent<HTMLElement>) => setDraft(id, e.currentTarget.innerText)}
    >
      {text}
    </Tag>
  );
}
