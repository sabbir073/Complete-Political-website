"use client";

import Hero from "@/components/Hero";
import GreatLeader from "@/components/GreatLeader";
import Events from "@/components/Events";
import AboutMe from "@/components/AboutMe";
import PhotoGallery from "@/components/PhotoGallery";
import Blog from "@/components/Blog";
import VideoGallery from "@/components/VideoGallery";
import { useHomeSettings } from "@/hooks/useHomeSettings";

export default function HomePage() {
  const { homeSettings, loading } = useHomeSettings();

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading page...</p>
        </div>
      </main>
    );
  }

  // Define section components map
  const sectionComponents = {
    hero: homeSettings?.home_hero_section_show ? <Hero /> : null,
    leader: homeSettings?.home_leader_section_show ? <GreatLeader /> : null,
    events: homeSettings?.home_events_section_show ? <Events /> : null,
    about: homeSettings?.home_about_section_show ? <AboutMe /> : null,
    gallery: homeSettings?.home_gallery_section_show ? <PhotoGallery /> : null,
    blog: homeSettings?.home_blog_section_show ? <Blog /> : null,
    video: homeSettings?.home_video_section_show ? <VideoGallery /> : null,
  };

  // Get sections order from settings
  const sectionsOrder = homeSettings?.home_sections_order || ['hero', 'leader', 'events', 'about', 'gallery', 'blog', 'video'];

  return (
    <main className="">
      {sectionsOrder.map((sectionKey) => (
        sectionComponents[sectionKey as keyof typeof sectionComponents] && (
          <div key={sectionKey}>
            {sectionComponents[sectionKey as keyof typeof sectionComponents]}
          </div>
        )
      ))}
    </main>
  );
}
