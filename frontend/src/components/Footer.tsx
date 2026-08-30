'use client';

import Editable from './Editable';
import { useEditMode } from './EditModeProvider';

/**
 * 평소에는 링크로 동작하고, 편집 모드에서만 글자를 고칠 수 있는 형태로 바뀐다.
 * 편집 중에 링크가 살아 있으면 글자를 누를 때마다 페이지가 이동해 버린다.
 */
export default function Footer() {
  const { editing, value } = useEditMode();

  const email = value('footer.email');
  const githubUrl = value('footer.githubUrl');
  const githubLabel = value('footer.githubLabel');

  return (
    <footer className="mt-20 border-t border-line px-6 pb-32 pt-10 text-sm text-muted">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="space-y-1">
          {editing ? (
            <>
              <Editable id="footer.email" as="p" />
              <Editable id="footer.githubLabel" as="p" />
              <Editable id="footer.githubUrl" as="p" className="text-xs" />
            </>
          ) : (
            <>
              <a
                href={`mailto:${email}`}
                className="block transition-colors duration-150 hover:text-fg"
              >
                {email}
              </a>
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="block transition-colors duration-150 hover:text-fg"
              >
                {githubLabel}
              </a>
            </>
          )}
        </div>

        <p className="tnum text-xs">
          © {new Date().getFullYear()} <Editable id="footer.copyright" />
        </p>
      </div>
    </footer>
  );
}
