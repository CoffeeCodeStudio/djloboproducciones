import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const ReferencesPage = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <Seo
        title="Referenser & Omdömen – DJ Lobo Producciones"
        description="Läs vad tidigare kunder säger om DJ Lobo. Bröllop, företagsevent och privatfester i Göteborg och hela Sverige."
        path="/referenser"
      />
      <TestimonialsSection />
      <Footer />
    </div>
  );
};

export default ReferencesPage;
