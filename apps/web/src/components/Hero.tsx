import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="px-6 py-20 md:py-28 lg:py-36 bg-page">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-5">
            <p className="font-mono text-sm text-muted tracking-wide">
              {"// welcome to my portfolio"}
            </p>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-heading leading-[1.08]">
              Hello, I&apos;m{" "}
              <span className="text-accent drop-shadow-[0_0_20px_rgba(14,165,201,0.2)] dark:drop-shadow-[0_0_20px_rgba(34,211,238,0.35)]">
                Eric Huang
              </span>
            </h1>

            <h2 className="text-lg md:text-xl text-muted font-medium font-mono tracking-wide uppercase">
              Software Engineer
            </h2>

            <p className="text-base md:text-lg text-body leading-relaxed max-w-lg">
              Software engineer building AI integrations and enterprise tools.
              Currently at Botpress, McGill CS graduate. I build things that
              make developers more productive.
            </p>

            <div className="flex gap-3 flex-wrap pt-2">
              <a
                href="/Eric_Huang_Software-can.pdf"
                download
                className="bg-accent hover:bg-accent-hover text-accent-text px-6 py-2.5 rounded-[10px] transition-all hover:shadow-md font-semibold text-sm"
              >
                Download Resume
              </a>
              <Link
                href="/#contact"
                className="border border-accent text-accent hover:bg-accent/10 px-6 py-2.5 rounded-[10px] transition-all font-semibold text-sm"
              >
                Get in Touch
              </Link>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-full max-w-md">
              {/* Placeholder for illustration - using logo as placeholder for now */}
              <div className="relative aspect-square bg-gradient-to-br from-accent/15 to-accent/5 rounded-[1.25rem] p-8 flex items-center justify-center border border-border/50">
                <Image
                  src="/me.png"
                  alt="Portfolio illustration"
                  width={300}
                  height={300}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
