import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 pt-32">
      <p className="tnum text-xs tracking-[0.2em] text-muted">404</p>
      <h1 className="display mt-4 text-3xl">페이지를 찾을 수 없습니다.</h1>
      <p className="mt-3 text-muted">주소가 바뀌었거나 삭제된 항목일 수 있습니다.</p>
      <Link
        href="/"
        className="mt-8 inline-block border border-line px-4 py-2 text-sm text-muted transition-colors duration-150 hover:border-fg hover:text-fg"
      >
        홈으로
      </Link>
    </main>
  );
}
