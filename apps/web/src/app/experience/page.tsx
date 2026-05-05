import Footer from "@/components/Footer";
import Navbar from "@/components/navbar";
import { SHOW_ACTIVITIES } from "@/config/feature-flags";

import Activities from "./components/Activities";
import Certifications from "./components/Certifications";
import EducationTimeline from "./components/EducationTimeline";
import Intro from "./components/Intro";
import ResumePreview from "./components/ResumePreview";
import Skills from "./components/Skills";
import WorkExperience from "./components/WorkExperience";

export const metadata = {
  title: "Experience | Eric Huang",
  description:
    "Learn more about my experience, skills, education, and activities.",
};

export default function ExperiencePage() {
  return (
    <>
      <Navbar />
      <main>
        <Intro />
        <WorkExperience />
        <EducationTimeline />
        <Skills />
        <Certifications />
        <ResumePreview />
        {SHOW_ACTIVITIES && <Activities />}
      </main>
      <Footer />
    </>
  );
}
