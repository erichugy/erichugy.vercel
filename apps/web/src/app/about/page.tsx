import Activities from "@/components/Activities";
import EducationTimeline from "@/components/EducationTimeline";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import TechSkills from "@/components/TechSkills";
import WorkExperience from "@/components/WorkExperience";
import { CERTIFICATIONS, LANGUAGES, SHOW_DATES } from "@/lib/about-data";

export const metadata = {
  title: "About Me | Eric Huang",
  description:
    "Learn more about my experience, skills, education, and activities.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero / Intro — extra top padding to clear sticky navbar */}
        <section className="px-6 pt-32 pb-20 md:pt-40 md:pb-28 bg-page">
          <div className="max-w-3xl mx-auto">
            <p className="font-mono text-sm text-muted tracking-wide mb-3">
              {">"} about_me
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-heading mb-6">
              About Me
            </h1>
            <p className="text-base md:text-lg text-body leading-relaxed mb-4">
              Software engineer with experience in applied AI and enterprise
              full-stack development. Currently building integrations and
              developer tooling at Botpress, previously automating enterprise
              workflows at LIDD Consultants.
            </p>
            <p className="text-base md:text-lg text-body leading-relaxed mb-4">
              McGill CS graduate with a minor in Management (3.85 GPA).
              Bilingual in English and French. I enjoy building tools that make
              developers more productive and systems that scale.
            </p>
            <p className="text-sm text-body mb-6">
              {LANGUAGES.map((lang, i) => (
                <span key={lang.name}>
                  {i > 0 && " \u00b7 "}
                  {lang.name} ({lang.level})
                </span>
              ))}
            </p>
            <a
              href="/Eric_Huang_Software-can.pdf"
              download
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-accent-text px-6 py-2.5 rounded-[10px] transition-all hover:shadow-md font-semibold text-sm"
            >
              📄 Download Resume
            </a>
          </div>
        </section>

        {/* Work Experience Timeline */}
        <WorkExperience />

        {/* Education & Volunteer Timeline */}
        <EducationTimeline />

        {/* Technical Skills */}
        <section className="px-6 py-20 md:py-28 bg-page-alt">
          <div className="max-w-3xl mx-auto">
            <p className="font-mono text-sm text-muted tracking-wide mb-3">
              {"// skills"}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-10">
              Skills
            </h2>

            <TechSkills />

          </div>
        </section>

        {/* Certifications */}
        <section className="px-6 py-20 md:py-28 bg-page">
          <div className="max-w-3xl mx-auto">
            <p className="font-mono text-sm text-muted tracking-wide mb-3">
              {"// certifications"}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-10">
              Certifications
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {CERTIFICATIONS.map((cert) => (
                <div
                  key={cert.name}
                  className="card-glow bg-card rounded-xl border border-border p-5 shadow-[0_2px_8px_rgba(12,27,33,0.06)]"
                >
                  <h3 className="text-sm font-semibold text-heading mb-1">
                    {cert.name}
                  </h3>
                  <p className="text-xs text-muted font-mono">
                    {cert.issuer}
                    {SHOW_DATES && <span> &middot; {cert.date}</span>}
                  </p>
                  {cert.credentialId && (
                    <p className="text-xs text-muted mt-1">
                      ID: {cert.credentialId}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Activities & Interests */}
        <Activities />
      </main>
      <Footer />
    </>
  );
}
