import Navbar from "@/components/Navbar";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import NowPlayingBar from "@/components/NowPlayingBar";

const ReferencesPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <div className="mesh-gradient-bg" aria-hidden="true" />
      <div className="relative z-10">
        <Navbar />
        <main className="px-4 sm:px-6 pb-32">
          <div className="max-w-7xl mx-auto">
            <TestimonialsSection />
          </div>
        </main>
        <Footer />
        <NowPlayingBar />
      </div>
    </div>
  );
};

export default ReferencesPage;
