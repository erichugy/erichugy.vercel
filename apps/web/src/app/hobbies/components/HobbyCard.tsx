import type { Hobby } from "@/data/hobbies";

type HobbyCardProps = {
  hobby: Hobby;
};

export default function HobbyCard({ hobby }: HobbyCardProps) {
  return (
    <div className="card-glow flex flex-col gap-5 rounded-xl border border-border bg-card p-5 shadow-[0_2px_8px_rgba(12,27,33,0.06)]">
      <div
        className={`flex h-24 w-full items-center justify-center rounded-lg bg-gradient-to-br ${hobby.gradient}`}
      >
        <span className="text-5xl leading-none" role="img" aria-label={hobby.title}>
          {hobby.icon}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-semibold text-heading">{hobby.title}</h3>
        <p className="text-sm leading-relaxed text-body">{hobby.description}</p>

        <ul className="mt-1 flex flex-col gap-2">
          {hobby.details.map((detail) => (
            <li
              key={detail}
              className="flex items-start gap-2 text-sm text-muted"
            >
              <span className="mt-0.5 shrink-0 text-accent">&bull;</span>
              {detail}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
