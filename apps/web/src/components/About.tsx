import Link from "next/link";

export default function About() {
  return (
    <section id="about" className="px-6 py-20 md:py-28 bg-page">
      <div className="max-w-3xl mx-auto">
        <p className="font-mono text-sm text-muted tracking-wide mb-3">
          {">"} about_me
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-6">
          About Me
        </h2>
        <p className="text-base md:text-lg text-body leading-relaxed mb-4">
          Software engineer with experience in applied AI and enterprise
          full-stack development. Currently building integrations and
          developer tooling at Botpress, previously automating enterprise
          workflows at LIDD Consultants.
        </p>
        <p className="text-base md:text-lg text-body leading-relaxed mb-6">
          McGill CS graduate with a minor in Management (3.85 GPA).
          Bilingual in English and French. I enjoy building tools that make
          developers more productive and systems that scale.
        </p>
        <Link
          href="/about"
          scroll={true}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-accent-text px-6 py-2.5 rounded-[10px] transition-all hover:shadow-md font-semibold text-sm"
        >
          Learn More &rarr;
        </Link>
      </div>
    </section>
  );
}
