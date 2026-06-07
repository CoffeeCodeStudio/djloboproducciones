import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSeoMeta } from "@/lib/seoMeta";

const H1_TEXT: Record<string, string> = {
  sv: "Omdömen och referenser",
  en: "Reviews and references",
  es: "Opiniones y referencias",
};

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
      <h1 className="sr-only">{H1_TEXT[language] ?? H1_TEXT.sv}</h1>
      <TestimonialsSection />
      <Footer />
    </div>
  );
};

export default ReferencesPage;
