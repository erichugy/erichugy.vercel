# Home Page Modernization Plan

Scope, design language, and per-section spec for a bold redesign of `apps/web/src/app/page.tsx` and its child sections.

## Goal

Modernize the home page with a bold redesign in the **Vercel/Linear minimalist aesthetic**. Replace the current 3-section home page (Hero + ExperiencePreview + FeaturedProjects) with a cohesive 6-section layout. Single design pass — every section must share the same design language.

## Repo context

- **Working directory**: `/Users/eric.huang/Desktop/repos/curr-website`
- **App**: `apps/web` (Next.js 16 App Router, React 19, Tailwind CSS 4)
- **Conventions**: see `apps/web/AGENTS.md`. Key rules:
  - Comments: only "the why", never "the what"
  - Strict TypeScript, no `as any` / `@ts-ignore`
  - Path alias: `@/...` maps to `apps/web/src/...`
  - Import order: external packages → blank line → internal `@/...`
  - Each module: `index.ts` for exports, `types.ts` for Zod schemas

## Existing files to read first

### Page entry
- `apps/web/src/app/page.tsx` — currently composes Hero + ExperiencePreview + FeaturedProjects

### Sections to replace
- `apps/web/src/app/home/Hero.tsx` — current hero (text on left + portrait on right). Replace.
- `apps/web/src/app/home/ExperiencePreview.tsx` — text-only block linking to `/experience`. Replace with a stats section.
- `apps/web/src/app/home/FeaturedProjects.tsx` — carousel with rotating cards. Modernize the styling (keep functional behavior).

### Data sources to consume
- `apps/web/src/data/projects.ts` → `PROJECTS` (already populated, has 6 projects with images at `/turing-poker-bot-thumbnail.png`, `/trading-bot.png`, `/cc9-censorship.png`, `/stroke-predictor.png`, `/email-sender.png`).
- `apps/web/src/data/skills.ts` → `SKILL_ICONS` (`Record<string, IconType>`) and `SKILL_COLORS` (`Record<string, hexColor>`) — react-icons already wired up. Use this for the tech marquee.
- `apps/web/src/data/about.ts` → `WORK_EXPERIENCES` (highlights array contains the headline metrics — pull stats from here).
- `apps/web/src/utils/url.ts` → `isExternalHref` — use for safe external linking.

### Design system already in place (do not redefine)
- `apps/web/src/app/globals.css` defines theme tokens: `--color-page`, `--color-page-alt`, `--color-card`, `--color-border`, `--color-accent`, `--color-accent-hover`, `--color-accent-text`, `--color-heading`, `--color-body`, `--color-muted`. Both light and dark modes are tuned for WCAG AA. Use Tailwind classes that map to these (`bg-card`, `text-heading`, `text-body`, `text-muted`, `border-border`, `bg-accent`).
- Existing primitives:
  - `apps/web/src/components/Footer.tsx`
  - `apps/web/src/components/navbar/index.tsx` (already wired)
  - `apps/web/src/components/TechPill.tsx` — reusable tech tag pill
  - `apps/web/src/components/PageHero.tsx` — page-level hero used by `/projects`, `/tools`, `/hobbies`. **Don't** use for the home page; the home hero is a custom richer treatment.

### Existing motif (preserve)
- Mono eyebrows: `<p className="font-mono text-sm text-muted tracking-wide">{"// section_name"}</p>` or `{"< projects />"}` style.
- Cyan accent (`#0EA5C9` light, `#22D3EE` dark) used sparingly for CTAs and key emphasis.
- `card-glow` utility class in `globals.css` adds a hover glow on cards. The pattern is `border` + `bg-card` + `card-glow`.

## Design language — Vercel/Linear minimalism

Pull inspiration from `vercel.com`, `linear.app`, `framer.com` home pages:
- **Generous whitespace** — sections are tall (`py-24 md:py-32 lg:py-40`), `max-w-6xl` or `max-w-5xl`.
- **Bold display typography** — hero headline is huge (`text-6xl md:text-7xl lg:text-8xl`), tight tracking (`tracking-tight`), font-weight 600–700.
- **Restrained color** — neutrals dominate; accent appears only at CTAs, key emphasis, and 1–2 hero highlights.
- **Subtle depth** — `border border-border` on cards, very light shadow (already exists in `card-glow`); no heavy gradients except one hero accent gradient.
- **Sharp edges + rounded corners** — `rounded-xl` (12px) for cards, `rounded-[10px]` for buttons; no overly rounded "blob" shapes.
- **Mono eyebrows** for section labels (preserve existing motif).
- **Subtle scroll-triggered fade-ins** — sections fade up as they enter viewport (300–500ms, ease-out, single transform). Use a small reusable `ScrollReveal` client component with `IntersectionObserver`. **Do not add `framer-motion`** — keep bundle small. Tailwind 4 transitions are sufficient when triggered by toggling a class.

## Sections to build (in page order)

### 1. Hero (replace `Hero.tsx`)
A bigger, bolder hero. Keep the right-side portrait (`/me.png`) but make the layout feel modern:
- Eyebrow: `// software_engineer` or `> based in toronto`.
- **Massive headline**: "Hi, I'm Eric Huang." or "Building tools developers love." — pick the impact line. Two lines max. Use `text-accent` only on the name (preserve the existing accent name treatment with the cyan glow).
- Sub-headline: one-sentence positioning ("Software engineer building AI integrations and developer tooling at Botpress. McGill CS '25.").
- **Status pill** under the sub-headline: a small pill with a green pulsing dot + text like `Available for new opportunities` or `Currently @ Botpress`. Use accent for the dot; pulse via Tailwind animation. Border, small padding, `rounded-full`.
- Two CTAs: primary "Download Resume" (filled accent, `/Eric_Huang_Software-can.pdf`), secondary "Get in Touch" (`/contact`, outlined). Both already exist — preserve hrefs.
- Portrait on right: keep `/me.png`. Improve the frame — gradient halo behind, subtle ring, optional corner badge with a "✦" mark or year. Editorial magazine portrait feel.
- Subtle decorative element: small grid pattern overlay or noise texture in the background (optional — keep light if you do).

### 2. Tech Stack Marquee (new — `apps/web/src/app/home/TechMarquee.tsx`)
Looping horizontal scroll of tech logos. The Linear/Vercel "loved by these tools" pattern:
- Eyebrow: `// stack` or `> tools_of_the_trade`.
- Heading (small): "Built with the tools I love" or similar.
- **Two rows** of tech icons scrolling in opposite directions for visual rhythm (or one row if simpler).
- Use `SKILL_ICONS` from `@/data/skills` — render every icon, color via `SKILL_COLORS[name]`.
- Each item: icon + name in a pill (`bg-card border border-border rounded-[10px] px-4 py-2`). Icon ~20px, name beside it.
- Animation: pure CSS `@keyframes` `translateX` loop, ~30s per full cycle. Pause on hover (`hover:[animation-play-state:paused]`). Duplicate the list inside the track so the loop is seamless.
- Mask the edges with a horizontal gradient fade (left and right) so logos don't pop in/out abruptly. Use `mask-image: linear-gradient(...)`.
- Mark `"use client"` only if needed. CSS-only marquee does **not** need it.

### 3. Stats Section (new — `apps/web/src/app/home/StatsSection.tsx`, replaces `ExperiencePreview.tsx`)
Bold 4-stat grid pulling numbers from the resume highlights:
- Eyebrow: `// by_the_numbers`.
- Heading: "Impact at a glance" (or similar — keep concise).
- 4-column grid (1 col on mobile, 2 on `sm`, 4 on `lg`). Each cell:
  - Big number (`text-4xl md:text-5xl font-bold text-heading`) — use `text-accent` for the digit only.
  - Short label below (`text-sm text-muted`).
- **Concrete stats** (pull from `WORK_EXPERIENCES[0].highlights` and `[1].highlights` — Botpress + LIDD):
  - **`$200K+`** — Enterprise pipeline accelerated.
  - **`300+`** — Conversations/min in production.
  - **`50+`** — Workflows automated for Fortune 500 clients.
  - **`<10 min`** — MTTR with real-time monitoring.
  - (or pick the 4 most impressive — judgment call).
- Below the grid, a small `Learn more about my experience →` link to `/experience` (replaces the old `ExperiencePreview` CTA).

### 4. Featured Projects (refresh `FeaturedProjects.tsx`)
Keep all current functionality (autoplay carousel, arrows, dots, position-aware z-index/scale). Modernize the visual treatment:
- Tighten spacing.
- Improve the active card's elevation (subtle `shadow-2xl` in dark-mode equivalent).
- Replace the `text-center` heading with **left-aligned** for visual variety vs. other sections (anchors the eye differently — pure Linear move).
- Add a `View all projects →` link in the section's header row (right-aligned) pointing to `/projects`.
- Don't break the `SHOW_FEATURED_PROJECTS` feature flag fallback to `<WorkInProgress />`.

### 5. Currently Working On (new — `apps/web/src/app/home/NowSection.tsx`)
A small but personal section. Inspired by Pieter Levels' "Now" page concept but compressed:
- Eyebrow: `// currently` or `> now`.
- Heading: "What I'm working on".
- Three small cards (1-col mobile, 3-col desktop) each with:
  - Tiny icon (use react-icons — pick relevant ones).
  - Short title.
  - One-sentence description.
- Suggested entries (refine copy as needed):
  1. **🛠 Building** — "Open-source integrations and developer tooling at Botpress, including the ADK CLI."
  2. **📚 Learning** — "Distributed systems patterns and applied AI evaluation."
  3. **🤝 Open to** — "Senior software engineer roles in SF Bay / NYC. Drop me a line."
- Last entry's text should link "Drop me a line" to `/contact`.

### 6. Final CTA Strip (new — fold into the bottom of `page.tsx` as inline JSX or a small component)
A simple closing section that drives to `/contact`:
- One bold sentence: "Have a project in mind?" or "Let's build something together."
- Single big CTA button: "Get in Touch" → `/contact`.
- Centered, generous padding, optional subtle gradient background tying back to the hero accent.
- This replaces nothing — it's a new CTA bookend before the footer.

## Scroll fade-in utility (new — `apps/web/src/components/ScrollReveal.tsx`)

Tiny client component that wraps children. On mount:
1. `IntersectionObserver` watches the wrapped div.
2. When 15% of it is visible, add an `is-visible` class.
3. CSS handles the transition: `opacity 0→1`, `translateY(12px)→0`, 500ms `ease-out`.
4. Once revealed, disconnect (one-shot — never reverse).

Apply it around each section in `page.tsx` (or inside each section component). Honor `prefers-reduced-motion` — skip the animation and apply the visible state immediately when the media query matches.

Keep this lightweight — no dependencies. Pure React + `IntersectionObserver`. Add the small bit of CSS to `globals.css` (the keyframe / class definition).

## File layout

**Create**:
- `apps/web/src/app/home/TechMarquee.tsx`
- `apps/web/src/app/home/StatsSection.tsx`
- `apps/web/src/app/home/NowSection.tsx`
- `apps/web/src/components/ScrollReveal.tsx`

**Replace** (rewrite the whole file):
- `apps/web/src/app/home/Hero.tsx`
- `apps/web/src/app/home/FeaturedProjects.tsx` (preserve carousel logic, just restyle)
- `apps/web/src/app/page.tsx` (compose new section order)

**Delete**:
- `apps/web/src/app/home/ExperiencePreview.tsx` (replaced by `StatsSection`)

**Edit**:
- `apps/web/src/app/globals.css` — add the `@keyframes marquee` and `.scroll-reveal` / `.scroll-reveal.is-visible` rules. Keep additions minimal and well-scoped.

**Do not change**:
- `apps/web/src/data/*` (data is already correct — just consume it).
- `apps/web/src/components/Footer.tsx` / `navbar` / `NavLink`.
- `apps/web/src/app/contact/`, `/projects`, `/tools`, `/hobbies`, `/experience` pages.
- Theme variables in `globals.css` (use existing tokens).

## MUST DO

1. Use existing theme tokens (`bg-page`, `text-heading`, `text-body`, `text-muted`, `border-border`, `bg-accent`) — these auto-handle light/dark.
2. Use existing fonts — no new font imports. Mono is `font-mono` (already configured).
3. Avoid `dark:` Tailwind variants except where you need a different gradient/shadow per mode (the existing Hero does this for the name accent — preserve that pattern).
4. All sections must look great in **both** light and dark mode.
5. Preserve accessibility: every interactive element keyboard-focusable, every image has `alt`, every section has appropriate `<h2>` heading hierarchy (Hero is `<h1>`, the rest are `<h2>`).
6. Use semantic HTML: `<section>` per section, `<h1>` / `<h2>` / `<h3>` properly nested.
7. Run `pnpm --filter web run lint` and `pnpm --filter web run build` from the repo root and ensure both succeed before reporting done.
8. Existing TypeScript discipline: `Project` type comes from `@/data/projects`, etc. No new `as any` casts.
9. Mobile responsive — every section must work at 375px width. Test with the build output.
10. Honor `prefers-reduced-motion` — disable marquee + scroll reveal animations when the user requests it.
11. **No comments** explaining what code does. Only comments explaining non-obvious "why" decisions, and only when truly necessary.

## MUST NOT DO

1. Don't add new npm dependencies (no `framer-motion`, no `aos`, no GSAP). Use CSS + `IntersectionObserver`.
2. Don't introduce a new color palette or override theme tokens.
3. Don't break the `SHOW_FEATURED_PROJECTS` feature flag's fallback path (`WorkInProgress` component).
4. Don't change navigation routes or any other page.
5. Don't add Storybook, tests, or any infrastructure beyond what's needed.
6. Don't make the page feel busy — restraint over abundance. Vercel/Linear minimalism, not maximalist.
7. Don't introduce parallax or scroll-jacking. Just simple fade-up reveals.
8. Don't make the marquee jittery — must be smooth and seamless on the loop wraparound.
9. Don't hardcode any of the projects, skills, or stats — pull them from `@/data/...` files.
10. Don't add explanatory comments on every component. A skill-level reader should understand structure from naming + types.

## Deliverables

1. New / replaced / deleted files as listed above.
2. The home page (`/`) renders 6 visually-distinct, well-spaced sections in this order: Hero → TechMarquee → Stats → FeaturedProjects → NowSection → CTA strip.
3. `pnpm --filter web run lint` returns clean.
4. `pnpm --filter web run build` exits 0.
5. Summary of what was built, including a brief description of the design choices for each section.
6. List of any tradeoffs made or open questions for review.

The result should make a senior reviewer say "this looks like a 2026 staff-engineer's portfolio."
