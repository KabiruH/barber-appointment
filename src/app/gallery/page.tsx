// app/gallery/page.tsx
import InstagramGallery from "@/components/gallery/Instagram-gallery";

export const metadata = {
  title: "Gallery | Havan Cutz",
  description: "Check out our latest transformations and styles. Browse through our work and get inspired for your next look.",
};

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <InstagramGallery />
    </div>
  );
}