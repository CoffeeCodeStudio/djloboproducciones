import MixCardGrid from "@/components/MixCardGrid";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import Seo from "@/components/Seo";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSeoMeta } from "@/lib/seoMeta";

const H1_TEXT: Record<string, string> = {
  sv: "Mixar och DJ-set",
  en: "Mixes and DJ sets",
  es: "Mixes y sets de DJ",
};

const MixesPage = () => {
  const { language } = useLanguage();
  const meta = getSeoMeta("/mixar", language);
  return (
    <div className="max-w-7xl mx-auto">
      <Seo
        title={meta.title}
        description={meta.description}
        path="/mixar"
      />
      <h1 className="sr-only">{H1_TEXT[language] ?? H1_TEXT.sv}</h1>
      <ErrorBoundary>
        <MixCardGrid />
      </ErrorBoundary>
      <Footer />
    </div>
  );
};

export default MixesPage;
