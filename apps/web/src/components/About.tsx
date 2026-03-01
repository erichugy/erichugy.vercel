import Link from "next/link";

export default function About() {
  return (
    <section id="about" className="px-6 py-20 md:py-28 bg-page">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column - About Me */}
          <div className="space-y-5">
            <p className="font-mono text-sm text-muted tracking-wide">
              {">"} about_me
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-heading">
              About Me
            </h2>
            <p className="text-base md:text-lg text-body leading-relaxed">
              Software engineer with experience in applied AI and enterprise
              full-stack development. Currently building integrations and
              developer tooling at Botpress, previously automating enterprise
              workflows at LIDD Consultants.
            </p>
            <p className="text-base md:text-lg text-body leading-relaxed">
              McGill CS graduate with a minor in Management (3.85 GPA).
              I enjoy building tools that make developers more productive
              and systems that scale.
            </p>
          </div>

          {/* Right Column - Skills Card */}
          <div className="card-glow bg-card rounded-xl border border-border p-6 md:p-8 shadow-[0_2px_8px_rgba(12,27,33,0.06)]">
            <h2 className="text-2xl md:text-3xl font-bold text-heading mb-5">
              My Skills
            </h2>
            <ul className="space-y-3.5 mb-7">
              <li className="flex items-center gap-3 text-body text-base">
                <span className="text-accent text-xl">💻</span>
                <span>Full Stack Development</span>
              </li>
              <li className="flex items-center gap-3 text-body text-base">
                <span className="text-accent text-xl">🤖</span>
                <span>AI & Machine Learning</span>
              </li>
              <li className="flex items-center gap-3 text-body text-base">
                <span className="text-accent text-xl">🔗</span>
                <span>API & ERP Integrations</span>
              </li>
              <li className="flex items-center gap-3 text-body text-base">
                <span className="text-accent text-xl">⚡</span>
                <span>Developer Tooling</span>
              </li>
            </ul>
            <Link
              href="/about"
              className="bg-accent hover:bg-accent-hover text-accent-text px-5 py-2.5 rounded-[10px] transition-all hover:shadow-md font-semibold text-sm w-full block text-center"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
