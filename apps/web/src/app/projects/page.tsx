import Link from "next/link";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { PROJECTS, type Project } from "@/data/projects";

export const metadata = {
  title: "Projects | Eric Huang",
  description:
    "Things I've built — from hackathon wins to research papers.",
};

function TechPill({ label }: { label: string }) {
  return (
    <span className="inline-block bg-page-alt text-muted text-xs font-mono px-2.5 py-1 rounded-full">
      {label}
    </span>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="card-glow bg-card rounded-xl border border-border shadow-[0_2px_8px_rgba(12,27,33,0.06)] overflow-hidden flex flex-col">
      <div
        className={`h-40 flex items-center justify-center text-5xl ${project.imageBackgroundClassName}`}
        aria-hidden="true"
      >
        {project.title === "Stock Sentiment Analyzer" && (
          <span className="opacity-80 drop-shadow-md select-none">📈</span>
        )}
        {project.title === "Distributed RL Path-Finding" && (
          <span className="opacity-80 drop-shadow-md select-none">🧠</span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-heading mb-2">
          {project.title}
        </h3>
        <p className="text-sm text-body leading-relaxed mb-4 flex-1">
          {project.longDescription}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.techStack.map((tech) => (
            <TechPill key={tech} label={tech} />
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={project.primaryCtaHref}
            className="inline-flex items-center justify-center bg-accent hover:bg-accent-hover text-accent-text px-5 py-2 rounded-[10px] transition-all hover:shadow-md font-semibold text-sm"
          >
            {project.primaryCtaLabel}
          </Link>
          {project.secondaryCtaLabel && project.secondaryCtaHref && (
            <Link
              href={project.secondaryCtaHref}
              className="inline-flex items-center justify-center border border-border bg-page text-heading px-5 py-2 rounded-[10px] transition-all font-medium text-sm hover:bg-card hover:shadow-sm"
            >
              {project.secondaryCtaLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const featuredProject = PROJECTS.find((p) => p.featured);
  const otherProjects = PROJECTS.filter((p) => !p.featured);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="px-6 pt-32 pb-20 md:pt-40 md:pb-28 bg-page">
          <div className="max-w-3xl mx-auto">
            <p className="font-mono text-sm text-muted tracking-wide mb-3">
              {"// projects"}
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-heading mb-6">
              Projects
            </h1>
            <p className="text-base md:text-lg text-body leading-relaxed">
              {"Things I've built \u2014 from hackathon wins to research papers."}
            </p>
          </div>
        </section>

        {/* Featured Project */}
        {featuredProject && (
          <section className="px-6 py-20 md:py-28 bg-page-alt">
            <div className="max-w-5xl mx-auto">
              <p className="font-mono text-sm text-muted tracking-wide mb-3">
                {"// featured"}
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-10">
                Featured Project
              </h2>

              <div className="card-glow bg-card rounded-xl border border-border shadow-[0_2px_8px_rgba(12,27,33,0.06)] overflow-hidden">
                <div className="grid md:grid-cols-2">
                  <div
                    className={`h-56 md:h-auto flex items-center justify-center text-7xl ${featuredProject.imageBackgroundClassName}`}
                    aria-hidden="true"
                  >
                    <span className="opacity-80 drop-shadow-lg select-none">
                      🃏
                    </span>
                  </div>

                  <div className="p-6 md:p-8 flex flex-col">
                    <h3 className="text-2xl md:text-3xl font-bold text-heading mb-3">
                      {featuredProject.title}
                    </h3>
                    <p className="text-sm md:text-base text-body leading-relaxed mb-5 flex-1">
                      {featuredProject.longDescription}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {featuredProject.techStack.map((tech) => (
                        <TechPill key={tech} label={tech} />
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={featuredProject.primaryCtaHref}
                        className="inline-flex items-center justify-center bg-accent hover:bg-accent-hover text-accent-text px-6 py-2.5 rounded-[10px] transition-all hover:shadow-md font-semibold text-sm"
                      >
                        {featuredProject.primaryCtaLabel}
                      </Link>
                      {featuredProject.secondaryCtaLabel &&
                        featuredProject.secondaryCtaHref && (
                          <Link
                            href={featuredProject.secondaryCtaHref}
                            className="inline-flex items-center justify-center border border-border bg-page text-heading px-6 py-2.5 rounded-[10px] transition-all font-medium text-sm hover:bg-card hover:shadow-sm"
                          >
                            {featuredProject.secondaryCtaLabel}
                          </Link>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Project Grid */}
        <section className="px-6 py-20 md:py-28 bg-page">
          <div className="max-w-5xl mx-auto">
            <p className="font-mono text-sm text-muted tracking-wide mb-3">
              {"// more_projects"}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-10">
              More Projects
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {otherProjects.map((project) => (
                <ProjectCard key={project.title} project={project} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
