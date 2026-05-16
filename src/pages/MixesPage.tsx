import MixCardGrid from "@/components/MixCardGrid";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import Seo from "@/components/Seo";

const MixesPage = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <Seo
        title="Mixar – DJ Lobo | Latin, 80-tal, 90-tal & House"
        description="Lyssna på inspelade DJ-mixar från DJ Lobo — Latin beats, salsa, reggaeton, 80-tal, 90-tal och house. Uppdateras kontinuerligt via Mixcloud."
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
