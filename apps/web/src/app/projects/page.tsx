import Footer from "@/components/Footer";
import Navbar from "@/components/navbar";
import PageHero from "@/components/PageHero";
import { PROJECTS } from "@/data/projects";

import FeaturedProject from "./components/FeaturedProject";
import ProjectCard from "./components/ProjectCard";

export const metadata = {
  title: "Projects | Eric Huang",
  description: "Things I've built — from hackathon wins to research papers.",
};

export default function ProjectsPage() {
  const featuredProject = PROJECTS.find((project) => project.featured);
  const otherProjects = PROJECTS.filter((project) => !project.featured);

  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="// projects"
          title="Projects"
          description="Things I've built — from hackathon wins to research papers."
        />

        {featuredProject ? (
          <section className="px-6 py-20 md:py-28 bg-page-alt">
            <div className="max-w-5xl mx-auto">
              <p className="font-mono text-sm text-muted tracking-wide mb-3">
                {"// featured"}
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-10">
                Featured Project
              </h2>
              <FeaturedProject project={featuredProject} />
            </div>
          </section>
        ) : null}

        <section className="px-6 py-20 md:py-28 bg-page">
          <div className="max-w-5xl mx-auto">
            <p className="font-mono text-sm text-muted tracking-wide mb-3">
              {"// more_projects"}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-10">
              More Projects
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
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
