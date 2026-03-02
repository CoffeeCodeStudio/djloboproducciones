import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import NowPlayingBar from "@/components/NowPlayingBar";
import FloatingChatButton from "@/components/FloatingChatButton";
import CookieConsent from "@/components/CookieConsent";
import { useBranding } from "@/hooks/useBranding";

const Layout = () => {
  const location = useLocation();
  const [fadeKey, setFadeKey] = useState(location.key);
  const { branding } = useBranding();

  useEffect(() => {
    setFadeKey(location.key);
    window.scrollTo(0, 0);
  }, [location.key]);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <a href="#main-content" className="skip-link">
        Hoppa till huvudinnehåll
      </a>

      {/* Dynamic Background Image from Admin */}
      {branding?.background_image_url && (
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-15 pointer-events-none"
          style={{ backgroundImage: `url(${branding.background_image_url})` }}
          aria-hidden="true"
        />
      )}

      <div className="mesh-gradient-bg" aria-hidden="true" />
      <div className="relative z-10">
        <Navbar />
        <main
          key={fadeKey}
          id="main-content"
          tabIndex={-1}
          className="page-fade-in px-4 sm:px-6 pb-40"
        >
          <Outlet />
        </main>
        <NowPlayingBar />
        <FloatingChatButton />
      </div>
      <CookieConsent />
    </div>
  );
};

export default Layout;
