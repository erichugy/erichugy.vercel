import Footer from "@/components/Footer";
import Navbar from "@/components/navbar";
import PageHero from "@/components/PageHero";
import { HOBBIES } from "@/data/hobbies";

import HobbyCard from "./components/HobbyCard";

export const metadata = {
  title: "Hobbies & Interests | Eric Huang",
  description:
    "Beyond code — rock climbing, photography, open source, and AI research.",
};

export default function HobbiesPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="// beyond_code"
          title="Hobbies & Interests"
          description="When I'm not writing code, you'll find me solving problems on the climbing wall, chasing golden hour with a camera, or diving into the latest AI research."
        />

        <section className="px-6 py-20 md:py-28 bg-page-alt">
          <div className="max-w-5xl mx-auto">
            <p className="font-mono text-sm text-muted tracking-wide mb-3">
              {"// what_i_enjoy"}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-3">
              Things I Love
            </h2>
            <p className="text-base md:text-lg text-muted max-w-2xl mb-12">
              A mix of physical challenges, creative outlets, and technical
              rabbit holes that keep me curious.
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {HOBBIES.map((hobby) => (
                <HobbyCard key={hobby.title} hobby={hobby} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
