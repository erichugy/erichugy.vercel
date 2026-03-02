"use client";

import { useRef, useEffect, useState } from "react";
import { TECHNICAL_SKILLS } from "@/lib/about-data";
import { IconType } from "react-icons";
import {
  SiBun,
  SiDocker,
  SiExpress,
  SiFastapi,
  SiFlask,
  SiGit,
  SiGithub,
  SiGitlab,
  SiGnubash,
  SiHtml5,
  SiJavascript,
  SiJira,
  SiLinux,
  SiNextdotjs,
  SiNodedotjs,
  SiPandas,
  SiPostgresql,
  SiPython,
  SiPytorch,
  SiReact,
  SiScikitlearn,
  SiTailwindcss,
  SiTypescript,
  SiZod,
} from "react-icons/si";
import { TbChartLine } from "react-icons/tb";
import { VscAzureDevops } from "react-icons/vsc";

const SKILL_ICONS: Record<string, IconType> = {
  TypeScript: SiTypescript,
  JavaScript: SiJavascript,
  Python: SiPython,
  Bash: SiGnubash,
  "HTML/CSS": SiHtml5,
  "Node.js": SiNodedotjs,
  Bun: SiBun,
  Zod: SiZod,
  Express: SiExpress,
  FastAPI: SiFastapi,
  Flask: SiFlask,
  React: SiReact,
  "Next.js": SiNextdotjs,
  "Tailwind CSS": SiTailwindcss,
  Pandas: SiPandas,
  Matplotlib: TbChartLine,
  "Scikit-Learn": SiScikitlearn,
  PyTorch: SiPytorch,
  Docker: SiDocker,
  "Azure DevOps": VscAzureDevops,
  Git: SiGit,
  GitHub: SiGithub,
  GitLab: SiGitlab,
  Jira: SiJira,
  "Unix/Linux": SiLinux,
  PostgreSQL: SiPostgresql,
};

const CATEGORY_LABELS: Record<string, string> = {
  languages: "Languages",
  backend: "Backend",
  frontend: "Frontend",
  dataML: "Data / ML",
  devOps: "DevOps / Tools",
};

interface BubbleState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
}

const RESTITUTION = 0.7;
const DAMPING = 0.9985;
const INITIAL_SPEED_MIN = 0.5;
const INITIAL_SPEED_MAX = 1.5;
const BASE_RADIUS = 60;
const PER_SKILL_RADIUS = 12;

const categories = Object.entries(TECHNICAL_SKILLS).map(([key, skills]) => ({
  key,
  label: CATEGORY_LABELS[key] ?? key,
  skills,
}));

export default function SkillsBubbleCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const physicsRef = useRef<BubbleState[]>([]);
  const rafRef = useRef<number>(0);
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  const [diameters, setDiameters] = useState<number[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function initPhysics() {
      const rect = container!.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      sizeRef.current = { w, h };

      const scale = Math.min(Math.max(w / 900, 0.6), 1.2);

      // Sort categories by skill count descending for placement
      const indexed = categories.map((cat, i) => ({
        index: i,
        skillCount: cat.skills.length,
      }));
      indexed.sort((a, b) => b.skillCount - a.skillCount);

      const bubbles: BubbleState[] = new Array(categories.length);
      const newDiameters: number[] = new Array(categories.length);
      const placed: BubbleState[] = [];

      for (const { index, skillCount } of indexed) {
        const radius = (BASE_RADIUS + skillCount * PER_SKILL_RADIUS) * scale;
        newDiameters[index] = radius * 2;

        let x = w / 2;
        let y = h / 2;
        let foundSpot = false;

        for (let attempt = 0; attempt < 100; attempt++) {
          const cx = radius + Math.random() * (w - 2 * radius);
          const cy = radius + Math.random() * (h - 2 * radius);

          let overlaps = false;
          for (const p of placed) {
            const dx = cx - p.x;
            const dy = cy - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < radius + p.radius + 4) {
              overlaps = true;
              break;
            }
          }

          if (!overlaps) {
            x = cx;
            y = cy;
            foundSpot = true;
            break;
          }
        }

        if (!foundSpot) {
          x = radius + Math.random() * Math.max(0, w - 2 * radius);
          y = radius + Math.random() * Math.max(0, h - 2 * radius);
        }

        const angle = Math.random() * Math.PI * 2;
        const speed =
          INITIAL_SPEED_MIN +
          Math.random() * (INITIAL_SPEED_MAX - INITIAL_SPEED_MIN);

        const bubble: BubbleState = {
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius,
          mass: radius * radius,
        };

        bubbles[index] = bubble;
        placed.push(bubble);
      }

      physicsRef.current = bubbles;
      setDiameters(newDiameters);

      // Set initial positions on DOM
      for (let i = 0; i < bubbles.length; i++) {
        const el = bubbleRefs.current[i];
        if (el) {
          const b = bubbles[i];
          el.style.transform = `translate(${b.x - b.radius}px, ${b.y - b.radius}px)`;
        }
      }
    }

    function step() {
      const bubbles = physicsRef.current;
      const { w, h } = sizeRef.current;
      if (bubbles.length === 0 || w === 0) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      for (const b of bubbles) {
        // 1. Damping
        b.vx *= DAMPING;
        b.vy *= DAMPING;

        // Inject small random nudge if nearly stopped
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (speed < 0.3) {
          const angle = Math.random() * Math.PI * 2;
          b.vx += Math.cos(angle) * 0.1;
          b.vy += Math.sin(angle) * 0.1;
        }

        // 2. Update position
        b.x += b.vx;
        b.y += b.vy;

        // 3. Wall collisions
        if (b.x - b.radius < 0) {
          b.x = b.radius;
          b.vx = Math.abs(b.vx) * RESTITUTION;
        }
        if (b.x + b.radius > w) {
          b.x = w - b.radius;
          b.vx = -Math.abs(b.vx) * RESTITUTION;
        }
        if (b.y - b.radius < 0) {
          b.y = b.radius;
          b.vy = Math.abs(b.vy) * RESTITUTION;
        }
        if (b.y + b.radius > h) {
          b.y = h - b.radius;
          b.vy = -Math.abs(b.vy) * RESTITUTION;
        }
      }

      // 4. Bubble-bubble collisions
      for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
          const a = bubbles[i];
          const bub = bubbles[j];
          const dx = bub.x - a.x;
          const dy = bub.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = a.radius + bub.radius;

          if (dist < minDist) {
            // Collision normal (random direction if exactly overlapping)
            let nx: number, ny: number;
            if (dist === 0) {
              const angle = Math.random() * Math.PI * 2;
              nx = Math.cos(angle);
              ny = Math.sin(angle);
            } else {
              nx = dx / dist;
              ny = dy / dist;
            }

            // Relative velocity along normal
            const dvx = a.vx - bub.vx;
            const dvy = a.vy - bub.vy;
            const dvn = dvx * nx + dvy * ny;

            if (dvn > 0) {
              // Approaching
              const impulse =
                (-(1 + RESTITUTION) * dvn) / (1 / a.mass + 1 / bub.mass);
              a.vx += (impulse / a.mass) * nx;
              a.vy += (impulse / a.mass) * ny;
              bub.vx -= (impulse / bub.mass) * nx;
              bub.vy -= (impulse / bub.mass) * ny;

              // Separate overlapping bubbles
              const overlap = minDist - dist;
              const totalMass = a.mass + bub.mass;
              a.x -= (overlap * (bub.mass / totalMass)) * nx;
              a.y -= (overlap * (bub.mass / totalMass)) * ny;
              bub.x += (overlap * (a.mass / totalMass)) * nx;
              bub.y += (overlap * (a.mass / totalMass)) * ny;
            }
          }
        }
      }

      // 5. Extra separation pass to resolve chain overlaps
      for (let iter = 0; iter < 2; iter++) {
        for (let i = 0; i < bubbles.length; i++) {
          for (let j = i + 1; j < bubbles.length; j++) {
            const a = bubbles[i];
            const bub = bubbles[j];
            const dx = bub.x - a.x;
            const dy = bub.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = a.radius + bub.radius;
            if (dist < minDist && dist > 0) {
              const nx = dx / dist;
              const ny = dy / dist;
              const overlap = minDist - dist;
              const totalMass = a.mass + bub.mass;
              a.x -= (overlap * (bub.mass / totalMass)) * nx;
              a.y -= (overlap * (bub.mass / totalMass)) * ny;
              bub.x += (overlap * (a.mass / totalMass)) * nx;
              bub.y += (overlap * (a.mass / totalMass)) * ny;
            }
          }
        }
      }

      // 6. Update DOM
      for (let i = 0; i < bubbles.length; i++) {
        const el = bubbleRefs.current[i];
        if (el) {
          const b = bubbles[i];
          if (!isFinite(b.x) || !isFinite(b.y)) {
            b.x = w / 2;
            b.y = h / 2;
            b.vx = 0;
            b.vy = 0;
          }
          el.style.transform = `translate(${b.x - b.radius}px, ${b.y - b.radius}px)`;
        }
      }

      rafRef.current = requestAnimationFrame(step);
    }

    initPhysics();
    rafRef.current = requestAnimationFrame(step);

    const observer = new ResizeObserver(() => {
      const rect = container!.getBoundingClientRect();
      const newW = rect.width;
      const newH = rect.height;
      const oldW = sizeRef.current.w;
      const oldH = sizeRef.current.h;

      if (newW === oldW && newH === oldH) return;
      if (newW === 0 || newH === 0) return;

      // If coming from zero size (e.g., display:none -> visible), reinitialize
      if (oldW === 0 || oldH === 0) {
        initPhysics();
        return;
      }

      sizeRef.current = { w: newW, h: newH };
      const scale = Math.min(Math.max(newW / 900, 0.6), 1.2);

      const bubbles = physicsRef.current;

      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        const newRadius =
          (BASE_RADIUS + categories[i].skills.length * PER_SKILL_RADIUS) *
          scale;
        b.radius = newRadius;
        b.mass = newRadius * newRadius;

        // Rescale positions proportionally
        if (oldW > 0) b.x = (b.x / oldW) * newW;
        if (oldH > 0) b.y = (b.y / oldH) * newH;

        // Clamp to bounds
        if (b.x - b.radius < 0) b.x = b.radius;
        if (b.x + b.radius > newW) b.x = newW - b.radius;
        if (b.y - b.radius < 0) b.y = b.radius;
        if (b.y + b.radius > newH) b.y = newH - b.radius;

        // Update DOM element size
        const el = bubbleRefs.current[i];
        if (el) {
          el.style.width = `${newRadius * 2}px`;
          el.style.height = `${newRadius * 2}px`;
        }
      }

      setDiameters(bubbles.map((b) => b.radius * 2));
    });

    observer.observe(container);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Technical skills: TypeScript, JavaScript, Python, React, Next.js, Docker, and more"
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ height: "clamp(500px, 50vw, 700px)" }}
    >
      {categories.map((cat, i) => {
        const diameter = diameters[i] ?? 0;
        return (
          <div
            key={cat.key}
            ref={(el) => {
              bubbleRefs.current[i] = el;
            }}
            className="absolute rounded-full bg-card/80 backdrop-blur-sm border border-border
                       flex flex-col items-center justify-center gap-1 p-4
                       select-none overflow-hidden"
            style={{
              width: diameter,
              height: diameter,
              willChange: "transform",
            }}
          >
            <span className="text-xs uppercase tracking-wider text-muted font-semibold mb-1">
              {cat.label}
            </span>
            <div className="flex flex-wrap justify-center gap-1.5 px-2">
              {cat.skills.map((skill) => {
                const Icon = SKILL_ICONS[skill];
                return (
                  <div
                    key={skill}
                    className="flex items-center gap-0.5 bg-card rounded-md border border-border
                               px-1.5 py-0.5 card-glow shadow-[0_2px_8px_rgba(12,27,33,0.06)]"
                  >
                    <span
                      className="text-body flex items-center justify-center"
                      aria-hidden="true"
                    >
                      {Icon ? (
                        <Icon size={12} />
                      ) : (
                        <span className="text-[10px] font-mono font-bold">
                          {skill[0]}
                        </span>
                      )}
                    </span>
                    <span className="text-[9px] font-mono text-body whitespace-nowrap">
                      {skill}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
