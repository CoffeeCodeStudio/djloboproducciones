import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Upload, 
  Image, 
  Palette, 
  Save, 
  Loader2, 
  Check,
  Monitor,
  User,
  Layout,
  Sparkles,
  Youtube,
  Instagram,
  Trash2,
  History
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBranding, SiteBranding } from "@/hooks/useBranding";
import { supabase } from "@/integrations/supabase/client";

interface UploadHistoryItem {
  id: string;
  category: string;
  image_url: string;
  storage_path: string;
  created_at: string;
}

// Preset color themes
const COLOR_PRESETS = [
  { name: "Neon Pink", primary: "300 100% 50%", secondary: "180 100% 50%", accent: "270 100% 60%" },
  { name: "Electric Blue", primary: "220 100% 60%", secondary: "180 100% 50%", accent: "200 100% 50%" },
  { name: "Sunset Orange", primary: "25 100% 55%", secondary: "45 100% 50%", accent: "10 100% 50%" },
  { name: "Cyber Green", primary: "120 100% 45%", secondary: "180 100% 50%", accent: "150 100% 50%" },
  { name: "Purple Haze", primary: "280 100% 55%", secondary: "260 100% 50%", accent: "300 100% 60%" },
  { name: "Golden Hour", primary: "40 100% 50%", secondary: "60 100% 45%", accent: "30 100% 55%" },
];

const BrandingTab = () => {
  const { branding, loading, updateBranding, uploadImage, refetch } = useBranding();
  const { toast } = useToast();
  
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  
  // Local state for pending changes
  const [pendingChanges, setPendingChanges] = useState<Partial<SiteBranding>>({});
  const [previewImages, setPreviewImages] = useState<Record<string, string>>({});
  const [uploadHistory, setUploadHistory] = useState<Record<string, UploadHistoryItem[]>>({});
  
  const heroInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const fetchHistory = useCallback(async () => {
    const { data } = await supabase
      .from("image_upload_history" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12);
    if (data) {
      const grouped: Record<string, UploadHistoryItem[]> = {};
      for (const item of data as unknown as UploadHistoryItem[]) {
        if (!grouped[item.category]) grouped[item.category] = [];
        if (grouped[item.category].length < 3) grouped[item.category].push(item);
      }
      setUploadHistory(grouped);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    imageType: "hero" | "logo" | "background" | "profile"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ title: "❌ Fel filtyp", description: "Välj en bildfil (JPG, PNG eller WebP)", variant: "destructive" });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "❌ Bilden är för stor", description: `Bilden är ${(file.size / 1024 / 1024).toFixed(1)} MB. Välj en bild under 2 MB så att sidan laddar snabbt.`, variant: "destructive" });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImages((prev) => ({ ...prev, [imageType]: e.target?.result as string }));
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(imageType);
    const { url, error } = await uploadImage(file, imageType);
    setUploading(null);

    if (error) {
      toast({ title: "Upload Failed", description: error, variant: "destructive" });
      setPreviewImages((prev) => {
        const next = { ...prev };
        delete next[imageType];
        return next;
      });
      return;
    }

    // Add to pending changes
    const fieldMap = {
      hero: "hero_image_url",
      logo: "logo_url",
      background: "background_image_url",
      profile: "profile_image_url",
    };
    
    setPendingChanges((prev) => ({ ...prev, [fieldMap[imageType]]: url }));
    toast({ 
      title: "✅ Uppladdad!", 
      description: `${imageType}-bilden laddades upp. Klicka Spara för att aktivera.` 
    });
    fetchHistory();
  };

  const handleColorPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setPendingChanges((prev) => ({
      ...prev,
      primary_glow_color: preset.primary,
      secondary_glow_color: preset.secondary,
      accent_color: preset.accent,
    }));
  };

  const handleCustomColor = (colorType: string, value: string) => {
    // Convert hex to HSL
    const hsl = hexToHsl(value);
    if (hsl) {
      setPendingChanges((prev) => ({ ...prev, [colorType]: hsl }));
    }
  };

  const handleSave = async () => {
    if (Object.keys(pendingChanges).length === 0) {
      toast({ title: "No Changes", description: "Nothing to save" });
      return;
    }

    setSaving(true);
    const { error } = await updateBranding(pendingChanges);
    setSaving(false);

    if (error) {
      toast({ title: "Save Failed", description: error, variant: "destructive" });
    } else {
      toast({ title: "Saved!", description: "Branding updated successfully" });
      setPendingChanges({});
      setPreviewImages({});
      refetch();
    }
  };

  const getImagePreview = (imageType: "hero" | "logo" | "background" | "profile") => {
    if (previewImages[imageType]) return previewImages[imageType];
    
    const fieldMap = {
      hero: branding?.hero_image_url,
      logo: branding?.logo_url,
      background: branding?.background_image_url,
      profile: branding?.profile_image_url,
    };
    
    return fieldMap[imageType] || null;
  };

  const selectFromHistory = (imageType: "hero" | "logo" | "background" | "profile", url: string) => {
    const fieldMap = {
      hero: "hero_image_url",
      logo: "logo_url",
      background: "background_image_url",
      profile: "profile_image_url",
    } as const;
    setPendingChanges((prev) => ({ ...prev, [fieldMap[imageType]]: url }));
    setPreviewImages((prev) => ({ ...prev, [imageType]: url }));
    toast({ title: "✅ Vald!", description: "Bilden valdes från historiken. Klicka Spara för att aktivera." });
  };

  const renderRecentUploads = (category: "hero" | "logo" | "background" | "profile") => {
    const items = uploadHistory[category];
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-2 pt-2 border-t border-border/30">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <History className="w-3 h-3" />
          <span>Senaste uppladdningar</span>
        </div>
        <div className="flex gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => selectFromHistory(category, item.image_url)}
              className="relative w-16 h-16 rounded-md overflow-hidden border border-border/50 hover:border-primary/70 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50"
              title="Klicka för att välja denna bild"
            >
              <img src={item.image_url} alt="Tidigare uppladdning" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-6 pr-4">
        {/* Save Button - Sticky */}
        {hasPendingChanges && (
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-3 -mx-4 px-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Du har osparade ändringar
              </p>
              <Button onClick={handleSave} disabled={saving} className="neon-glow-cyan" size="lg">
                {saving ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                Spara
              </Button>
            </div>
          </div>
        )}

        {/* Profile Image */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <User className="w-5 h-5 text-neon-pink" />
              DJ Profile Picture
            </CardTitle>
            <CardDescription>Main profile image shown on the landing page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              {/* Preview */}
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-neon-pink/50 bg-muted/30 flex-shrink-0">
                {getImagePreview("profile") ? (
                  <img 
                    src={getImagePreview("profile")!} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                {uploading === "profile" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-3">
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, "profile")}
                />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => profileInputRef.current?.click()}
                    disabled={uploading === "profile"}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Photo
                  </Button>
                  {(getImagePreview("profile") || branding?.profile_image_url) && (
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => setPendingChanges((prev) => ({ ...prev, profile_image_url: null }))}
                      title="Ta bort profilbild"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 För bäst resultat: Fyrkantig bild (400×400 px), max 2 MB, JPG/PNG/WebP
                </p>
              </div>
            </div>
            {renderRecentUploads("profile")}
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-neon-purple" />
              Logo
            </CardTitle>
            <CardDescription>Your brand logo shown in the header and footer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              {/* Preview */}
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border/50 bg-muted/30 flex-shrink-0">
                {getImagePreview("logo") ? (
                  <img 
                    src={getImagePreview("logo")!} 
                    alt="Logo preview" 
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                {uploading === "logo" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-3">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, "logo")}
                />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploading === "logo"}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                  {(getImagePreview("logo") || branding?.logo_url) && (
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => setPendingChanges((prev) => ({ ...prev, logo_url: null }))}
                      title="Ta bort logo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 För bäst resultat: PNG med genomskinlig bakgrund, fyrkantig (400×400 px), max 2 MB
                </p>
              </div>
              {renderRecentUploads("logo")}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              YouTube Video
            </CardTitle>
            <CardDescription>Featured video shown on the landing page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-video-id">Video ID</Label>
              <Input
                id="youtube-video-id"
                placeholder="e.g. dQw4w9WgXcQ"
                value={pendingChanges.youtube_video_id ?? branding?.youtube_video_id ?? ""}
                onChange={(e) => setPendingChanges((prev) => ({ ...prev, youtube_video_id: e.target.value }))}
                className="bg-input border-border"
              />
              <p className="text-xs text-muted-foreground">
                Kopiera video-ID från YouTube URL (t.ex. youtube.com/watch?v=<strong>ABC123</strong>)
              </p>
            </div>
            
            {/* Video Preview */}
            {(pendingChanges.youtube_video_id || branding?.youtube_video_id) && (
              <div className="aspect-video rounded-lg overflow-hidden border border-border/50">
                <iframe
                  src={`https://www.youtube.com/embed/${pendingChanges.youtube_video_id || branding?.youtube_video_id}?rel=0&modestbranding=1`}
                  title="YouTube Video Preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Featured Videos Manager */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              Featured Videos Manager
            </CardTitle>
            <CardDescription>5 featured YouTube videos shown in the gallery section</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3, 4, 5].map((num) => {
              const fieldName = `live_set_video_${num}` as keyof typeof pendingChanges;
              const currentValue = pendingChanges[fieldName] ?? branding?.[fieldName as keyof typeof branding] ?? "";
              
              return (
                <div key={num} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-neon-cyan">{num}</span>
                    </div>
                    <Label htmlFor={`live-set-${num}`}>Featured Video ID {num}</Label>
                  </div>
                  <Input
                    id={`live-set-${num}`}
                    placeholder="YouTube video ID (t.ex. MGkHGrazGRc)"
                    value={currentValue as string}
                    onChange={(e) => setPendingChanges((prev) => ({ ...prev, [fieldName]: e.target.value || null }))}
                    className="bg-input border-border"
                  />
                  
                  {/* Video Preview */}
                  {currentValue && (
                    <div className="aspect-video rounded-lg overflow-hidden border border-border/50 max-w-md">
                      <iframe
                        src={`https://www.youtube.com/embed/${currentValue}?rel=0&modestbranding=1`}
                        title={`Featured Video ${num} Preview`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  )}
                </div>
              );
            })}
            
            <p className="text-xs text-muted-foreground">
              💡 Hitta video-ID i YouTube URL: youtube.com/watch?v=<strong>VIDEO_ID</strong>
              <br />
              DJ Lobo kanal: <a href="https://www.youtube.com/@djloboproducciones3211" target="_blank" rel="noopener noreferrer" className="text-neon-cyan hover:underline">@djloboproducciones3211</a>
            </p>
          </CardContent>
        </Card>

        {/* Instagram Posts Manager */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Instagram className="w-5 h-5 text-pink-500" />
              Instagram Posts Manager
            </CardTitle>
            <CardDescription>6 Instagram post URLs to feature in the gallery</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const fieldName = `instagram_post_${num}` as keyof typeof pendingChanges;
              const currentValue = pendingChanges[fieldName] ?? branding?.[fieldName as keyof typeof branding] ?? "";
              
              return (
                <div key={num} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-pink-500">{num}</span>
                    </div>
                    <Label htmlFor={`instagram-post-${num}`}>Instagram Post URL {num}</Label>
                  </div>
                  <Input
                    id={`instagram-post-${num}`}
                    placeholder="https://www.instagram.com/p/ABC123/"
                    value={currentValue as string}
                    onChange={(e) => setPendingChanges((prev) => ({ ...prev, [fieldName]: e.target.value || null }))}
                    className="bg-input border-border"
                  />
                  
                  {/* Current value indicator */}
                  {currentValue && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="truncate max-w-xs">{currentValue as string}</span>
                    </div>
                  )}
                </div>
              );
            })}
            
            <p className="text-xs text-muted-foreground">
              💡 Kopiera hela URL:en från Instagram-inlägget (t.ex. https://www.instagram.com/p/ABC123/)
            </p>
          </CardContent>
        </Card>

        {/* Color Theme */}
        <Card className="glass-card-pink">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Glow Colors
            </CardTitle>
            <CardDescription>Choose your site's neon glow theme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preset Themes */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Quick Presets</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = 
                    pendingChanges.primary_glow_color === preset.primary ||
                    branding?.primary_glow_color === preset.primary;
                  
                  return (
                    <button
                      key={preset.name}
                      onClick={() => handleColorPreset(preset)}
                      className={`relative p-4 rounded-lg border transition-all ${
                        isSelected 
                          ? "border-primary bg-primary/10" 
                          : "border-border/50 hover:border-primary/50 bg-muted/20"
                      }`}
                    >
                      <div className="flex gap-1 mb-2">
                        <span 
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: `hsl(${preset.primary})` }}
                        />
                        <span 
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: `hsl(${preset.secondary})` }}
                        />
                        <span 
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: `hsl(${preset.accent})` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{preset.name}</span>
                      {isSelected && (
                        <Check className="absolute top-2 right-2 w-4 h-4 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Colors */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Custom Colors</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Primary Glow</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={hslToHex(pendingChanges.primary_glow_color || branding?.primary_glow_color || "300 100% 50%")}
                      onChange={(e) => handleCustomColor("primary_glow_color", e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <div 
                      className="w-10 h-10 rounded neon-glow-pink"
                      style={{ 
                        backgroundColor: `hsl(${pendingChanges.primary_glow_color || branding?.primary_glow_color || "300 100% 50%"})` 
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Secondary Glow</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={hslToHex(pendingChanges.secondary_glow_color || branding?.secondary_glow_color || "180 100% 50%")}
                      onChange={(e) => handleCustomColor("secondary_glow_color", e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <div 
                      className="w-10 h-10 rounded neon-glow-cyan"
                      style={{ 
                        backgroundColor: `hsl(${pendingChanges.secondary_glow_color || branding?.secondary_glow_color || "180 100% 50%"})` 
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Accent</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={hslToHex(pendingChanges.accent_color || branding?.accent_color || "270 100% 60%")}
                      onChange={(e) => handleCustomColor("accent_color", e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <div 
                      className="w-10 h-10 rounded"
                      style={{ 
                        backgroundColor: `hsl(${pendingChanges.accent_color || branding?.accent_color || "270 100% 60%"})`,
                        boxShadow: `0 0 20px hsla(${pendingChanges.accent_color || branding?.accent_color || "270 100% 60%"}, 0.5)`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Live Preview</Label>
              <div 
                className="p-6 rounded-lg border border-border/50 bg-background"
                style={{
                  background: `linear-gradient(135deg, 
                    hsla(${pendingChanges.primary_glow_color || branding?.primary_glow_color || "300 100% 50%"}, 0.1),
                    hsla(${pendingChanges.secondary_glow_color || branding?.secondary_glow_color || "180 100% 50%"}, 0.1)
                  )`
                }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-12 h-12 rounded-full"
                    style={{ 
                      backgroundColor: `hsl(${pendingChanges.primary_glow_color || branding?.primary_glow_color || "300 100% 50%"})`,
                      boxShadow: `0 0 20px hsla(${pendingChanges.primary_glow_color || branding?.primary_glow_color || "300 100% 50%"}, 0.5)`
                    }}
                  />
                  <div>
                    <h4 
                      className="font-display font-bold"
                      style={{
                        background: `linear-gradient(90deg, 
                          hsl(${pendingChanges.primary_glow_color || branding?.primary_glow_color || "300 100% 50%"}), 
                          hsl(${pendingChanges.secondary_glow_color || branding?.secondary_glow_color || "180 100% 50%"})
                        )`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      DJ LOBO RADIO
                    </h4>
                    <p className="text-sm text-muted-foreground">Preview of your theme</p>
                  </div>
                </div>
                <Button 
                  size="sm"
                  style={{ 
                    backgroundColor: `hsl(${pendingChanges.primary_glow_color || branding?.primary_glow_color || "300 100% 50%"})`,
                    boxShadow: `0 0 15px hsla(${pendingChanges.primary_glow_color || branding?.primary_glow_color || "300 100% 50%"}, 0.4)`
                  }}
                >
                  Sample Button
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Site Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display">Site Information</CardTitle>
            <CardDescription>Basic site name and tagline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={pendingChanges.site_name ?? branding?.site_name ?? ""}
                onChange={(e) => setPendingChanges((prev) => ({ ...prev, site_name: e.target.value }))}
                placeholder="DJ Lobo Radio"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={pendingChanges.tagline ?? branding?.tagline ?? ""}
                onChange={(e) => setPendingChanges((prev) => ({ ...prev, tagline: e.target.value }))}
                placeholder="Bringing the best of 80s and 90s music"
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media Integration */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Instagram className="w-5 h-5 text-pink-500" />
              Social Media Integration
            </CardTitle>
            <CardDescription>Connect your YouTube channel and Instagram account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* YouTube Channel */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500" />
                <Label htmlFor="youtube-channel-id">YouTube Channel ID</Label>
              </div>
              <Input
                id="youtube-channel-id"
                placeholder="e.g. UC... eller @djloboproducciones3211"
                value={pendingChanges.youtube_channel_id ?? branding?.youtube_channel_id ?? ""}
                onChange={(e) => setPendingChanges((prev) => ({ ...prev, youtube_channel_id: e.target.value }))}
                className="bg-input border-border"
              />
              <p className="text-xs text-muted-foreground">
                Kanal-ID hittas i YouTube Studio → Inställningar → Kanal → Grundläggande info
              </p>
            </div>

            {/* Instagram Username */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Instagram className="w-5 h-5 text-pink-500" />
                <Label htmlFor="instagram-username">Instagram Username</Label>
              </div>
              <Input
                id="instagram-username"
                placeholder="e.g. djloboradio"
                value={pendingChanges.instagram_username ?? branding?.instagram_username ?? ""}
                onChange={(e) => setPendingChanges((prev) => ({ ...prev, instagram_username: e.target.value }))}
                className="bg-input border-border"
              />
              <p className="text-xs text-muted-foreground">
                Ditt Instagram-användarnamn (utan @)
              </p>
            </div>

            {/* Instagram Access Token - now stored securely in site_secrets table */}
            <p className="text-xs text-muted-foreground p-2 bg-card/50 rounded">
              <span className="font-medium">Instagram Access Token:</span> Hanteras nu separat för säkerhets skull. 
              Kontakta administratören för att uppdatera token.
            </p>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

// Helper: Convert HSL string to hex
function hslToHex(hsl: string): string {
  try {
    const [h, s, l] = hsl.split(" ").map((v) => parseFloat(v));
    const sNorm = s / 100;
    const lNorm = l / 100;
    
    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lNorm - c / 2;
    
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    
    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } catch {
    return "#ff00ff";
  }
}

// Helper: Convert hex to HSL string
function hexToHsl(hex: string): string | null {
  try {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  } catch {
    return null;
  }
}

export default BrandingTab;
