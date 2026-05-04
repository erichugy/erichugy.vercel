import { LANGUAGES } from "@/data/about";

export default function Intro() {
  return (
    <section className="px-6 pt-32 pb-20 md:pt-40 md:pb-28 bg-page">
      <div className="max-w-3xl mx-auto">
        <p className="font-mono text-sm text-muted tracking-wide mb-3">
          {">"} experience
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-heading mb-6">
          Experience
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
        <p className="text-sm text-body">
          {LANGUAGES.map((lang, index) => (
            <span key={lang.name}>
              {index > 0 && " \u00b7 "}
              {lang.name} ({lang.level})
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
