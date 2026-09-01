'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import type { ProjectImage } from '@/lib/types';

/// 상세 페이지의 스크린샷 목록. 누르면 전체 화면으로 크게 볼 수 있다.
export default function ProjectGallery({ images }: { images: ProjectImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;

  const close = useCallback(() => setOpenIndex(null), []);
  const move = useCallback(
    (step: number) => {
      setOpenIndex((prev) => {
        if (prev === null) return prev;
        // 처음과 끝에서 순환시켜 끝에 닿아도 막히지 않게 한다.
        return (prev + step + images.length) % images.length;
      });
    },
    [images.length],
  );

  useEffect(() => {
    if (!isOpen) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
    }

    // 확대 중에는 뒤 페이지가 같이 스크롤되지 않게 막는다.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, close, move]);

  if (images.length === 0) return null;

  // 인덱스와 이미지를 함께 좁혀 두면 아래에서 null 검사를 반복하지 않아도 된다.
  const current = openIndex === null ? null : { index: openIndex, image: images[openIndex] };

  return (
    <section className="mt-14">
      <h2 className="text-xs tracking-[0.2em] text-muted">SCREENSHOTS</h2>

      <div className="mt-4 space-y-8">
        {images.map((image, i) => (
          <figure key={image.id}>
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={`${image.caption ?? `스크린샷 ${i + 1}`} 크게 보기`}
              className="block w-full cursor-zoom-in overflow-hidden border border-line bg-card transition-colors duration-150 hover:border-muted"
            >
              <Image
                src={image.url}
                alt={image.caption ?? `스크린샷 ${i + 1}`}
                width={1600}
                height={900}
                className="h-auto w-full"
                sizes="(max-width: 768px) 100vw, 768px"
                priority={i === 0}
              />
            </button>

            {image.caption && (
              <figcaption className="mt-2 text-xs leading-relaxed text-muted">
                {image.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="스크린샷 크게 보기"
          onClick={close}
          className="fixed inset-0 z-[60] flex flex-col bg-bg p-4 sm:p-8"
        >
          <div className="flex shrink-0 items-center justify-between text-sm text-muted">
            <span className="tnum">
              {current.index + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={close}
              className="px-2 py-1 transition-colors duration-150 hover:text-fg"
            >
              닫기
            </button>
          </div>

          {/* 이미지 바깥을 누르면 닫히므로, 안쪽 클릭은 전파를 멈춘다. */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex min-h-0 flex-1 items-center justify-center py-4"
          >
            <Image
              src={current.image.url}
              alt={current.image.caption ?? '스크린샷'}
              width={2400}
              height={1600}
              className="max-h-full w-auto max-w-full object-contain"
              sizes="100vw"
            />
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className="flex shrink-0 items-center justify-between gap-4 text-sm"
          >
            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => move(-1)}
                  className="px-2 py-1 text-muted transition-colors duration-150 hover:text-fg"
                >
                  ← 이전
                </button>
                <p className="min-w-0 flex-1 truncate text-center text-xs text-muted">
                  {current.image.caption}
                </p>
                <button
                  type="button"
                  onClick={() => move(1)}
                  className="px-2 py-1 text-muted transition-colors duration-150 hover:text-fg"
                >
                  다음 →
                </button>
              </>
            ) : (
              <p className="flex-1 text-center text-xs text-muted">{current.image.caption}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
