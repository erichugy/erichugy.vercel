import Link from "next/link";

import TechPill from "@/components/TechPill";
import type { Tool } from "@/data/tools";
import { isExternalHref } from "@/utils/url";

type ToolCardProps = {
  tool: Tool;
};

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <div className="card-glow flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[0_2px_8px_rgba(12,27,33,0.06)]">
      <div
        className={`flex items-center justify-center bg-gradient-to-br px-6 py-10 ${tool.gradient}`}
      >
        <span className="text-6xl" role="img" aria-label={tool.title}>
          {tool.icon}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h2 className="mb-2 text-xl font-bold text-heading">{tool.title}</h2>
        <p className="mb-4 text-sm leading-relaxed text-body">
          {tool.description}
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          {tool.techStack.map((tech) => (
            <TechPill key={tech} label={tech} />
          ))}
        </div>

        <div className="mt-auto">
          <Link
            href={tool.href}
            className="inline-flex items-center justify-center rounded-[10px] bg-accent px-6 py-2.5 text-sm font-semibold text-accent-text transition-all hover:bg-accent-hover hover:shadow-md"
            {...(isExternalHref(tool.href)
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            Try it →
          </Link>
        </div>
      </div>
    </div>
  );
}
