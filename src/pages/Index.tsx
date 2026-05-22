import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import CalendarSection from "@/components/CalendarSection";

import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import Seo from "@/components/Seo";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSeoMeta } from "@/lib/seoMeta";

const Index = () => {
  const { language } = useLanguage();
  const meta = getSeoMeta("/", language);
  return (
    <div className="max-w-7xl mx-auto">
      <Seo
        title={meta.title}
        description={meta.description}
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
