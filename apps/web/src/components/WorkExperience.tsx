"use client";

import { useState } from "react";
import { type WorkExperience as WorkExp, WORK_EXPERIENCES } from "@/data/about";

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TimelineDot({ isExpanded, bg }: { isExpanded: boolean; bg: string }) {
  return (
    <div
      className={`relative flex-shrink-0 w-[24px] h-[24px] rounded-full border-[2px] transition-colors duration-300 ${
        isExpanded ? "border-accent bg-accent" : `border-accent ${bg}`
      }`}
    >
      {isExpanded && (
        <div className={`absolute inset-[4px] rounded-full ${bg}`} />
      )}
    </div>
  );
}

function WorkCard({
  exp,
  isExpanded,
  onToggle,
}: {
  exp: WorkExp;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`card-glow bg-card rounded-xl border border-border transition-all duration-300 ${
        isExpanded ? "shadow-sm" : ""
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer"
        aria-expanded={isExpanded}
      >
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-heading truncate">
            {exp.company}
          </h3>
          <p className="text-sm text-body">{exp.position}</p>
        </div>
        <span className="text-muted flex-shrink-0">
          <ChevronIcon expanded={isExpanded} />
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5">
            <div className="border-t border-border pt-4 space-y-4">
              <ul className="space-y-2">
                {[exp.description, ...exp.highlights].map((text, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-body"
                  >
                    <span className="text-accent mt-1 flex-shrink-0">
                      &bull;
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2 pt-1">
                {exp.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="bg-page text-muted text-xs px-2 py-1 rounded-md font-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkExperience() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="px-6 py-20 md:py-28 bg-page-alt">
      <div className="max-w-3xl mx-auto">
        <p className="font-mono text-sm text-muted tracking-wide mb-3">
          {">"} work_experience
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-12">
          Experience
        </h2>

        <div className="relative">
          {/* Continuous vertical line (desktop only) */}
          <div className="hidden md:block absolute left-[120px] ml-[27px] top-[30px] bottom-[30px] w-[2px] bg-border" />

          {/* Continuous vertical line (mobile only — offsets derived from 24px TimelineDot) */}
          <div className="md:hidden absolute left-[11px] top-[12px] bottom-[12px] w-[2px] bg-border" />

          <div className="space-y-6">
            {WORK_EXPERIENCES.map((exp, index) => {
              const isExpanded = expandedIndex === index;

              return (
                <div key={index}>
                  {/* Mobile layout: date + dot row, then card */}
                  <div className="md:hidden relative pl-10">
                    {/* 36px = date label line-height + mb-2 spacing */}
                    <div className="absolute left-0 top-[36px]">
                      <TimelineDot isExpanded={isExpanded} bg="bg-page-alt" />
                    </div>
                    <div className="mb-2 pt-0.5">
                      <span className="font-mono text-xs text-muted">
                        {exp.duration}
                      </span>
                    </div>
                    <WorkCard
                      exp={exp}
                      isExpanded={isExpanded}
                      onToggle={() => toggle(index)}
                    />
                  </div>

                  {/* Desktop layout: date | dot+line | card */}
                  <div className="hidden md:grid md:grid-cols-[120px_24px_1fr] md:gap-x-4">
                    <div className="font-mono text-xs text-muted pt-[18px] text-right leading-snug">
                      {exp.duration}
                    </div>
                    <div className="relative flex flex-col items-center z-10">
                      <div className="mt-[18px]">
                        <TimelineDot isExpanded={isExpanded} bg="bg-page-alt" />
                      </div>
                    </div>
                    <WorkCard
                      exp={exp}
                      isExpanded={isExpanded}
                      onToggle={() => toggle(index)}
                    />
                  </div>
                </div>
              );
          })}
          </div>
        </div>
      </div>
    </section>
  );
}
