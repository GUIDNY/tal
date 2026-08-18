import Hero from "@/components/Hero";
import Showreel from "@/components/Showreel";
import About from "@/components/About";
import Experience from "@/components/Experience";
import EventTypes from "@/components/EventTypes";
import PhotoGallery from "@/components/PhotoGallery";
import Testimonials from "@/components/Testimonials";
import SocialSection from "@/components/SocialSection";
import CTASection from "@/components/CTASection";

export default function Home() {
  return (
    <>
      <Hero />
      <Showreel />
      <About />
      <Experience />
      <EventTypes />
      <PhotoGallery />
      <Testimonials />
      <SocialSection />
      <CTASection />
    </>
  );
}
