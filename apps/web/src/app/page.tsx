import Footer from "@/components/Footer";
import Navbar from "@/components/navbar";

import ExperiencePreview from "./home/ExperiencePreview";
import FeaturedProjects from "./home/FeaturedProjects";
import Hero from "./home/Hero";

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ExperiencePreview />
        <FeaturedProjects />
      </main>
      <Footer />
    </>
  );
}
