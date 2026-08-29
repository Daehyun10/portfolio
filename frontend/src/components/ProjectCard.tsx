import Link from 'next/link';
import type { Project } from '@/lib/types';

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/project/${project.slug}`}
      className="group flex flex-col justify-between border border-line bg-card p-6 transition-colors duration-150 hover:border-fg"
    >
      <div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <h3 className="display text-lg leading-snug transition-colors duration-150 group-hover:text-accent">
            {project.title}
          </h3>
          <span className="tnum order-first shrink-0 text-xs text-muted sm:order-last">{project.period}</span>
        </div>
        <p className="mt-2.5 text-sm leading-relaxed text-muted">{project.summary}</p>
      </div>

      <p className="mt-8 text-xs text-muted">{project.stack.join(' · ')}</p>
    </Link>
  );
}
