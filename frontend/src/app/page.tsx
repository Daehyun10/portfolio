import Link from 'next/link';
import Editable from '@/components/Editable';
import Footer from '@/components/Footer';
import Marquee from '@/components/Marquee';
import ProjectCard from '@/components/ProjectCard';
import { getProjects } from '@/lib/api';

export default async function HomePage() {
  const featured = await getProjects(true);

  return (
    <main>
      {/* 히어로는 화면 중앙이 아니라 왼쪽 컬럼에 붙여 비대칭으로 둔다. */}
      <section className="mx-auto flex min-h-[72vh] max-w-5xl flex-col justify-center px-6 pt-24">
        <Editable id="home.eyebrow" as="p" className="text-xs tracking-[0.2em] text-muted" />

        <h1 className="display mt-5 max-w-[15ch] text-4xl leading-[1.15] sm:text-5xl">
          <Editable id="home.headline.lead" className="text-muted" />
          <Editable id="home.headline.rest" />
        </h1>

        <Editable id="home.intro.1" as="p" className="mt-7 max-w-[58ch] leading-[1.8] text-muted" />
        <Editable id="home.intro.2" as="p" className="mt-4 max-w-[58ch] leading-[1.8] text-muted" />
      </section>

      <Marquee />

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="flex items-baseline justify-between border-b border-line pb-3">
          <Editable id="home.work.label" as="h2" className="text-xs tracking-[0.2em] text-muted" />
          <Link
            href="/project"
            className="text-sm text-muted transition-colors duration-150 hover:text-fg"
          >
            <Editable id="home.work.more" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="py-10 text-sm text-muted">
            첫 화면에 노출할 작업이 아직 없습니다. Project 페이지에서 추가할 수 있습니다.
          </p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {featured.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-5xl px-6">
        <div className="grid border-t border-line sm:grid-cols-2">
          <Link
            href="/project"
            className="group border-b border-line py-8 pr-8 transition-colors duration-150 sm:border-r"
          >
            <Editable
              id="home.card.project.title"
              as="h3"
              className="display text-xl transition-colors duration-150 group-hover:text-accent"
            />
            <Editable id="home.card.project.body" as="p" className="mt-2 text-sm text-muted" />
          </Link>
          <Link
            href="/about"
            className="group border-b border-line py-8 transition-colors duration-150 sm:pl-8"
          >
            <Editable
              id="home.card.about.title"
              as="h3"
              className="display text-xl transition-colors duration-150 group-hover:text-accent"
            />
            <Editable id="home.card.about.body" as="p" className="mt-2 text-sm text-muted" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
