"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { SHOW_FEATURED_PROJECTS } from "@/config/feature-flags";
import { PROJECTS } from "@/data/projects";

import WorkInProgress from "./WorkInProgress";

const AUTOPLAY_DELAY_MS = 4500;

type CardPosition = "active" | "previous" | "next" | "hidden";

const CARD_POSITION_CLASSNAME: Record<CardPosition, string> = {
  active:
    "z-30 translate-x-0 scale-100 opacity-100 shadow-[0_20px_40px_rgba(12,27,33,0.18)]",
  previous:
    "z-20 -translate-x-[34%] scale-[0.9] opacity-90 shadow-[0_14px_30px_rgba(12,27,33,0.12)] max-[535px]:translate-x-0 max-[535px]:opacity-0 max-[535px]:pointer-events-none",
  next:
    "z-20 translate-x-[34%] scale-[0.9] opacity-90 shadow-[0_14px_30px_rgba(12,27,33,0.12)] max-[535px]:translate-x-0 max-[535px]:opacity-0 max-[535px]:pointer-events-none",
  hidden: "z-10 scale-[0.75] opacity-0 pointer-events-none",
};

const getCardPosition = (
  cardIndex: number,
  activeIndex: number,
  totalProjects: number,
): CardPosition => {
  const offset = (cardIndex - activeIndex + totalProjects) % totalProjects;

  if (offset === 0) {
    return "active";
  }

  if (offset === 1) {
    return "next";
  }

  if (offset === totalProjects - 1) {
    return "previous";
  }

  return "hidden";
};

export default function FeaturedProjects(): React.JSX.Element | null {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (!SHOW_FEATURED_PROJECTS || isPaused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex(
        (previousIndex) => (previousIndex + 1) % PROJECTS.length,
      );
    }, AUTOPLAY_DELAY_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isPaused]);

  if (!SHOW_FEATURED_PROJECTS) {
    return (
      <section id="portfolio" className="px-6 py-20 md:py-28 bg-page">
        <div className="max-w-7xl mx-auto">
          <WorkInProgress />
        </div>
      </section>
    );
  }

  const goToPreviousProject = (): void => {
    setActiveIndex(
      (previousIndex) =>
        (previousIndex - 1 + PROJECTS.length) % PROJECTS.length,
    );
  };

  const goToNextProject = (): void => {
    setActiveIndex(
      (previousIndex) => (previousIndex + 1) % PROJECTS.length,
    );
  };

  const activeProject = PROJECTS[activeIndex];
  if (!activeProject) return null;

  return (
    <section id="portfolio" className="px-6 py-20 md:py-28 bg-page">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <p className="font-mono text-sm text-muted tracking-wide mb-3">
            {"< projects />"}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-3">
            Featured Projects
          </h2>
          <p className="text-base md:text-lg text-muted max-w-2xl mx-auto">
            A few things I have built in a seamless rotating showcase.
          </p>
        </div>

        <div
          className="max-w-3xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative mx-auto w-full h-[min(80vw,20rem)] min-[536px]:h-[28rem]">
            {PROJECTS.map((project, index) => {
              const position = getCardPosition(
                index,
                activeIndex,
                PROJECTS.length,
              );

              return (
                <button
                  key={project.title}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show ${project.title}`}
                  className={`absolute left-0 right-0 top-1/2 mx-auto w-[min(80vw,20rem)] min-[536px]:w-[56%] max-w-[28rem] aspect-square -translate-y-1/2 overflow-hidden rounded-[1.25rem] border border-border transition-all duration-500 ease-out ${
                    CARD_POSITION_CLASSNAME[position]
                  }`}
                >
                  <div
                    className={`relative w-full h-full ${project.imageBackgroundClassName}`}
                  >
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 80vw, 320px"
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="card-glow relative mt-8 rounded-xl border border-border bg-card p-5 md:p-7 shadow-[0_2px_8px_rgba(12,27,33,0.06)]">
            <div className="pointer-events-none absolute left-4 right-4 top-4 flex justify-between">
              <button
                type="button"
                aria-label="View previous project"
                onClick={goToPreviousProject}
                className="pointer-events-auto h-8 w-8 rounded-full border border-border bg-page text-heading text-lg leading-none transition-all hover:scale-105 hover:shadow-sm"
              >
                &#8249;
              </button>
              <button
                type="button"
                aria-label="View next project"
                onClick={goToNextProject}
                className="pointer-events-auto h-8 w-8 rounded-full border border-border bg-page text-heading text-lg leading-none transition-all hover:scale-105 hover:shadow-sm"
              >
                &#8250;
              </button>
            </div>

            <div className="pt-9">
              <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted mb-2 font-medium">
                Project {activeIndex + 1} of {PROJECTS.length}
              </p>
              <h3 className="text-xl md:text-2xl font-semibold text-heading mb-2">
                {activeProject.title}
              </h3>
              <p className="text-body text-sm md:text-base leading-relaxed">{activeProject.description}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">
                <Link
                  href={activeProject.primaryCtaHref}
                  className="inline-flex items-center justify-center bg-accent hover:bg-accent-hover text-accent-text px-5 py-2 rounded-[10px] transition-all hover:shadow-md font-semibold text-sm"
                >
                  {activeProject.primaryCtaLabel}
                </Link>
                <Link
                  href={activeProject.secondaryCtaHref}
                  className="inline-flex items-center justify-center border border-border bg-page text-heading px-5 py-2 rounded-[10px] transition-all font-medium text-sm hover:bg-card hover:shadow-sm"
                >
                  {activeProject.secondaryCtaLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {PROJECTS.map((project, index) => (
            <button
              key={project.title}
              type="button"
              aria-label={`Go to ${project.title}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex
                  ? "w-6 bg-accent"
                  : "w-2 bg-border hover:bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
