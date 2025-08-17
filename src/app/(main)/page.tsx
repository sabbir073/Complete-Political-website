import Hero from "@/components/Hero";
import GreatLeader from "@/components/GreatLeader";
import Events from "@/components/Events";
import AboutMe from "@/components/AboutMe";
import PhotoGallery from "@/components/PhotoGallery";
import Blog from "@/components/Blog";
import VideoGallery from "@/components/VideoGallery";

export default function HomePage() {
  return (
    <main className="">
      <Hero />
      
      <GreatLeader />
      
      <Events />
      
      <AboutMe />
      
      <PhotoGallery />
      
      <Blog />
      
      <VideoGallery />
    </main>
  );
}
