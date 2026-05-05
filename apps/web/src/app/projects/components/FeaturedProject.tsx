import Image from "next/image";
import Link from "next/link";

import TechPill from "@/components/TechPill";
import type { Project } from "@/data/projects";
import { isExternalHref } from "@/utils/url";

type FeaturedProjectProps = {
  project: Project;
};

export default function FeaturedProject({ project }: FeaturedProjectProps) {
  return (
    <div className="card-glow overflow-hidden rounded-xl border border-border bg-card shadow-[0_2px_8px_rgba(12,27,33,0.06)]">
      <div className="grid md:grid-cols-2">
        {project.image ? (
          <div className="relative h-56 overflow-hidden bg-white md:h-auto">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-contain p-6"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ) : (
          <div
            className={`flex h-56 items-center justify-center text-7xl md:h-auto ${project.imageBackgroundClassName}`}
            aria-hidden="true"
          >
            {project.emoji ? (
              <span className="select-none opacity-80 drop-shadow-lg">
                {project.emoji}
              </span>
            ) : null}
          </div>
        )}

        <div className="flex flex-col p-6 md:p-8">
          <h3 className="mb-3 text-2xl font-bold text-heading md:text-3xl">
            {project.title}
          </h3>
          <p className="mb-5 flex-1 text-sm leading-relaxed text-body md:text-base">
            {project.longDescription}
          </p>

          <div className="mb-6 flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <TechPill key={tech} label={tech} />
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={project.primaryCtaHref}
              className="inline-flex items-center justify-center rounded-[10px] bg-accent px-6 py-2.5 text-sm font-semibold text-accent-text transition-all hover:bg-accent-hover hover:shadow-md"
              {...(isExternalHref(project.primaryCtaHref)
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {project.primaryCtaLabel}
            </Link>

            {project.secondaryCtaLabel && project.secondaryCtaHref ? (
              <Link
                href={project.secondaryCtaHref}
                className="inline-flex items-center justify-center rounded-[10px] border border-border bg-page px-6 py-2.5 text-sm font-medium text-heading transition-all hover:bg-card hover:shadow-sm"
                {...(isExternalHref(project.secondaryCtaHref)
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {project.secondaryCtaLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
