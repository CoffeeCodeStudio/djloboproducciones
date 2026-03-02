import Navbar from "@/components/Navbar";
import SocialGallerySection from "@/components/SocialGallerySection";
import SoundCloudMixes from "@/components/SoundCloudMixes";
import LiveChat from "@/components/LiveChat";
import Footer from "@/components/Footer";
import NowPlayingBar from "@/components/NowPlayingBar";
import FloatingChatButton from "@/components/FloatingChatButton";

const RadioPage = () => {
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
            <div id="mixar">
              <SocialGallerySection />
            </div>
            <SoundCloudMixes />
            <LiveChat />
          </div>
        </main>
        <Footer />
        <NowPlayingBar />
        <FloatingChatButton />
      </div>
    </div>
  );
};

export default RadioPage;
