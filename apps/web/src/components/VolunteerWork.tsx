import { VOLUNTEER_WORK } from "@/lib/about-data";

export default function VolunteerWork() {
  return (
    <section className="px-6 py-20 md:py-28 bg-page">
      <div className="max-w-7xl mx-auto">
        <p className="font-mono text-sm text-muted tracking-wide mb-4">
          {">"} giving_back
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-heading mb-10">
          Volunteer Work
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {VOLUNTEER_WORK.map((item) => (
            <div
              key={item.organization}
              className="card-glow bg-card rounded-xl border border-border p-6 shadow-[0_2px_8px_rgba(12,27,33,0.06)] flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-heading">
                  {item.organization}
                </h3>
              </div>

              <p className="font-mono text-sm text-accent mb-1">{item.role}</p>
              <p className="font-mono text-xs text-muted mb-4">
                {item.duration}
              </p>

              <p className="text-body text-sm leading-relaxed mt-auto">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
