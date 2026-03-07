import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Radio, ArrowLeft, LogOut, Palette, ImageIcon, Calendar, Star, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import AdminLogin from "@/components/AdminLogin";
import FramsidaTab from "@/components/admin/FramsidaTab";
import GalleryTab from "@/components/admin/GalleryTab";
import RadioTab from "@/components/admin/RadioTab";
import TestimonialsTab from "@/components/admin/TestimonialsTab";
import SpelningarTab from "@/components/admin/SpelningarTab";
import BrandingTab from "@/components/admin/BrandingTab";

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
    <div className="min-h-screen bg-background">
      <div className="light-leak-purple" />
      <div className="light-leak-blue" />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="hover:bg-muted flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10"><ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /></Button>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full icon-gradient-pink flex items-center justify-center flex-shrink-0"><Radio className="w-4 h-4 sm:w-5 sm:h-5 text-white" /></div>
              <div className="min-w-0">
                <h1 className="font-display text-base sm:text-xl text-neon-gradient">Kontrollpanel</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <Badge variant="outline" className="border-primary/50 text-primary text-[10px] sm:text-xs px-1.5 sm:px-2.5"><Shield className="w-3 h-3 mr-1" />Admin</Badge>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 sm:h-10 sm:w-10"><LogOut className="w-4 h-4 sm:w-5 sm:h-5" /></Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 relative z-10">
        <Tabs defaultValue="framsida" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 mb-4 sm:mb-8 glass-card h-auto gap-0.5 p-1">
            <TabsTrigger value="framsida" className="data-[state=active]:bg-primary/20 text-xs sm:text-sm py-2 px-1.5 sm:px-3">
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Framsida</span>
              <span className="sm:hidden ml-1">Hem</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:bg-primary/20 text-xs sm:text-sm py-2 px-1.5 sm:px-3">
              <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
              <span className="ml-1 sm:ml-0">Media</span>
            </TabsTrigger>
            <TabsTrigger value="radio" className="data-[state=active]:bg-primary/20 text-xs sm:text-sm py-2 px-1.5 sm:px-3">
              <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
              <span className="ml-1 sm:ml-0">Radio</span>
            </TabsTrigger>
            <TabsTrigger value="omdomen" className="data-[state=active]:bg-primary/20 text-xs sm:text-sm py-2 px-1.5 sm:px-3">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
              <span className="hidden xs:inline ml-1 sm:ml-0">Omdömen</span>
              <span className="xs:hidden ml-1">⭐</span>
            </TabsTrigger>
            <TabsTrigger value="spelningar" className="data-[state=active]:bg-primary/20 text-xs sm:text-sm py-2 px-1.5 sm:px-3">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
              <span className="hidden xs:inline ml-1 sm:ml-0">Spelningar</span>
              <span className="xs:hidden ml-1">📅</span>
            </TabsTrigger>
            <TabsTrigger value="utseende" className="data-[state=active]:bg-primary/20 text-xs sm:text-sm py-2 px-1.5 sm:px-3">
              <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
              <span className="hidden xs:inline ml-1 sm:ml-0">Utseende</span>
              <span className="xs:hidden ml-1">🎨</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="framsida"><FramsidaTab /></TabsContent>
          <TabsContent value="media"><GalleryTab /></TabsContent>
          <TabsContent value="radio"><RadioTab /></TabsContent>
          <TabsContent value="omdomen"><TestimonialsTab /></TabsContent>
          <TabsContent value="spelningar"><SpelningarTab /></TabsContent>
          <TabsContent value="utseende"><BrandingTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
