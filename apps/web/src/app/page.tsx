import About from "@/components/About";
import ContactCTA from "@/components/ContactCTA";
import FeaturedProjects from "@/components/FeaturedProjects";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturedProjects />
        <About />
        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
