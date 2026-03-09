import Link from "next/link";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { TOOLS } from "@/data/tools";

export const metadata = {
  title: "Tools | Eric Huang",
  description:
    "Interactive developer tools built by Eric Huang — try them live.",
};

export default function ToolsPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="px-6 pt-32 pb-20 md:pt-40 md:pb-28 bg-page">
          <div className="max-w-3xl mx-auto">
            <p className="font-mono text-sm text-muted tracking-wide mb-3">
              {"// tools"}
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-heading mb-6">
              Tools
            </h1>
            <p className="text-base md:text-lg text-body leading-relaxed">
              Interactive developer tools I&apos;ve built — try them live.
            </p>
          </div>
        </section>

        <section className="px-6 py-20 md:py-28 bg-page-alt">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {TOOLS.map((tool) => (
                <div
                  key={tool.title}
                  className="card-glow bg-card rounded-xl border border-border shadow-[0_2px_8px_rgba(12,27,33,0.06)] overflow-hidden flex flex-col"
                >
                  <div
                    className={`bg-gradient-to-br ${tool.gradient} px-6 py-10 flex items-center justify-center`}
                  >
                    <span className="text-6xl" role="img" aria-label={tool.title}>
                      {tool.icon}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="text-xl font-bold text-heading mb-2">
                      {tool.title}
                    </h2>
                    <p className="text-sm text-body leading-relaxed mb-4">
                      {tool.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {tool.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="font-mono text-xs text-muted bg-page-alt px-2.5 py-1 rounded-full border border-border"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto">
                      <Link
                        href={tool.href}
                        className="inline-flex items-center justify-center bg-accent hover:bg-accent-hover text-accent-text px-6 py-2.5 rounded-[10px] transition-all hover:shadow-md font-semibold text-sm"
                      >
                        Try it &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
