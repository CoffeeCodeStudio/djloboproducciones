import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Radio, ArrowLeft, LogOut, Palette, ImageIcon, Calendar, Star, Home, HelpCircle, Users, Megaphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import AdminLogin from "@/components/AdminLogin";
import FramsidaTab from "@/components/admin/FramsidaTab";
import GalleryTab from "@/components/admin/GalleryTab";
import RadioTab from "@/components/admin/RadioTab";
import TestimonialsTab from "@/components/admin/TestimonialsTab";
import SpelningarTab from "@/components/admin/SpelningarTab";
import BrandingTab from "@/components/admin/BrandingTab";
import HelpTab from "@/components/admin/HelpTab";
import UsersTab from "@/components/admin/UsersTab";
import PromosTab from "@/components/admin/PromosTab";

const TAB_DEFS = [
  { value: "framsida",   icon: Home,       label: "Hem" },
  { value: "media",      icon: ImageIcon,  label: "Media" },
  { value: "reklam",     icon: Megaphone,  label: "Reklam" },
  { value: "radio",      icon: Radio,      label: "Radio" },
  { value: "omdomen",    icon: Star,       label: "Omdömen" },
  { value: "spelningar", icon: Calendar,   label: "Event" },
  { value: "utseende",   icon: Palette,    label: "Stil" },
  { value: "hjalp",      icon: HelpCircle, label: "Hjälp" },
  { value: "anvandare",  icon: Users,      label: "Konto" },
] as const;

const Admin = () => {
  const { user, isAdmin, loading: authLoading, signIn, signUp, signOut, resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>("framsida");
  const headerRef = useRef<HTMLElement | null>(null);
  const tabBarRef = useRef<HTMLDivElement | null>(null);

  // Publish header height as a CSS variable so sticky save-bars in tab
  // components can align to the actual header bottom (not a hardcoded offset).
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const apply = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--admin-header-h", `${Math.round(h)}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener("resize", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
      document.documentElement.style.removeProperty("--admin-header-h");
    };
  }, [user, isAdmin]);

  // Auto-scroll the active tab into view on mobile when it changes.
  useEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;
    const active = bar.querySelector<HTMLElement>(`[data-tab-value="${activeTab}"]`);
    if (active) {
      active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeTab]);

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Utloggad", description: "Du har loggats ut." });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="light-leak-purple" />
        <div className="light-leak-blue" />
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) return <AdminLogin onSignIn={signIn} onSignUp={signUp} onResetPassword={resetPassword} />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="light-leak-purple" />
        <div className="light-leak-blue" />
        <Card className="glass-card-neon w-full max-w-md relative z-10">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="font-display text-2xl text-foreground">Åtkomst nekad</CardTitle>
            <CardDescription>Du har inte adminbehörighet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">Inloggad som: {user.email}</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/")}><ArrowLeft className="w-4 h-4 mr-2" />Startsidan</Button>
              <Button variant="destructive" className="flex-1" onClick={handleSignOut}><LogOut className="w-4 h-4 mr-2" />Logga ut</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeLabel = TAB_DEFS.find((t) => t.value === activeTab)?.label ?? "";

  return (
    <div className="min-h-screen bg-background pb-safe">
      <div className="light-leak-purple" />
      <div className="light-leak-blue" />

      {/* Header */}
      <header ref={headerRef} className="sticky top-0 z-50 glass-card border-b border-border/50 safe-area-top">
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="hover:bg-muted flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full icon-gradient-pink flex items-center justify-center flex-shrink-0">
                <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-base sm:text-xl text-neon-gradient leading-tight">Kontrollpanel</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-none">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            <Badge variant="outline" className="border-primary/50 text-primary text-[10px] sm:text-xs px-1.5 sm:px-2.5 h-6 sm:h-auto hidden xs:flex">
              <Shield className="w-3 h-3 mr-0.5 sm:mr-1" />Admin
            </Badge>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover:bg-destructive/10 hover:text-destructive h-9 w-9 sm:h-10 sm:w-10">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile-only sticky section title — gives context on long pages */}
      <div
        className="sm:hidden sticky z-40 bg-background/95 backdrop-blur border-b border-border/50"
        style={{ top: "var(--admin-header-h, 60px)" }}
      >
        <div className="container mx-auto px-3 py-2">
          <h2 className="font-display text-lg text-neon-gradient leading-tight truncate">{activeLabel}</h2>
        </div>
      </div>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile: scrollable horizontal tab bar with edge fades.
              Desktop: existing grid layout. */}
          <div className="relative mb-4 sm:mb-8">
            {/* Edge fade indicators (mobile only) */}
            <div
              aria-hidden="true"
              className="sm:hidden pointer-events-none absolute left-0 top-0 bottom-0 w-6 z-10"
              style={{ background: "linear-gradient(to right, hsl(var(--background)), transparent)" }}
            />
            <div
              aria-hidden="true"
              className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-6 z-10"
              style={{ background: "linear-gradient(to left, hsl(var(--background)), transparent)" }}
            />

            <div
              ref={tabBarRef}
              className="overflow-x-auto sm:overflow-visible scrollbar-none -mx-3 sm:mx-0 px-3 sm:px-0"
              style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
            >
              <TabsList className="inline-flex sm:grid w-auto sm:w-full sm:grid-cols-9 glass-card h-auto p-1 gap-0.5">
                {TAB_DEFS.map(({ value, icon: Icon, label }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    data-tab-value={value}
                    className="data-[state=active]:bg-primary/20 flex-shrink-0 flex flex-row sm:flex-row items-center justify-center gap-1.5 px-3 py-2.5 sm:px-3 sm:py-2.5 min-h-[44px] sm:min-h-0"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm leading-tight whitespace-nowrap">{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          <TabsContent value="framsida"><FramsidaTab /></TabsContent>
          <TabsContent value="media"><GalleryTab /></TabsContent>
          <TabsContent value="reklam"><PromosTab /></TabsContent>
          <TabsContent value="radio"><RadioTab /></TabsContent>
          <TabsContent value="omdomen"><TestimonialsTab /></TabsContent>
          <TabsContent value="spelningar"><SpelningarTab /></TabsContent>
          <TabsContent value="utseende"><BrandingTab /></TabsContent>
          <TabsContent value="hjalp"><HelpTab /></TabsContent>
          <TabsContent value="anvandare"><UsersTab currentUserId={user.id} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
