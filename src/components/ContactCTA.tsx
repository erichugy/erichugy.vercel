export default function ContactCTA() {
  return (
    <section id="contact" className="px-6 py-20 md:py-28 bg-page-alt relative overflow-hidden">
      {/* Blurred accent glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] rounded-full bg-accent/[0.06] blur-[100px]" />

      <div className="max-w-3xl mx-auto text-center relative">
        <p className="font-mono text-sm text-muted tracking-wide mb-3">
          {"// get in touch"}
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-4">
          Let&apos;s Work Together
        </h2>
        <p className="text-base md:text-lg text-muted mb-8 max-w-xl mx-auto leading-relaxed">
          Have a project in mind? I&apos;d love to hear from you.
        </p>
        <button className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-[10px] transition-all hover:shadow-md font-semibold text-sm">
          Get in Touch
        </button>
      </div>
    </section>
  );
}
