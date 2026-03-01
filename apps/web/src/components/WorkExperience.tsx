"use client";

import { useState } from "react";
import { WORK_EXPERIENCES } from "@/lib/about-data";

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

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[11px] md:left-[11px] top-2 bottom-2 w-[2px] bg-border" />

          <div className="space-y-6">
            {WORK_EXPERIENCES.map((exp, index) => {
              const isExpanded = expandedIndex === index;

              return (
                <div key={index} className="relative pl-10">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-0 top-[18px] w-[24px] h-[24px] rounded-full border-[2px] transition-colors duration-300 ${
                      isExpanded
                        ? "border-accent bg-accent"
                        : "border-accent bg-page-alt"
                    }`}
                  >
                    {isExpanded && (
                      <div className="absolute inset-[4px] rounded-full bg-page-alt" />
                    )}
                  </div>

                  {/* Card */}
                  <div
                    className={`card-glow bg-card rounded-xl border border-border transition-all duration-300 ${
                      isExpanded ? "shadow-sm" : ""
                    }`}
                  >
                    {/* Header - always visible, clickable */}
                    <button
                      onClick={() => toggle(index)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer"
                      aria-expanded={isExpanded}
                    >
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-heading truncate">
                          {exp.company}
                        </h3>
                        <p className="text-sm text-muted">
                          {exp.position}{" "}
                          <span className="font-mono text-xs">
                            &middot; {exp.duration}
                          </span>
                        </p>
                      </div>
                      <span className="text-muted flex-shrink-0">
                        <ChevronIcon expanded={isExpanded} />
                      </span>
                    </button>

                    {/* Expandable content */}
                    <div
                      className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                      style={{
                        gridTemplateRows: isExpanded ? "1fr" : "0fr",
                      }}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 pb-5">
                          <div className="border-t border-border pt-4 space-y-4">
                            {/* Description */}
                            <p className="text-body text-sm leading-relaxed">
                              {exp.description}
                            </p>

                            {/* Highlights */}
                            <ul className="space-y-2">
                              {exp.highlights.map((highlight, hIndex) => (
                                <li
                                  key={hIndex}
                                  className="flex items-start gap-2 text-sm text-body"
                                >
                                  <span className="text-accent mt-1 flex-shrink-0">
                                    &bull;
                                  </span>
                                  <span>{highlight}</span>
                                </li>
                              ))}
                            </ul>

                            {/* Tech stack tags */}
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
