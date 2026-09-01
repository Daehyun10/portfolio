import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import ProjectShot from '@/components/ProjectShot';
import ReadingProgress from '@/components/ReadingProgress';
import Reveal from '@/components/Reveal';
import { getProject, getProjects } from '@/lib/api';
import { toParagraphs } from '@/lib/paragraphs';
import type { ProjectImage } from '@/lib/types';

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  return { title: project ? `${project.title} | 포트폴리오` : '프로젝트를 찾을 수 없습니다' };
}

/// 첫 문단은 결론처럼 밝게 두고, 나머지는 본문 색으로 이어 붙인다.
function Prose({ text }: { text: string }) {
  const paragraphs = toParagraphs(text);
  if (paragraphs.length === 0) return null;

  return (
    <div className="mt-4">
      {paragraphs.map((paragraph, i) => (
        <p
          key={i}
          className={i === 0 ? 'lead' : 'mt-5 max-w-[62ch] leading-[1.85] text-body'}
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const meta = (
    [
      ['기간', project.period],
      ['역할', project.role],
      ['인원', project.teamSize ? `${project.teamSize}명` : null],
    ] as [string, string | null][]
  ).filter((entry): entry is [string, string] => Boolean(entry[1]));

  // 스크린샷을 한곳에 몰지 않고 글 사이에 흩어 놓아 읽는 호흡을 만든다.
  const images: ProjectImage[] = project.images ?? [];
  const rest = images.slice(2);

  return (
    <main>
      <ReadingProgress />

      <article className="mx-auto max-w-3xl px-6 pt-28">
        <Link
          href="/project"
          className="text-sm text-muted transition-colors duration-150 hover:text-fg"
        >
          ← Project
        </Link>

        <h1 className="display mt-6 max-w-[20ch] text-3xl leading-tight sm:text-4xl">
          {project.title}
        </h1>
        <p className="mt-4 max-w-[58ch] leading-[1.8] text-muted">{project.summary}</p>

        {meta.length > 0 && (
          <dl className="mt-9 grid grid-cols-2 gap-4 border-y border-line py-5 text-sm sm:grid-cols-3">
            {meta.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs tracking-[0.14em] text-muted">{label}</dt>
                <dd className="tnum mt-1">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {project.stack.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="border border-line px-3 py-1 text-xs text-muted transition-colors duration-150 hover:border-muted hover:text-fg"
              >
                {tech}
              </li>
            ))}
          </ul>
        )}

        <Reveal as="section" className="mt-12">
          <h2 className="text-xs tracking-[0.2em] text-muted">OVERVIEW</h2>
          <Prose text={project.description} />
          {images[0] && <ProjectShot images={images} index={0} />}
        </Reveal>

        {project.process && (
          <Reveal as="section" className="mt-14">
            <h2 className="text-xs tracking-[0.2em] text-muted">개발 과정</h2>
            <Prose text={project.process} />
            {images[1] && <ProjectShot images={images} index={1} />}
          </Reveal>
        )}

        {project.concerns && (
          <Reveal as="section" className="mt-14">
            <h2 className="text-xs tracking-[0.2em] text-muted">고민한 점</h2>
            <Prose text={project.concerns} />
          </Reveal>
        )}

        {rest.length > 0 && (
          <Reveal as="section" className="mt-14">
            <h2 className="text-xs tracking-[0.2em] text-muted">SCREENSHOTS</h2>
            {rest.map((_, i) => (
              <ProjectShot key={images[i + 2].id} images={images} index={i + 2} />
            ))}
          </Reveal>
        )}

        {(project.troubles?.length ?? 0) > 0 && (
          <Reveal as="section" className="mt-14">
            <h2 className="text-xs tracking-[0.2em] text-muted">TROUBLE SHOOTING</h2>

            {/* 카드 대신 괘선으로 항목을 나눈다. */}
            <div className="mt-4 border-t border-line">
              {project.troubles.map((trouble, i) => (
                <div
                  key={trouble.id}
                  className="-mx-4 grid gap-x-5 border-b border-line px-4 py-7 transition-colors duration-150 hover:bg-card sm:grid-cols-[2rem_1fr]"
                >
                  <span className="tnum hidden pt-1 text-xs text-muted sm:block">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div>
                    <h3 className="display max-w-[40ch] text-base leading-snug">{trouble.title}</h3>

                    {/* 라벨을 본문에 붙이지 않고 왼쪽 열로 빼 눈이 걸리게 한다. */}
                    <dl className="mt-4 space-y-3.5">
                      {[
                        ['문제', trouble.problem],
                        ['해결', trouble.solution],
                      ].map(([label, body]) => (
                        <div key={label} className="grid gap-x-4 gap-y-1 sm:grid-cols-[3rem_1fr]">
                          <dt className="pt-0.5 text-xs tracking-[0.14em] text-muted">{label}</dt>
                          <dd className="max-w-[58ch] text-sm leading-[1.85] text-body">{body}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {(project.githubUrl || project.liveUrl) && (
          <div className="mt-12 flex gap-2">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-fg px-4 py-2 text-sm text-bg transition-colors duration-150 hover:bg-accent"
              >
                사이트 보기
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="border border-line px-4 py-2 text-sm text-muted transition-colors duration-150 hover:border-fg hover:text-fg"
              >
                GitHub
              </a>
            )}
          </div>
        )}
      </article>

      <Footer />
    </main>
  );
}
