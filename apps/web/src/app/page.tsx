import About from "@/components/About";
import ContactCTA from "@/components/ContactCTA";
import FeaturedProjects from "@/components/FeaturedProjects";
import { FoodItem } from "@/components/FoodCollector";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import { FOOD_ITEMS } from "@/data/food-items";

const homeFoodItems = FOOD_ITEMS.filter((item) => item.page === "/");

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="relative">
        <Hero />
        <About />
        <FeaturedProjects />
        <ContactCTA />
        {homeFoodItems.map((item) => (
          <FoodItem key={item.id} id={item.id} emoji={item.emoji} className={item.className} />
        ))}
      </main>
      <Footer />
    </>
  );
}
