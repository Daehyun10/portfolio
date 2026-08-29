import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import { getProject, getProjects } from '@/lib/api';

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  return { title: project ? `${project.title} | 포트폴리오` : '프로젝트를 찾을 수 없습니다' };
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

  return (
    <main>
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
          <p className="mt-6 text-sm text-muted">{project.stack.join(' · ')}</p>
        )}

        <section className="mt-12">
          <h2 className="text-xs tracking-[0.2em] text-muted">OVERVIEW</h2>
          <p className="mt-4 max-w-[62ch] whitespace-pre-wrap leading-[1.85] text-muted">
            {project.description}
          </p>
        </section>

        {project.troubles.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xs tracking-[0.2em] text-muted">TROUBLE SHOOTING</h2>

            {/* 카드 대신 괘선으로 항목을 나눈다. */}
            <div className="mt-4 border-t border-line">
              {project.troubles.map((trouble, i) => (
                <div key={trouble.id} className="grid gap-x-5 border-b border-line py-7 sm:grid-cols-[2rem_1fr]">
                  <span className="tnum hidden pt-1 text-xs text-muted sm:block">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div>
                    <h3 className="display max-w-[40ch] text-base leading-snug">
                      {trouble.title}
                    </h3>
                    <p className="mt-3 max-w-[58ch] text-sm leading-[1.85] text-muted">
                      <span className="mr-2 text-fg">문제</span>
                      {trouble.problem}
                    </p>
                    <p className="mt-2 max-w-[58ch] text-sm leading-[1.85] text-muted">
                      <span className="mr-2 text-fg">해결</span>
                      {trouble.solution}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
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
