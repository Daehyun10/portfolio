'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import type { ProjectImage } from '@/lib/types';

/**
 * 스크린샷 한 장. 본문 사이사이에 놓기 위해 낱장 단위로 렌더한다.
 * 확대 화면에서는 이 프로젝트의 전체 이미지를 넘길 수 있도록 목록 전체를 함께 받는다.
 */
export default function ProjectShot({ images, index }: { images: ProjectImage[]; index: number }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;

  const close = useCallback(() => setOpenIndex(null), []);
  const move = useCallback(
    (step: number) => {
      setOpenIndex((prev) =>
        // 처음과 끝에서 순환시켜 끝에 닿아도 막히지 않게 한다.
        prev === null ? prev : (prev + step + images.length) % images.length,
      );
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

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, close, move]);

  const image = images[index];
  if (!image) return null;

  const current = openIndex === null ? null : { index: openIndex, image: images[openIndex] };

  return (
    <figure className="mt-7">
      <button
        type="button"
        onClick={() => setOpenIndex(index)}
        aria-label={`${image.caption ?? '스크린샷'} 크게 보기`}
        className="block w-full cursor-zoom-in overflow-hidden border border-line bg-card transition-colors duration-150 hover:border-muted"
      >
        <Image
          src={image.url}
          alt={image.caption ?? '스크린샷'}
          width={1600}
          height={900}
          className="h-auto w-full"
          sizes="(max-width: 768px) 100vw, 768px"
          priority={index === 0}
        />
      </button>

      {image.caption && (
        <figcaption className="mt-2 text-xs leading-relaxed text-muted">{image.caption}</figcaption>
      )}

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="스크린샷 크게 보기"
          onClick={close}
          className="fixed inset-0 z-[70] flex flex-col bg-bg p-4 sm:p-8"
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

          {/* 바깥을 누르면 닫히므로 안쪽 클릭은 전파를 멈춘다. */}
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
    </figure>
  );
}
