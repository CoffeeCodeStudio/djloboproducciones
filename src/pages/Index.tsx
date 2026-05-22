import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import CalendarSection from "@/components/CalendarSection";

import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import Seo from "@/components/Seo";

const Index = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <Seo
        title="DJ Lobo – Boka DJ i Göteborg | Latin Beats, 80-tal & 90-tal"
        description="DJ Lobo Producciones – Boka DJ i Göteborg. 20+ års erfarenhet av Latin beats, salsa, reggaeton, 80-tal och 90-tal. Bröllop, företagsevent och fester."
        path="/"
      />
      <div id="hem">
        <HeroSection />
      </div>
      <ErrorBoundary>
        <AboutSection />
      </ErrorBoundary>

      <ErrorBoundary>
        <CalendarSection />
      </ErrorBoundary>

      <ErrorBoundary>
        <ContactSection />
      </ErrorBoundary>

      <Footer />
    </div>
  );
};

export default Index;
