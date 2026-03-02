import HeroSection from "@/components/HeroSection";
import BookingSection from "@/components/BookingSection";
import CalendarSection from "@/components/CalendarSection";
import SoundCloudMixes from "@/components/SoundCloudMixes";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";

const Index = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div id="hem">
        <HeroSection />
      </div>
      <BookingSection />
      <ErrorBoundary>
        <CalendarSection />
      </ErrorBoundary>
      <ErrorBoundary>
        <SoundCloudMixes preview />
      </ErrorBoundary>
      <Footer />
    </div>
  );
};

export default Index;
