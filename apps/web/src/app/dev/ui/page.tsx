import UiGalleryClient from "./ui-gallery-client";

export const metadata = {
  title: "UI gallery | Eric Huang",
  description: "Every shared UI component, rendered in isolation for review.",
  // A development surface, not something that should turn up in search results.
  robots: { index: false, follow: false },
};

export default function UiGalleryPage() {
  return <UiGalleryClient />;
}
