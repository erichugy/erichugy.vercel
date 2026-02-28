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
              I&apos;m a passionate full stack developer with experience creating custom
              websites and applications. I specialize in responsive design,
              front-end development, and building sites that are both beautiful
              and functional.
            </p>
            <p className="text-base md:text-lg text-body leading-relaxed">
              With a strong foundation in computer science and a keen eye for
              detail, I bring ideas to life through clean code and thoughtful
              user experiences.
            </p>
          </div>

          {/* Right Column - Skills Card */}
          <div className="card-glow bg-card rounded-xl border border-border p-6 md:p-8 shadow-[0_2px_8px_rgba(12,27,33,0.06)]">
            <h2 className="text-2xl md:text-3xl font-bold text-heading mb-5">
              My Skills
            </h2>
            <ul className="space-y-3.5 mb-7">
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
            <button className="bg-accent hover:bg-accent-hover text-accent-text px-5 py-2.5 rounded-[10px] transition-all hover:shadow-md font-semibold text-sm w-full">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
