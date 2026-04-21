import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import CalendarSection from "@/components/CalendarSection";
import EquipmentSection from "@/components/EquipmentSection";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";

const Index = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div id="hem">
        <HeroSection />
      </div>
      <ErrorBoundary>
        <AboutSection />
      </ErrorBoundary>

      {/* Calendar & Equipment side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 sm:px-6">
        <ErrorBoundary>
          <CalendarSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <EquipmentSection />
        </ErrorBoundary>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
