import MixCardGrid from "@/components/MixCardGrid";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import Seo from "@/components/Seo";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSeoMeta } from "@/lib/seoMeta";

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
      <ErrorBoundary>
        <MixCardGrid />
      </ErrorBoundary>
      <Footer />
    </div>
  );
};

export default MixesPage;
