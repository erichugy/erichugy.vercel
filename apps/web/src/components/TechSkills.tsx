"use client";

import { TECHNICAL_SKILLS } from "@/data/about";
import {
  SKILL_ICONS,
  SKILL_COLORS,
  CATEGORY_LABELS,
} from "@/data/skills";

export default function TechSkills() {
  return (
    <div className="space-y-6">
      {Object.entries(TECHNICAL_SKILLS).map(([category, skills]) => (
        <div key={category}>
          <p className="text-xs uppercase tracking-wider text-muted mb-3 font-semibold">
            {CATEGORY_LABELS[category] ?? category}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {skills.map((skill) => {
              const Icon = SKILL_ICONS[skill];
              const color = SKILL_COLORS[skill];
              return (
                <div
                  key={skill}
                  className="bg-card rounded-xl border border-border p-3 flex flex-col items-center gap-2 text-center card-glow shadow-[0_2px_8px_rgba(12,27,33,0.06)]"
                >
                  <span className="w-8 h-8 flex items-center justify-center" aria-hidden="true">
                    {Icon ? <Icon size={28} color={color} /> : <span className="text-lg font-mono font-bold">{skill[0]}</span>}
                  </span>
                  <span className="text-xs font-mono text-body">{skill}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
