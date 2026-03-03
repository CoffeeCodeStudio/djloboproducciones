import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { lazy, Suspense } from "react";
import Layout from "@/components/Layout";
import ErrorBoundary from "@/components/ErrorBoundary";
import GlobalMiniPlayer from "@/components/GlobalMiniPlayer";

// Lazy-loaded pages
const Index = lazy(() => import("./pages/Index"));
const ListenPage = lazy(() => import("./pages/ListenPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const EquipmentPage = lazy(() => import("./pages/EquipmentPage"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));

const queryClient = new QueryClient();

const SuspenseFallback = () => (
  <div className="flex items-center justify-center py-32">
    <div className="loading-spinner" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <Suspense fallback={<SuspenseFallback />}>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/lyssna" element={<ListenPage />} />
                  <Route path="/radio" element={<Navigate to="/lyssna" replace />} />
                  <Route path="/mixes" element={<Navigate to="/lyssna" replace />} />
                  <Route path="/galleri" element={<GalleryPage />} />
                  <Route path="/referenser" element={<Navigate to="/galleri" replace />} />
                  <Route path="/utrustning" element={<EquipmentPage />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
            <GlobalMiniPlayer />
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
