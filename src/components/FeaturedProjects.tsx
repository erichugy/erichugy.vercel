"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Project = {
  title: string;
  description: string;
  image: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  imageBackgroundClassName: string;
};

const PROJECTS: readonly Project[] = [
  {
    title: "Business Website",
    description:
      "A professional website designed for a growing company to showcase their services and connect with customers.",
    image: "/inspiration.png",
    primaryCtaLabel: "Visit Site",
    primaryCtaHref: "/projects",
    secondaryCtaLabel: "View Code",
    secondaryCtaHref: "/projects",
    imageBackgroundClassName: "bg-[#F1E4C8]",
  },
  {
    title: "E-commerce Site",
    description:
      "A fully functional online store built for a fashion brand with seamless checkout and inventory management.",
    image: "/inspiration.png",
    primaryCtaLabel: "Shop Demo",
    primaryCtaHref: "/projects",
    secondaryCtaLabel: "View Code",
    secondaryCtaHref: "/projects",
    imageBackgroundClassName: "bg-[#DCEAF4]",
  },
  {
    title: "Portfolio Website",
    description:
      "A creative and visually appealing portfolio website for a photographer to display their work.",
    image: "/inspiration.png",
    primaryCtaLabel: "View Project",
    primaryCtaHref: "/projects",
    secondaryCtaLabel: "View Code",
    secondaryCtaHref: "/projects",
    imageBackgroundClassName: "bg-[#E8E0F1]",
  },
];

const AUTOPLAY_DELAY_MS = 4500;

type CardPosition = "active" | "previous" | "next" | "hidden";

const CARD_POSITION_CLASSNAME: Record<CardPosition, string> = {
  active:
    "z-30 translate-x-0 scale-100 opacity-100 shadow-[0_24px_45px_rgba(0,0,0,0.34)]",
  previous:
    "z-20 -translate-x-[34%] scale-[0.9] opacity-90 shadow-[0_18px_35px_rgba(0,0,0,0.25)] max-[535px]:translate-x-0 max-[535px]:opacity-0 max-[535px]:pointer-events-none",
  next:
    "z-20 translate-x-[34%] scale-[0.9] opacity-90 shadow-[0_18px_35px_rgba(0,0,0,0.25)] max-[535px]:translate-x-0 max-[535px]:opacity-0 max-[535px]:pointer-events-none",
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

export default function FeaturedProjects(): JSX.Element {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (isPaused) {
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

  return (
    <section id="portfolio" className="px-6 py-16 md:py-24 bg-page">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-4">
            Featured Projects
          </h2>
          <p className="text-lg text-body max-w-2xl mx-auto">
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
                  className={`absolute left-0 right-0 top-1/2 mx-auto w-[min(80vw,20rem)] min-[536px]:w-[56%] max-w-[28rem] aspect-square -translate-y-1/2 overflow-hidden rounded-[1.75rem] border border-border transition-all duration-500 ease-out ${
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

          <div className="relative mt-8 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <div className="pointer-events-none absolute left-4 right-4 top-4 flex justify-between">
              <button
                type="button"
                aria-label="View previous project"
                onClick={goToPreviousProject}
                className="pointer-events-auto h-9 w-9 rounded-full border border-border bg-page text-heading text-xl leading-none transition-transform hover:scale-110"
              >
                &#8249;
              </button>
              <button
                type="button"
                aria-label="View next project"
                onClick={goToNextProject}
                className="pointer-events-auto h-9 w-9 rounded-full border border-border bg-page text-heading text-xl leading-none transition-transform hover:scale-110"
              >
                &#8250;
              </button>
            </div>

            <div className="pt-10">
              <p className="text-xs md:text-sm uppercase tracking-[0.12em] text-muted mb-2">
                Project {activeIndex + 1} of {PROJECTS.length}
              </p>
              <h3 className="text-2xl font-semibold text-heading mb-3">
                {activeProject.title}
              </h3>
              <p className="text-body leading-relaxed">{activeProject.description}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
                <a
                  href={activeProject.primaryCtaHref}
                  className="inline-flex items-center justify-center bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-lg transition-colors font-medium"
                >
                  {activeProject.primaryCtaLabel}
                </a>
                <a
                  href={activeProject.secondaryCtaHref}
                  className="inline-flex items-center justify-center border border-border bg-page text-heading px-5 py-2 rounded-lg transition-colors font-medium hover:bg-card"
                >
                  {activeProject.secondaryCtaLabel}
                </a>
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
              className={`h-2.5 rounded-full transition-all ${
                index === activeIndex
                  ? "w-7 bg-accent"
                  : "w-2.5 bg-border hover:bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
