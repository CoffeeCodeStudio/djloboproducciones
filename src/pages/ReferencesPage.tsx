import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSeoMeta } from "@/lib/seoMeta";

const ReferencesPage = () => {
  const { language } = useLanguage();
  const meta = getSeoMeta("/referenser", language);
  return (
    <div className="max-w-7xl mx-auto">
      <Seo
        title={meta.title}
        description={meta.description}
        path="/referenser"
      />
      <TestimonialsSection />
      <Footer />
    </div>
  );
};

export default ReferencesPage;
