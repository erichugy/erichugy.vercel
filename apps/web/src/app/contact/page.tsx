import Footer from "@/components/Footer";
import Navbar from "@/components/navbar";

import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact | Eric Huang",
  description: "Get in touch with Eric Huang.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
