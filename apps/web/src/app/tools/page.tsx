import Footer from "@/components/Footer";
import Navbar from "@/components/navbar";
import PageHero from "@/components/PageHero";
import { TOOLS } from "@/data/tools";

import ToolCard from "./components/ToolCard";

export const metadata = {
  title: "Tools | Eric Huang",
  description: "Interactive developer tools built by Eric Huang — try them live.",
};

export default function ToolsPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="// tools"
          title="Tools"
          description="Interactive developer tools I've built — try them live."
        />

        <section className="px-6 py-20 md:py-28 bg-page-alt">
          <div className="max-w-5xl mx-auto">
            <div className="grid gap-8 md:grid-cols-2">
              {TOOLS.map((tool) => (
                <ToolCard key={tool.title} tool={tool} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
