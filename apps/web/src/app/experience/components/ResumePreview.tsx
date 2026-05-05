export default function ResumePreview() {
  return (
    <section className="px-6 py-20 md:py-28 bg-page-alt">
      <div className="max-w-3xl mx-auto">
        <p className="font-mono text-sm text-muted tracking-wide mb-3">
          {"// resume"}
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-10">
          Resume
        </h2>

        <div className="card-glow overflow-hidden rounded-xl border border-border bg-card shadow-[0_2px_8px_rgba(12,27,33,0.06)]">
          <div className="flex items-center justify-between border-b border-border bg-page px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="size-3 rounded-full bg-[#FF5F57]" />
                <span className="size-3 rounded-full bg-[#FEBC2E]" />
                <span className="size-3 rounded-full bg-[#28C840]" />
              </div>
              <span className="ml-2 font-mono text-sm text-muted">
                resume.pdf
              </span>
            </div>

            <a
              href="/Eric_Huang_Software-can.pdf"
              download
              className="inline-flex items-center gap-2 rounded-[10px] bg-accent px-4 py-1.5 text-sm font-medium text-accent-text transition-all hover:bg-accent-hover hover:shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </a>
          </div>

          <div className="hidden aspect-[8.5/11] w-full sm:block">
            <iframe
              src="/Eric_Huang_Software-can.pdf"
              title="Eric Huang Resume"
              loading="lazy"
              className="h-full w-full"
            />
          </div>

          <div className="flex flex-col items-center gap-4 px-6 py-12 text-center sm:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <p className="text-sm text-body">
              PDF preview is not available on this device.
            </p>
            <a
              href="/Eric_Huang_Software-can.pdf"
              download
              className="inline-flex items-center gap-2 rounded-[10px] bg-accent px-6 py-2.5 text-sm font-semibold text-accent-text transition-all hover:bg-accent-hover hover:shadow-md"
            >
              Download Resume (PDF)
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
