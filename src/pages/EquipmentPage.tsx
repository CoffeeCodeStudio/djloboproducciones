import Navbar from "@/components/Navbar";
import EquipmentSection from "@/components/EquipmentSection";
import Footer from "@/components/Footer";
import NowPlayingBar from "@/components/NowPlayingBar";

const EquipmentPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <div className="mesh-gradient-bg" aria-hidden="true" />
      <div className="relative z-10">
        <Navbar />
        <main className="px-4 sm:px-6 pb-40">
          <div className="max-w-7xl mx-auto">
            <EquipmentSection />
          </div>
        </main>
        <Footer />
        <NowPlayingBar />
      </div>
    </div>
  );
};

export default EquipmentPage;
