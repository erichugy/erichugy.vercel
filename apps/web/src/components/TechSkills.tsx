import { TECHNICAL_SKILLS } from "@/lib/about-data";

const SKILL_ICONS: Record<string, React.ReactNode> = {
  TypeScript: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="2" y="2" width="28" height="28" rx="3" stroke="currentColor" strokeWidth="2" />
      <text x="16" y="23" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="bold" fontFamily="monospace">TS</text>
    </svg>
  ),
  JavaScript: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="2" y="2" width="28" height="28" rx="3" stroke="currentColor" strokeWidth="2" />
      <text x="16" y="23" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="bold" fontFamily="monospace">JS</text>
    </svg>
  ),
  Python: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 4C10 4 10.5 6.5 10.5 6.5V9.5H16.5V10.5H7.5S4 10 4 16S7 22 7 22H9.5V18.5S9.3 15.5 12.5 15.5H19S22 15.6 22 13V7S22.3 4 16 4ZM12.5 6C13.1 6 13.5 6.4 13.5 7S13.1 8 12.5 8S11.5 7.6 11.5 7S11.9 6 12.5 6Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M16 28C22 28 21.5 25.5 21.5 25.5V22.5H15.5V21.5H24.5S28 22 28 16S25 10 25 10H22.5V13.5S22.7 16.5 19.5 16.5H13S10 16.4 10 19V25S9.7 28 16 28ZM19.5 26C18.9 26 18.5 25.6 18.5 25S18.9 24 19.5 24S20.5 24.4 20.5 25S20.1 26 19.5 26Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  ),
  Bash: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="3" y="5" width="26" height="22" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M9 14L13 17L9 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="15" y1="21" x2="22" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  "HTML/CSS": (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M8 6L5 26L16 29L27 26L24 6H8Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M11 11H21L20.5 17H13L13.3 20L16 21L18.7 20L19 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  "Node.js": (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 3L28 10V22L16 29L4 22V10L16 3Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <text x="16" y="20" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="bold" fontFamily="monospace">N</text>
    </svg>
  ),
  Bun: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="18" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 8C12 4 14 3 16 3C18 3 20 4 22 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="13" cy="17" r="1.5" fill="currentColor" />
      <circle cx="19" cy="17" r="1.5" fill="currentColor" />
      <path d="M13 21C14 22.5 18 22.5 19 21" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  ),
  Zod: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M6 8H26L13 24H26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Express: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <text x="16" y="21" textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="bold" fontFamily="monospace">Ex</text>
      <line x1="4" y1="27" x2="28" y2="27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  FastAPI: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17 6L12 18H17L15 26L22 14H17L19 6Z" fill="currentColor" />
    </svg>
  ),
  Flask: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M13 4H19V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14.5 4V12L6 26C6 27 7 28 8 28H24C25 28 26 27 26 26L17.5 12V4" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M9 22C12 20 20 20 23 22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  ),
  React: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="2.5" fill="currentColor" />
      <ellipse cx="16" cy="16" rx="12" ry="5" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="16" cy="16" rx="12" ry="5" stroke="currentColor" strokeWidth="1.5" transform="rotate(60 16 16)" />
      <ellipse cx="16" cy="16" rx="12" ry="5" stroke="currentColor" strokeWidth="1.5" transform="rotate(120 16 16)" />
    </svg>
  ),
  "React Native": (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="2" fill="currentColor" />
      <ellipse cx="16" cy="16" rx="11" ry="4.5" stroke="currentColor" strokeWidth="1.3" />
      <ellipse cx="16" cy="16" rx="11" ry="4.5" stroke="currentColor" strokeWidth="1.3" transform="rotate(60 16 16)" />
      <ellipse cx="16" cy="16" rx="11" ry="4.5" stroke="currentColor" strokeWidth="1.3" transform="rotate(120 16 16)" />
      <rect x="10" y="25" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
    </svg>
  ),
  "Next.js": (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 21V11L22 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="21" y1="11" x2="21" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  "Tailwind CSS": (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M8 16C9.5 10 13 8 16 8C21 8 22 12 24.5 13C27 14 29 12 30 10C28.5 16 25 18 22 18C17 18 16 14 13.5 13C11 12 9 14 8 16Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M2 22C3.5 16 7 14 10 14C15 14 16 18 18.5 19C21 20 23 18 24 16C22.5 22 19 24 16 24C11 24 10 20 7.5 19C5 18 3 20 2 22Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  ),
  Pandas: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="8" y="4" width="4" height="8" rx="1" fill="currentColor" />
      <rect x="8" y="14" width="4" height="4" rx="1" fill="currentColor" />
      <rect x="8" y="20" width="4" height="8" rx="1" fill="currentColor" />
      <rect x="20" y="4" width="4" height="8" rx="1" fill="currentColor" />
      <rect x="20" y="14" width="4" height="4" rx="1" fill="currentColor" />
      <rect x="20" y="20" width="4" height="8" rx="1" fill="currentColor" />
      <rect x="14" y="10" width="4" height="12" rx="1" fill="currentColor" />
    </svg>
  ),
  Matplotlib: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M6 26L6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 26H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 22L13 14L18 18L24 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="13" cy="14" r="1.5" fill="currentColor" />
      <circle cx="18" cy="18" r="1.5" fill="currentColor" />
      <circle cx="24" cy="8" r="1.5" fill="currentColor" />
    </svg>
  ),
  "Scikit-Learn": (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="25" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="25" cy="22" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="16" cy="27" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="7" cy="22" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="7" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <line x1="16" y1="12" x2="16" y2="7.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="19.5" y1="13.5" x2="22.8" y2="12" stroke="currentColor" strokeWidth="1.2" />
      <line x1="19.5" y1="18.5" x2="22.8" y2="20.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="16" y1="20" x2="16" y2="24.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="12.5" y1="18.5" x2="9.2" y2="20.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="12.5" y1="13.5" x2="9.2" y2="12" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  PyTorch: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 3L9 10C5 14 5 20.5 9 24.5C13 28.5 19.5 28.5 23.5 24.5C27.5 20.5 27.5 14 23.5 10L21 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="22" cy="8" r="2" fill="currentColor" />
    </svg>
  ),
  Docker: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M2 15C3 14 5 13.5 7 14C7.5 11 10 10 12 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M4 15H28C28 15 27 24 17 24C9 24 4 20 4 15Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="8" y="15" width="3" height="2.5" stroke="currentColor" strokeWidth="0.8" />
      <rect x="12" y="15" width="3" height="2.5" stroke="currentColor" strokeWidth="0.8" />
      <rect x="16" y="15" width="3" height="2.5" stroke="currentColor" strokeWidth="0.8" />
      <rect x="12" y="11.5" width="3" height="2.5" stroke="currentColor" strokeWidth="0.8" />
      <rect x="16" y="11.5" width="3" height="2.5" stroke="currentColor" strokeWidth="0.8" />
      <rect x="20" y="15" width="3" height="2.5" stroke="currentColor" strokeWidth="0.8" />
      <rect x="8" y="11.5" width="3" height="2.5" stroke="currentColor" strokeWidth="0.8" />
      <rect x="12" y="8" width="3" height="2.5" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  ),
  "Azure DevOps": (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M27 9L17 5V9L10 13L5 11V21L10 23L27 18V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M17 5L27 9V18L22 23L10 23L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  Git: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M28.3 14.3L17.7 3.7C17.1 3.1 16.1 3.1 15.5 3.7L12.5 6.7L16.2 10.4C17 10.1 18 10.3 18.6 10.9C19.2 11.5 19.4 12.4 19.1 13.2L22.6 16.7C23.4 16.4 24.4 16.6 25 17.2C25.8 18 25.8 19.3 25 20.1C24.2 20.9 22.9 20.9 22.1 20.1C21.5 19.5 21.3 18.5 21.7 17.7L18.4 14.4V21.6C18.6 21.7 18.9 21.9 19.1 22.1C19.9 22.9 19.9 24.2 19.1 25C18.3 25.8 17 25.8 16.2 25C15.4 24.2 15.4 22.9 16.2 22.1C16.4 21.9 16.7 21.7 17 21.6V14C16.7 13.9 16.4 13.7 16.2 13.5C15.6 12.9 15.4 12 15.7 11.2L12 7.5L3.7 15.8C3.1 16.4 3.1 17.4 3.7 18L14.3 28.6C14.9 29.2 15.9 29.2 16.5 28.6L28.3 16.8C28.9 16.2 28.9 15.2 28.3 14.6V14.3Z" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  ),
  GitHub: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 3C8.8 3 3 8.8 3 16C3 21.7 6.7 26.5 11.8 28.2C12.4 28.3 12.7 28 12.7 27.7V25.2C8.9 26 8.2 23.4 8.2 23.4C7.6 21.9 6.8 21.6 6.8 21.6C5.7 20.8 6.9 20.8 6.9 20.8C8.1 20.9 8.7 22.1 8.7 22.1C9.8 24 11.5 23.4 12.7 23.1C12.8 22.3 13.1 21.7 13.5 21.4C10.5 21.1 7.3 19.9 7.3 15C7.3 13.6 7.8 12.5 8.7 11.6C8.6 11.3 8.2 10 8.8 8.3C8.8 8.3 9.8 8 12.7 9.6C13.6 9.3 14.8 9.2 16 9.2C17.2 9.2 18.4 9.3 19.3 9.6C22.2 8 23.2 8.3 23.2 8.3C23.8 10 23.4 11.3 23.3 11.6C24.2 12.5 24.7 13.6 24.7 15C24.7 19.9 21.5 21 18.5 21.3C19 21.7 19.3 22.5 19.3 23.6V27.7C19.3 28 19.6 28.3 20.2 28.2C25.3 26.5 29 21.7 29 16C29 8.8 23.2 3 16 3Z" fill="currentColor" />
    </svg>
  ),
  GitLab: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 28L21 17H11L16 28Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M11 17L9 10L4 17H11Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M21 17L23 10L28 17H21Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M4 17L3 14L9 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M28 17L29 14L23 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M16 28L4 17" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 28L28 17" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Jira: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M27 4H16L16 15L27 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M22 9H11V20H22Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M16 14H5V28H16Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  "Unix/Linux": (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <ellipse cx="16" cy="22" rx="11" ry="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M11 10C11 7 13 5 16 5C19 5 21 7 21 10C21 14 20 18 20 20" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M12 20C12 18 13 14 11 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="14" cy="10" r="1" fill="currentColor" />
      <circle cx="18" cy="10" r="1" fill="currentColor" />
      <path d="M14 13C15 14 17 14 18 13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" />
    </svg>
  ),
  PostgreSQL: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M22 5C25 7 26 11 25 16C24 21 23 24 26 27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M10 5C7 7 6 11 7 16C8 21 9 24 6 27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <ellipse cx="16" cy="8" rx="8" ry="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M8 8V22C8 24.2 11.6 26 16 26C20.4 26 24 24.2 24 22V8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <ellipse cx="16" cy="15" rx="8" ry="3" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  ),
};

const ALL_SKILLS = Object.values(TECHNICAL_SKILLS).flat();

export default function TechSkills() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
      {ALL_SKILLS.map((skill) => (
        <div
          key={skill}
          className="bg-card rounded-xl border border-border p-4 flex flex-col items-center gap-2 text-center card-glow shadow-[0_2px_8px_rgba(12,27,33,0.06)]"
        >
          <span className="text-body w-8 h-8 flex items-center justify-center">
            {SKILL_ICONS[skill] ?? (
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="4" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="16" cy="16" r="3" fill="currentColor" />
              </svg>
            )}
          </span>
          <span className="text-xs font-mono text-body">{skill}</span>
        </div>
      ))}
    </div>
  );
}
