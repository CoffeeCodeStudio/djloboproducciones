import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { lazy, Suspense } from "react";
import Layout from "@/components/Layout";
import ErrorBoundary from "@/components/ErrorBoundary";

const Index = lazy(() => import("./pages/Index"));
const ListenPage = lazy(() => import("./pages/ListenPage"));
const MediaPage = lazy(() => import("./pages/MediaPage"));
const MixesPage = lazy(() => import("./pages/MixesPage"));
const ReferencesPage = lazy(() => import("./pages/ReferencesPage"));

const PrislistaPage = lazy(() => import("./pages/PrislistaPage"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

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
                  <Route path="/mixar" element={<MixesPage />} />
                  <Route path="/media" element={<MediaPage />} />
                  <Route path="/referenser" element={<ReferencesPage />} />
                  <Route path="/spelningar" element={<Navigate to="/" replace />} />
                  <Route path="/prislista" element={<PrislistaPage />} />
                  {/* Legacy redirects */}
                  <Route path="/radio" element={<Navigate to="/lyssna" replace />} />
                  <Route path="/mixes" element={<Navigate to="/media" replace />} />
                  <Route path="/galleri" element={<Navigate to="/media" replace />} />
                  <Route path="/utrustning" element={<Navigate to="/spelningar" replace />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
