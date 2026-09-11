import type { ReactNode } from "react";

import HobbyCard from "@/app/hobbies/components/HobbyCard";
import ProjectCard from "@/app/projects/components/ProjectCard";
import ToolCard from "@/app/tools/components/ToolCard";
import ExamplePicker from "@/app/tools/sql-erd/components/example-picker";
import PaneRail from "@/app/tools/sql-erd/components/pane-rail";
import SqlSyntaxHelp from "@/app/tools/sql-erd/components/sql-syntax-help";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/navbar/ThemeToggle";
import NavLink from "@/components/NavLink";
import PageHero from "@/components/PageHero";
import TechPill from "@/components/TechPill";
import WorkInProgress from "@/components/WorkInProgress";
import { HOBBIES } from "@/data/hobbies";
import { PROJECTS } from "@/data/projects";
import { TOOLS } from "@/data/tools";

// Plain interfaces rather than Zod: these hold ReactNode and are never validated.

export interface GalleryVariant {
  id: string;
  name: string;
  /** What this variant is here to catch, shown above the preview. */
  description?: string;
  render: () => ReactNode;
}

export interface GalleryEntry {
  id: string;
  name: string;
  group: string;
  /** Repo-relative source path, so a reviewer can jump straight to the file. */
  source: string;
  variants: readonly GalleryVariant[];
}

const noop = () => {};

export const UI_GALLERY: readonly GalleryEntry[] = [
  {
    id: "page-hero",
    name: "PageHero",
    group: "Layout",
    source: "src/components/PageHero.tsx",
    variants: [
      {
        id: "default",
        name: "Default",
        render: () => (
          <PageHero
            eyebrow="// tools"
            title="Tools"
            description="Interactive developer tools I've built — try them live."
          />
        ),
      },
      {
        id: "with-children",
        name: "With children",
        description: "The children slot sits under the description.",
        render: () => (
          <PageHero
            eyebrow="// projects"
            title="Projects"
            description="Things I have shipped, broken and rebuilt."
          >
            <div className="flex flex-wrap gap-2">
              <TechPill label="Next.js" />
              <TechPill label="TypeScript" />
              <TechPill label="Postgres" />
            </div>
          </PageHero>
        ),
      },
      {
        id: "long-title",
        name: "Long title",
        description: "Checks heading wrap and the max-w-3xl measure.",
        render: () => (
          <PageHero
            eyebrow="// a considerably longer eyebrow than usual"
            title="A page title long enough to wrap onto several lines at desktop width"
            description="A description that also runs long, so the leading and the measure can be judged together rather than one at a time. It should stay comfortable to read."
          />
        ),
      },
    ],
  },
  {
    id: "tech-pill",
    name: "TechPill",
    group: "Primitives",
    source: "src/components/TechPill.tsx",
    variants: [
      { id: "default", name: "Default", render: () => <TechPill label="TypeScript" /> },
      {
        id: "row",
        name: "Row",
        description: "Wrapping behaviour in a constrained container.",
        render: () => (
          <div className="flex max-w-sm flex-wrap gap-2">
            {["Next.js", "React", "TypeScript", "Tailwind", "Zod", "React Flow", "CodeMirror"].map(
              (label) => (
                <TechPill key={label} label={label} />
              ),
            )}
          </div>
        ),
      },
      {
        id: "long-label",
        name: "Long label",
        render: () => <TechPill label="A very long technology label indeed" />,
      },
    ],
  },
  {
    id: "nav-link",
    name: "NavLink",
    group: "Primitives",
    source: "src/components/NavLink.tsx",
    variants: [
      {
        id: "page",
        name: "Page link",
        render: () => (
          <NavLink href="/projects" className="text-body hover:text-heading">
            Projects
          </NavLink>
        ),
      },
      {
        id: "hash",
        name: "Hash link",
        description: "Renders a native anchor when already on the target page.",
        render: () => (
          <NavLink href="/dev/ui#section" className="text-body hover:text-heading">
            Jump to section
          </NavLink>
        ),
      },
    ],
  },
  {
    id: "theme-toggle",
    name: "ThemeToggle",
    group: "Primitives",
    source: "src/components/navbar/ThemeToggle.tsx",
    variants: [
      {
        id: "default",
        name: "Default",
        description: "Live — toggles the .dark class on the document root.",
        render: () => <ThemeToggle />,
      },
    ],
  },
  {
    id: "work-in-progress",
    name: "WorkInProgress",
    group: "Layout",
    source: "src/components/WorkInProgress.tsx",
    variants: [{ id: "default", name: "Default", render: () => <WorkInProgress /> }],
  },
  {
    id: "footer",
    name: "Footer",
    group: "Layout",
    source: "src/components/Footer.tsx",
    variants: [{ id: "default", name: "Default", render: () => <Footer /> }],
  },
  {
    id: "tool-card",
    name: "ToolCard",
    group: "Cards",
    source: "src/app/tools/components/ToolCard.tsx",
    variants: [
      {
        id: "default",
        name: "Default",
        render: () => (
          <div className="max-w-md">
            <ToolCard tool={TOOLS[0]} />
          </div>
        ),
      },
      {
        id: "grid",
        name: "In a grid",
        description: "Cards in a row should end level regardless of body length.",
        render: () => (
          <div className="grid max-w-4xl gap-8 md:grid-cols-2">
            {TOOLS.slice(0, 2).map((tool) => (
              <ToolCard key={tool.title} tool={tool} />
            ))}
          </div>
        ),
      },
    ],
  },
  {
    id: "project-card",
    name: "ProjectCard",
    group: "Cards",
    source: "src/app/projects/components/ProjectCard.tsx",
    variants: [
      {
        id: "default",
        name: "Default",
        render: () => (
          <div className="max-w-md">
            <ProjectCard project={PROJECTS[0]} />
          </div>
        ),
      },
      {
        id: "emoji-fallback",
        name: "Emoji fallback",
        description: "No image set, so the emoji branch renders instead.",
        render: () => (
          <div className="max-w-md">
            <ProjectCard project={{ ...PROJECTS[0], image: "", emoji: "🃏" }} />
          </div>
        ),
      },
    ],
  },
  {
    id: "hobby-card",
    name: "HobbyCard",
    group: "Cards",
    source: "src/app/hobbies/components/HobbyCard.tsx",
    variants: [
      {
        id: "default",
        name: "Default",
        render: () => (
          <div className="max-w-md">
            <HobbyCard hobby={HOBBIES[0]} />
          </div>
        ),
      },
    ],
  },
  {
    id: "pane-rail",
    name: "PaneRail",
    group: "SQL ERD",
    source: "src/app/tools/sql-erd/components/pane-rail.tsx",
    variants: [
      {
        id: "with-badge",
        name: "With badge",
        render: () => (
          <div className="h-80">
            <PaneRail label="Files" badge="3" onExpand={noop} />
          </div>
        ),
      },
      {
        id: "no-badge",
        name: "Without badge",
        render: () => (
          <div className="h-80">
            <PaneRail label="SQL" onExpand={noop} />
          </div>
        ),
      },
    ],
  },
  {
    id: "example-picker",
    name: "ExamplePicker",
    group: "SQL ERD",
    source: "src/app/tools/sql-erd/components/example-picker.tsx",
    variants: [
      {
        id: "default",
        name: "Default",
        render: () => (
          <div className="max-w-sm">
            <ExamplePicker onLoadExample={noop} />
          </div>
        ),
      },
    ],
  },
  {
    id: "sql-syntax-help",
    name: "SqlSyntaxHelp",
    group: "SQL ERD",
    source: "src/app/tools/sql-erd/components/sql-syntax-help.tsx",
    variants: [
      {
        id: "default",
        name: "Default",
        render: () => (
          <div className="flex h-[32rem] max-w-md flex-col justify-end">
            <SqlSyntaxHelp onClose={noop} />
          </div>
        ),
      },
    ],
  },
];

export function findGalleryEntry(entryId: string): GalleryEntry | undefined {
  return UI_GALLERY.find((entry) => entry.id === entryId);
}
