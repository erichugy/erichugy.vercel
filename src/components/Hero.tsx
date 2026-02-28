import Image from "next/image";

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
              Full Stack Developer
            </h2>

            <p className="text-base md:text-lg text-body leading-relaxed max-w-lg">
              I&apos;m a full stack developer with a passion for building efficient,
              user-friendly websites and applications. Let&apos;s work together to
              bring your vision to life.
            </p>

            <div className="pt-2">
              <button className="bg-accent hover:bg-accent-hover text-accent-text px-6 py-2.5 rounded-[10px] transition-all hover:shadow-md font-semibold text-sm">
                View My Work
              </button>
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
