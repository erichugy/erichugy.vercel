import Link from "next/link";

import Footer from "@/components/Footer";
import KeywordCounterTool from "@/components/KeywordCounterTool";
import Navbar from "@/components/Navbar";

const PROJECTS = [
  {
    name: "Portfolio Platform",
    summary:
      "A custom Next.js portfolio with reusable sections, responsive layouts, and content managed in TypeScript data objects.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    href: "#",
  },
  {
    name: "Client Intake Automation",
    summary:
      "A form-to-workflow pipeline that validates submissions, triggers notifications, and keeps project requests organized.",
    stack: ["Node.js", "Zod", "Webhook APIs"],
    href: "#",
  },
  {
    name: "Content Publishing Dashboard",
    summary:
      "An internal dashboard for drafting, reviewing, and scheduling updates with role-based access and activity tracking.",
    stack: ["React", "PostgreSQL", "REST API"],
    href: "#",
  },
] as const;

const TOOLS = [
  {
    name: "Image Asset Optimizer",
    type: "Build Utility",
    description:
      "Compresses and normalizes image assets to improve page load performance.",
  },
  {
    name: "Project Estimator",
    type: "Planning Tool",
    description:
      "Calculates rough timelines and effort ranges from feature scope inputs.",
  },
  {
    name: "Snippet Library",
    type: "Productivity Tool",
    description:
      "Stores and reuses code snippets for common backend and frontend patterns.",
  },
] as const;

export default function ProjectsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-page">
        <section className="px-6 pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-page p-8 md:p-12">
              <p className="text-sm md:text-base uppercase tracking-[0.15em] text-muted mb-4">
                Projects and Tools
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-heading leading-tight mb-4">
                Things I have built to solve real problems
              </h1>
              <p className="text-lg text-body max-w-3xl leading-relaxed">
                This page highlights a mix of products and utilities I have created,
                from client-facing applications to internal developer tooling.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-12 md:py-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-heading mb-8">
              Featured Projects
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {PROJECTS.map((project) => (
                <article
                  key={project.name}
                  className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-heading mb-3">
                    {project.name}
                  </h3>
                  <p className="text-body leading-relaxed mb-4">{project.summary}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="text-sm px-3 py-1 rounded-full bg-page border border-border text-body"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={project.href}
                    className="inline-flex bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-lg transition-colors font-medium"
                  >
                    View Details
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-12 md:py-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-heading mb-8">
              Live Tool
            </h2>
            <KeywordCounterTool />
          </div>
        </section>

        <section className="px-6 py-12 md:py-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-heading mb-8">
              Tools I Created
            </h2>
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {TOOLS.map((tool) => (
                <article
                  key={tool.name}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <p className="text-sm uppercase tracking-[0.12em] text-muted mb-2">
                    {tool.type}
                  </p>
                  <h3 className="text-xl font-semibold text-heading mb-3">
                    {tool.name}
                  </h3>
                  <p className="text-body leading-relaxed">{tool.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
