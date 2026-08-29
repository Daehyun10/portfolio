import Image from 'next/image';
import type { ProjectImage } from '@/lib/types';

/// 상세 페이지의 스크린샷 목록. 캡션이 있으면 이미지 아래에 작게 붙는다.
export default function ProjectGallery({ images }: { images: ProjectImage[] }) {
  if (images.length === 0) return null;

  return (
    <section className="mt-14">
      <h2 className="text-xs tracking-[0.2em] text-muted">SCREENSHOTS</h2>

      <div className="mt-4 space-y-8">
        {images.map((image, i) => (
          <figure key={image.id}>
            <div className="relative w-full overflow-hidden border border-line bg-card">
              <Image
                src={image.url}
                alt={image.caption ?? `스크린샷 ${i + 1}`}
                width={1600}
                height={900}
                // 원본 비율을 유지하면서 본문 폭에 맞춘다.
                className="h-auto w-full"
                sizes="(max-width: 768px) 100vw, 768px"
                priority={i === 0}
              />
            </div>

            {image.caption && (
              <figcaption className="mt-2 text-xs leading-relaxed text-muted">
                {image.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}
