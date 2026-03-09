import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { HOBBIES } from "@/data/hobbies";

export const metadata = {
  title: "Hobbies & Interests | Eric Huang",
  description:
    "Beyond code — rock climbing, photography, open source, and AI research.",
};

export default function HobbiesPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="px-6 pt-32 pb-20 md:pt-40 md:pb-28 bg-page">
          <div className="max-w-3xl mx-auto">
            <p className="font-mono text-sm text-muted tracking-wide mb-3">
              {"// beyond_code"}
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-heading mb-6">
              Hobbies &amp; Interests
            </h1>
            <p className="text-base md:text-lg text-body leading-relaxed">
              When I&apos;m not writing code, you&apos;ll find me solving
              problems on the climbing wall, chasing golden hour with a camera,
              or diving into the latest AI research.
            </p>
          </div>
        </section>

        <section className="px-6 py-20 md:py-28 bg-page-alt">
          <div className="max-w-5xl mx-auto">
            <p className="font-mono text-sm text-muted tracking-wide mb-3">
              {"// what_i_enjoy"}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-3">
              Things I Love
            </h2>
            <p className="text-base md:text-lg text-muted max-w-2xl mb-12">
              A mix of physical challenges, creative outlets, and technical
              rabbit holes that keep me curious.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {HOBBIES.map((hobby) => (
                <div
                  key={hobby.title}
                  className="card-glow bg-card rounded-xl border border-border p-5 shadow-[0_2px_8px_rgba(12,27,33,0.06)] flex flex-col gap-5"
                >
                  <div
                    className={`w-full h-24 rounded-lg bg-gradient-to-br ${hobby.gradient} flex items-center justify-center`}
                  >
                    <span
                      className="text-5xl leading-none"
                      role="img"
                      aria-label={hobby.title}
                    >
                      {hobby.icon}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h3 className="text-xl font-semibold text-heading">
                      {hobby.title}
                    </h3>
                    <p className="text-sm text-body leading-relaxed">
                      {hobby.description}
                    </p>

                    <ul className="flex flex-col gap-2 mt-1">
                      {hobby.details.map((detail) => (
                        <li
                          key={detail}
                          className="text-sm text-muted flex items-start gap-2"
                        >
                          <span className="text-accent mt-0.5 shrink-0">
                            &bull;
                          </span>
                          {detail}
                        </li>
                      ))}
                    </ul>
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
