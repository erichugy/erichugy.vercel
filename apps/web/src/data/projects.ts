export interface Project {
  title: string;
  description: string;
  image: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  imageBackgroundClassName: string;
}

export const PROJECTS: readonly Project[] = [
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
