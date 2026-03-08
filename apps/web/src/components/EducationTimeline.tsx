"use client";

import { useState } from "react";

import { EDUCATION_ENTRIES } from "@/data/about";
import { SHOW_DATES } from "@/config/feature-flags";

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

export default function EducationTimeline() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="px-6 py-20 md:py-28 bg-page">
      <div className="max-w-3xl mx-auto">
        <p className="font-mono text-sm text-muted tracking-wide mb-3">
          {"// education"}
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-12">
          Education
        </h2>

        <div className="relative">
          <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-accent/30" />

          <div className="space-y-6">
            {EDUCATION_ENTRIES.map((entry, index) => {
              const isExpanded = expandedIndex === index;
              const hasExpandableContent =
                (entry.coursework && entry.coursework.length > 0) ||
                (entry.clubs && entry.clubs.length > 0) ||
                (entry.volunteer && entry.volunteer.length > 0);

              return (
                <div key={index} className="relative pl-10">
                  <div
                    className={`absolute left-0 top-[18px] w-[24px] h-[24px] rounded-full border-[2px] transition-colors duration-300 ${
                      isExpanded
                        ? "border-accent bg-accent"
                        : "border-accent bg-page"
                    }`}
                  >
                    {isExpanded && (
                      <div className="absolute inset-[4px] rounded-full bg-page" />
                    )}
                  </div>

                  <div
                    className={`card-glow bg-card rounded-xl border border-border transition-all duration-300 ${
                      isExpanded ? "shadow-sm" : ""
                    }`}
                  >
                    <button
                      onClick={() => hasExpandableContent && toggle(index)}
                      className={`w-full text-left px-5 py-4 flex items-center justify-between gap-4 ${
                        hasExpandableContent
                          ? "cursor-pointer"
                          : "cursor-default"
                      }`}
                      aria-expanded={isExpanded}
                    >
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-heading truncate">
                          {entry.school}
                        </h3>
                        <p className="text-sm text-body">
                          {entry.degree}
                          {SHOW_DATES && (
                            <span className="font-mono text-xs">
                              {" "}
                              &middot; {entry.duration}
                            </span>
                          )}
                        </p>
                        {entry.gpa && (
                          <p className="text-sm text-body mt-1">
                            <span className="font-mono text-xs text-muted">
                              GPA:
                            </span>{" "}
                            {entry.gpa}
                          </p>
                        )}
                      </div>
                      {hasExpandableContent && (
                        <span className="text-muted flex-shrink-0">
                          <ChevronIcon expanded={isExpanded} />
                        </span>
                      )}
                    </button>

                    {hasExpandableContent && (
                      <div
                        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                        style={{
                          gridTemplateRows: isExpanded ? "1fr" : "0fr",
                        }}
                      >
                        <div className="overflow-hidden">
                          <div className="px-5 pb-5">
                            <div className="border-t border-border pt-4 space-y-5">
                              {/* Awards */}
                              {entry.awards && entry.awards.length > 0 && (
                                <div>
                                  <p className="font-mono text-xs text-muted mb-2">
                                    Awards
                                  </p>
                                  <ul className="space-y-1">
                                    {entry.awards.map((award, aIndex) => (
                                      <li
                                        key={aIndex}
                                        className="flex items-start gap-2 text-sm text-body"
                                      >
                                        <span className="text-accent mt-0.5 flex-shrink-0">
                                          &bull;
                                        </span>
                                        <span>{award}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {entry.coursework &&
                                entry.coursework.length > 0 && (
                                  <div>
                                    <p className="font-mono text-xs text-muted mb-2">
                                      Coursework
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {entry.coursework.map((course) => (
                                        <span
                                          key={course}
                                          className="bg-page text-muted text-xs px-2 py-1 rounded-md font-mono"
                                        >
                                          {course}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              {entry.clubs && entry.clubs.length > 0 && (
                                <div>
                                  <p className="font-mono text-xs text-muted mb-2">
                                    Clubs &amp; Organizations
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {entry.clubs.map((club) => (
                                      <span
                                        key={club}
                                        className="bg-accent/10 text-accent text-xs px-2 py-1 rounded-md font-mono"
                                      >
                                        {club}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {entry.volunteer &&
                                entry.volunteer.length > 0 && (
                                  <div>
                                    <p className="font-mono text-xs text-muted mb-3">
                                      Volunteer &amp; Club Work
                                    </p>
                                    <div className="relative">
                                      <div className="absolute left-[7px] top-2 bottom-2 w-[1.5px] bg-accent/20" />

                                      <div className="space-y-4">
                                        {entry.volunteer.map((vol, vIndex) => (
                                          <div
                                            key={vIndex}
                                            className="relative pl-7"
                                          >
                                            <div className="absolute left-0 top-[8px] w-[16px] h-[16px] rounded-full border-[2px] border-accent/60 bg-page" />

                                            <div>
                                              <p className="text-sm font-semibold text-heading">
                                                {vol.role}
                                              </p>
                                              <p className="text-sm text-body">
                                                {vol.organization}
                                                {SHOW_DATES && (
                                                  <span className="font-mono text-xs">
                                                    {" "}
                                                    &middot; {vol.duration}
                                                  </span>
                                                )}
                                              </p>
                                              <p className="text-sm text-body mt-1 leading-relaxed">
                                                {vol.description}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
