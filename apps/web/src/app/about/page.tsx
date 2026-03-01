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
                  I&apos;m a passionate full stack developer with experience
                  creating custom websites and applications. I specialize in
                  responsive design, front-end development, and building sites
                  that are both beautiful and functional.
                </p>
                <p className="text-base md:text-lg text-body leading-relaxed">
                  With a strong foundation in computer science and a keen eye for
                  detail, I bring ideas to life through clean code and thoughtful
                  user experiences.
                </p>
              </div>

              {/* Right Column — Skills Card */}
              <div className="card-glow bg-card rounded-xl border border-border p-6 md:p-8 shadow-[0_2px_8px_rgba(12,27,33,0.06)]">
                <h2 className="text-2xl md:text-3xl font-bold text-heading mb-5">
                  My Skills
                </h2>
                <ul className="space-y-3.5">
                  <li className="flex items-center gap-3 text-body text-base">
                    <span className="text-accent text-xl">&#127912;</span>
                    <span>Web Design</span>
                  </li>
                  <li className="flex items-center gap-3 text-body text-base">
                    <span className="text-accent text-xl">&#128187;</span>
                    <span>Front-End Development</span>
                  </li>
                  <li className="flex items-center gap-3 text-body text-base">
                    <span className="text-accent text-xl">&#128241;</span>
                    <span>Responsive Design</span>
                  </li>
                  <li className="flex items-center gap-3 text-body text-base">
                    <span className="text-accent text-xl">&#9889;</span>
                    <span>Performance Optimization</span>
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

        {/* Activities — Worker 3 */}
      </main>
      <Footer />
    </>
  );
}
