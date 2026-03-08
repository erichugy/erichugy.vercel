import { ACTIVITIES } from "@/data/about";

export default function Activities() {
  return (
    <section className="px-6 py-20 md:py-28 bg-page-alt">
      <div className="max-w-7xl mx-auto">
        <p className="font-mono text-sm text-muted tracking-wide mb-3">
          {"// outside_work"}
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-10">
          Activities &amp; Interests
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ACTIVITIES.map((activity) => (
            <div
              key={activity.title}
              className="card-glow bg-card rounded-xl border border-border p-6 flex flex-col gap-4"
            >
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-3xl leading-none" role="img" aria-label={activity.title}>
                  {activity.icon}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-heading">
                {activity.title}
              </h3>
              <p className="text-sm text-body leading-relaxed">
                {activity.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
