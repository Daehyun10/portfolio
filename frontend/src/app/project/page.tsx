import Editable from '@/components/Editable';
import Footer from '@/components/Footer';
import ProjectComposer from '@/components/ProjectComposer';
import ProjectGrid from '@/components/ProjectGrid';
import { getProjects } from '@/lib/api';

export const metadata = { title: 'Project | 포트폴리오' };

export default async function ProjectListPage() {
  const projects = await getProjects();

  return (
    <main>
      <section className="mx-auto max-w-5xl px-6 pt-28">
        <Editable id="project.eyebrow" as="p" className="text-xs tracking-[0.2em] text-muted" />
        <Editable
          id="project.headline"
          as="h1"
          className="display mt-5 block max-w-[18ch] text-3xl leading-tight sm:text-4xl"
        />
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <ProjectComposer />

        {projects.length === 0 ? (
          <Editable
            id="project.empty"
            as="p"
            className="block border-t border-line py-10 text-sm text-muted"
          />
        ) : (
          <ProjectGrid projects={projects} />
        )}
      </section>

      <Footer />
    </main>
  );
}
