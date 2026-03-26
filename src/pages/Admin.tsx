import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Radio, ArrowLeft, LogOut, Palette, ImageIcon, Calendar, Star, Home, HelpCircle, Users } from "lucide-react";
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

const Admin = () => {
  const { user, isAdmin, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  if (!user) return <AdminLogin onSignIn={signIn} onSignUp={signUp} />;

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

  return (
    <div className="min-h-screen bg-background pb-safe">
      <div className="light-leak-purple" />
      <div className="light-leak-blue" />

      {/* Header - Mobile optimized */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50 safe-area-top">
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

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 relative z-10">
        <Tabs defaultValue="framsida" className="w-full">
          {/* Mobile-first tab navigation */}
          <TabsList className="grid w-full grid-cols-7 mb-4 sm:mb-8 glass-card h-auto p-1 gap-0.5">
            <TabsTrigger value="framsida" className="data-[state=active]:bg-primary/20 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-2 sm:py-2.5 px-0.5 sm:px-3 min-h-[52px] sm:min-h-0">
              <Home className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="text-[9px] sm:text-sm leading-tight">Hem</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:bg-primary/20 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-2 sm:py-2.5 px-0.5 sm:px-3 min-h-[52px] sm:min-h-0">
              <ImageIcon className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="text-[9px] sm:text-sm leading-tight">Media</span>
            </TabsTrigger>
            <TabsTrigger value="radio" className="data-[state=active]:bg-primary/20 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-2 sm:py-2.5 px-0.5 sm:px-3 min-h-[52px] sm:min-h-0">
              <Radio className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="text-[9px] sm:text-sm leading-tight">Radio</span>
            </TabsTrigger>
            <TabsTrigger value="omdomen" className="data-[state=active]:bg-primary/20 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-2 sm:py-2.5 px-0.5 sm:px-3 min-h-[52px] sm:min-h-0">
              <Star className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="text-[9px] sm:text-sm leading-tight">Omdömen</span>
            </TabsTrigger>
            <TabsTrigger value="spelningar" className="data-[state=active]:bg-primary/20 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-2 sm:py-2.5 px-0.5 sm:px-3 min-h-[52px] sm:min-h-0">
              <Calendar className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="text-[9px] sm:text-sm leading-tight">Event</span>
            </TabsTrigger>
            <TabsTrigger value="utseende" className="data-[state=active]:bg-primary/20 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-2 sm:py-2.5 px-0.5 sm:px-3 min-h-[52px] sm:min-h-0">
              <Palette className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="text-[9px] sm:text-sm leading-tight">Stil</span>
            </TabsTrigger>
            <TabsTrigger value="hjalp" className="data-[state=active]:bg-primary/20 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-2 sm:py-2.5 px-0.5 sm:px-3 min-h-[52px] sm:min-h-0">
              <HelpCircle className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="text-[9px] sm:text-sm leading-tight">Hjälp</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="framsida"><FramsidaTab /></TabsContent>
          <TabsContent value="media"><GalleryTab /></TabsContent>
          <TabsContent value="radio"><RadioTab /></TabsContent>
          <TabsContent value="omdomen"><TestimonialsTab /></TabsContent>
          <TabsContent value="spelningar"><SpelningarTab /></TabsContent>
          <TabsContent value="utseende"><BrandingTab /></TabsContent>
          <TabsContent value="hjalp"><HelpTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
