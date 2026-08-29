import Editable from '@/components/Editable';
import Footer from '@/components/Footer';
import SkillBoard from '@/components/SkillBoard';
import { getAbout } from '@/lib/api';

export const metadata = { title: 'About | 포트폴리오' };

export default async function AboutPage() {
  const about = await getAbout();

  return (
    <main>
      <section className="mx-auto max-w-3xl px-6 pt-28">
        <Editable id="about.eyebrow" as="p" className="text-xs tracking-[0.2em] text-muted" />

        {about ? (
          <>
            <Editable
              id="about.headline"
              as="h1"
              className="display mt-5 block max-w-[24ch] text-3xl leading-tight sm:text-4xl"
            />
            <Editable
              id="about.intro"
              as="p"
              className="mt-5 block max-w-[58ch] leading-[1.8] text-muted"
            />
          </>
        ) : (
          <h1 className="display mt-5 max-w-[24ch] text-3xl leading-tight sm:text-4xl">
            About 내용이 아직 등록되지 않았습니다.
          </h1>
        )}
      </section>

      {about && (
        <section className="mx-auto max-w-3xl px-6 py-14">
          <div className="border-t border-line">
            {about.sections.map((section) => (
              <div
                key={section.id}
                className="grid gap-x-8 gap-y-2 border-b border-line py-7 sm:grid-cols-[8rem_1fr]"
              >
                <Editable
                  id={`about.section.${section.id}.title`}
                  as="h2"
                  className="block pt-1 text-xs tracking-[0.14em] text-muted"
                />
                <Editable
                  id={`about.section.${section.id}.body`}
                  as="p"
                  className="block max-w-[58ch] whitespace-pre-wrap leading-[1.85] text-muted"
                />
              </div>
            ))}
          </div>

          <SkillBoard skills={about.skills ?? []} />

          <div className="mt-14 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
            {about.email && (
              <a
                href={`mailto:${about.email}`}
                className="transition-colors duration-150 hover:text-fg"
              >
                {about.email}
              </a>
            )}
            {about.githubUrl && (
              <a
                href={about.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="transition-colors duration-150 hover:text-fg"
              >
                GitHub
              </a>
            )}
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
