import Activities from "@/components/Activities";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import VolunteerWork from "@/components/VolunteerWork";
import WorkExperience from "@/components/WorkExperience";

export const metadata = {
  title: "About Me | Eric Huang",
  description:
    "Learn more about my experience, skills, volunteer work, and activities.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero / Intro */}
        <section className="px-6 py-20 md:py-28 bg-page">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
              {/* Left Column — Bio */}
              <div className="space-y-5">
                <p className="font-mono text-sm text-muted tracking-wide">
                  {">"} about_me
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-heading">
                  About Me
                </h1>
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

              {/* Right Column — Skills Card */}
              <div className="card-glow bg-card rounded-xl border border-border p-6 md:p-8 shadow-[0_2px_8px_rgba(12,27,33,0.06)]">
                <h2 className="text-2xl md:text-3xl font-bold text-heading mb-5">
                  My Skills
                </h2>
                <ul className="space-y-3.5">
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
              </div>
            </div>
          </div>
        </section>

        {/* Work Experience Timeline */}
        <WorkExperience />

        {/* Volunteer Work */}
        <VolunteerWork />

        {/* Activities & Interests */}
        <Activities />
      </main>
      <Footer />
    </>
  );
}
