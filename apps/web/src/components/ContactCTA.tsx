"use client";

import { useState, FormEvent } from "react";

type Status = "idle" | "sending" | "success" | "error";

const EMAIL = "ehugy.business@gmail.com";
const WEBHOOK_URL = process.env.NEXT_PUBLIC_CONTACT_WEBHOOK_URL;

export default function ContactCTA() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const webhookAvailable = !!WEBHOOK_URL;
  const isSending = status === "sending";
  const fieldsDisabled = !webhookAvailable || isSending;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!WEBHOOK_URL) return;

    setStatus("sending");
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("Non-200 response");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function resetForm() {
    setName("");
    setEmail("");
    setMessage("");
    setStatus("idle");
  }

  return (
    <section
      id="contact"
      className="px-6 py-20 md:py-28 bg-page-alt relative overflow-hidden"
    >
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

        {/* Form card */}
        <div className="card-glow bg-card rounded-xl border border-border p-6 md:p-8 max-w-xl mx-auto">
          {status === "success" ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <svg
                className="w-12 h-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-heading font-semibold text-lg">
                Message sent! I&apos;ll get back to you soon.
              </p>
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-accent hover:underline"
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!webhookAvailable && (
                <p className="text-sm text-muted">
                  Contact form is currently unavailable. Please{" "}
                  <a
                    href={`mailto:${EMAIL}`}
                    className="text-accent hover:underline"
                  >
                    email me directly
                  </a>
                  .
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={fieldsDisabled}
                  className="w-full bg-page border border-border rounded-[10px] px-4 py-2.5 text-sm text-heading placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
                />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={fieldsDisabled}
                  className="w-full bg-page border border-border rounded-[10px] px-4 py-2.5 text-sm text-heading placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <textarea
                name="message"
                required
                placeholder="Tell me about your project..."
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={fieldsDisabled}
                className="w-full bg-page border border-border rounded-[10px] px-4 py-2.5 text-sm text-heading placeholder:text-muted focus:border-accent focus:outline-none transition-colors resize-none"
              />

              <button
                type="submit"
                disabled={fieldsDisabled}
                className="w-full bg-accent hover:bg-accent-hover text-accent-text px-6 py-2.5 rounded-[10px] transition-all hover:shadow-md font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? "Sending..." : "Send Message"}
              </button>

              {status === "error" && (
                <p className="text-sm text-red-500">
                  Something went wrong. Please try again or email me directly at{" "}
                  <a
                    href={`mailto:${EMAIL}`}
                    className="underline hover:text-red-400"
                  >
                    {EMAIL}
                  </a>
                </p>
              )}
            </form>
          )}
        </div>

        {/* Permanent fallback */}
        <p className="mt-4 text-xs text-muted">
          Or email me directly at{" "}
          <a href={`mailto:${EMAIL}`} className="text-accent hover:underline">
            {EMAIL}
          </a>
        </p>
      </div>
    </section>
  );
}
