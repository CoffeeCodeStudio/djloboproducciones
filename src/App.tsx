import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useParams,
} from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { lazy, Suspense, useState } from "react";
import Layout from "@/components/Layout";
import ErrorBoundary from "@/components/ErrorBoundary";
import WhiteScreenGuard from "@/components/WhiteScreenGuard";
import WhiteScreenDebugOverlay from "@/components/WhiteScreenDebugOverlay";
import {
  DEFAULT_LANG,
  LEGACY_PATH_MAP,
  detectBrowserLang,
  isLang,
  localizedHref,
} from "@/lib/i18nRoutes";
import type { Language } from "@/contexts/LanguageContext";

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

/** Detect preferred language from storage; falls back to DEFAULT_LANG ("sv"). */
/**
 * Preferred language order:
 *   1. explicit user choice persisted in localStorage
 *   2. browser Accept-Language (navigator.languages)
 *   3. DEFAULT_LANG ("sv")
 */
const getPreferredLang = (): Language => {
  try {
    const stored = window.localStorage.getItem("dj-lobo-language");
    if (isLang(stored ?? undefined)) return stored as Language;
  } catch {
    /* ignore */
  }
  return detectBrowserLang();
};

/** /:lang gate — validates the lang segment, else redirects into a valid one. */
const LangGuard = () => {
  const { lang } = useParams();
  if (!isLang(lang)) {
    return <Navigate to={`/${getPreferredLang()}`} replace />;
  }
  return <Outlet />;
};

/**
 * Catches unprefixed paths (legacy bookmarks, inbound SEO links) and redirects
 * them into the user's preferred language. Also collapses legacy aliases
 * (/radio → /lyssna, etc.) into canonical paths.
 */
const LegacyRedirect = () => {
  const location = useLocation();
  const preferred = getPreferredLang();
  const canonical = LEGACY_PATH_MAP[location.pathname] ?? location.pathname;
  const target = `${localizedHref(canonical, preferred)}${location.search}${location.hash}`;
  return <Navigate to={target} replace />;
};

const AppShell = () => {
  const [routerResetKey, setRouterResetKey] = useState(0);

  return (
    <>
      <WhiteScreenDebugOverlay />
      <BrowserRouter key={routerResetKey}>
        <WhiteScreenGuard onSoftReset={() => setRouterResetKey((key) => key + 1)} />
        <LanguageProvider>
          <CookieConsentProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <ErrorBoundary>
                <Suspense fallback={<SuspenseFallback />}>
                  <Routes>
                    {/* Standalone, unlocalized pages (noindex'd, no nav/footer) */}
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Localized app */}
                    <Route path="/:lang" element={<LangGuard />}>
                      <Route element={<Layout />}>
                        <Route index element={<Index />} />
                        <Route path="lyssna" element={<ListenPage />} />
                        <Route path="mixar" element={<MixesPage />} />
                        <Route path="media" element={<MediaPage />} />
                        <Route path="referenser" element={<ReferencesPage />} />
                        <Route path="prislista" element={<PrislistaPage />} />
                        <Route path="privacy" element={<PrivacyPolicy />} />
                        <Route path="terms" element={<TermsOfService />} />
                        <Route path="*" element={<NotFound />} />
                      </Route>
                    </Route>

                    {/* Everything else: redirect into the preferred language. */}
                    <Route path="*" element={<LegacyRedirect />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </TooltipProvider>
          </CookieConsentProvider>
        </LanguageProvider>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppShell />
  </QueryClientProvider>
);

export default App;
