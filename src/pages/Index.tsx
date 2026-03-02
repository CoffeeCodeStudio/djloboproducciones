import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BookingSection from "@/components/BookingSection";
import CalendarSection from "@/components/CalendarSection";
import SoundCloudMixes from "@/components/SoundCloudMixes";
import Footer from "@/components/Footer";
import NowPlayingBar from "@/components/NowPlayingBar";
import FloatingChatButton from "@/components/FloatingChatButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <a href="#main-content" className="skip-link">
        Hoppa till huvudinnehåll
      </a>
      <div className="mesh-gradient-bg" aria-hidden="true" />
      <div className="relative z-10">
        <Navbar />
        <main id="main-content" tabIndex={-1} className="px-4 sm:px-6 pb-40">
          <div className="max-w-7xl mx-auto">
            <div id="hem">
              <HeroSection />
            </div>
            <BookingSection />
            <CalendarSection />
            <SoundCloudMixes preview />
          </div>
        </main>
        <Footer />
        <NowPlayingBar />
        <FloatingChatButton />
      </div>
    </div>
  );
};

export default Index;
