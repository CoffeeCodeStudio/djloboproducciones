import SocialGallerySection from "@/components/SocialGallerySection";
import SoundCloudMixes from "@/components/SoundCloudMixes";
import LiveChat from "@/components/LiveChat";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";

const RadioPage = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div id="mixar">
        <SocialGallerySection />
      </div>
      <ErrorBoundary>
        <SoundCloudMixes />
      </ErrorBoundary>
      <LiveChat />
      <Footer />
    </div>
  );
};

export default RadioPage;
