import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: ReactNode;
  title: string;
  description: ReactNode;
  children?: ReactNode;
};

export default function PageHero({
  eyebrow,
  title,
  description,
  children,
}: PageHeroProps) {
  return (
    <section className="px-6 pt-32 pb-20 md:pt-40 md:pb-28 bg-page">
      <div className="max-w-3xl mx-auto">
        <p className="font-mono text-sm text-muted tracking-wide mb-3">
          {eyebrow}
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-heading mb-6">
          {title}
        </h1>
        <p className="text-base md:text-lg text-body leading-relaxed">
          {description}
        </p>
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  );
}
