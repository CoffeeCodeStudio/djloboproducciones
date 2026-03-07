import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Upload, 
  Palette, 
  Save, 
  Loader2, 
  Check,
  Sparkles,
  Trash2,
  History,
  Share2,
  CheckCircle2
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

const COLOR_PRESETS = [
  { name: "Neon Rosa", primary: "300 100% 50%", secondary: "180 100% 50%", accent: "270 100% 60%" },
  { name: "Elektrisk Blå", primary: "220 100% 60%", secondary: "180 100% 50%", accent: "200 100% 50%" },
  { name: "Solnedgång", primary: "25 100% 55%", secondary: "45 100% 50%", accent: "10 100% 50%" },
  { name: "Cyber Grön", primary: "120 100% 45%", secondary: "180 100% 50%", accent: "150 100% 50%" },
  { name: "Lila Dis", primary: "280 100% 55%", secondary: "260 100% 50%", accent: "300 100% 60%" },
  { name: "Gyllene Timmen", primary: "40 100% 50%", secondary: "60 100% 45%", accent: "30 100% 55%" },
];

const PLACEHOLDER_LOGO = "/placeholder.svg";

const BrandingTab = () => {
  const { branding, loading, updateBranding, uploadImage, refetch } = useBranding();
  const { toast } = useToast();
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Partial<SiteBranding>>({});
  const [previewImages, setPreviewImages] = useState<Record<string, string>>({});
  const [uploadHistory, setUploadHistory] = useState<Record<string, UploadHistoryItem[]>>({});
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const ogInputRef = useRef<HTMLInputElement>(null);

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
    imageType: "logo" | "hero" | "background" | "profile",
    fieldName: string,
    maxSizeKB?: number
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "❌ Fel filtyp", description: "Välj en bildfil (JPG, PNG eller WebP)", variant: "destructive" });
      return;
    }

    const maxBytes = maxSizeKB ? maxSizeKB * 1024 : 2 * 1024 * 1024;
    const maxLabel = maxSizeKB ? `${maxSizeKB} KB` : "2 MB";
    if (file.size > maxBytes) {
      toast({ 
        title: "❌ Bilden är för stor", 
        description: `Bilden är ${(file.size / 1024).toFixed(0)} KB. Max storlek: ${maxLabel}.`, 
        variant: "destructive" 
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImages((prev) => ({ ...prev, [imageType]: e.target?.result as string }));
    };
    reader.readAsDataURL(file);

    setUploading(imageType);
    const { url, error } = await uploadImage(file, imageType);
    setUploading(null);

    if (error) {
      toast({ title: "❌ Uppladdningsfel", description: error, variant: "destructive" });
      setPreviewImages((prev) => { const next = { ...prev }; delete next[imageType]; return next; });
      return;
    }

    setPendingChanges((prev) => ({ ...prev, [fieldName]: url }));
    toast({ title: "✅ Uppladdad!", description: "Klicka 'Spara ändringar' för att aktivera." });
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
    const hsl = hexToHsl(value);
    if (hsl) setPendingChanges((prev) => ({ ...prev, [colorType]: hsl }));
  };

  const handleSave = async () => {
    if (Object.keys(pendingChanges).length === 0) {
      toast({ title: "Inga ändringar", description: "Det finns inget att spara." });
      return;
    }

    setSaving(true);
    const { error } = await updateBranding(pendingChanges);
    setSaving(false);

    if (error) {
      toast({ title: "❌ Kunde inte spara", description: error, variant: "destructive" });
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast({ title: "✅ Sparat!", description: "Alla ändringar har sparats." });
      setPendingChanges({});
      setPreviewImages({});
      refetch();
    }
  };

  const getImagePreview = (imageType: string) => {
    if (previewImages[imageType]) return previewImages[imageType];
    const fieldMap: Record<string, string | null | undefined> = {
      logo: branding?.logo_url,
      og: (branding as any)?.og_image_url,
    };
    return fieldMap[imageType] || null;
  };

  const selectFromHistory = (imageType: string, fieldName: string, url: string) => {
    setPendingChanges((prev) => ({ ...prev, [fieldName]: url }));
    setPreviewImages((prev) => ({ ...prev, [imageType]: url }));
    toast({ title: "✅ Vald!", description: "Klicka 'Spara ändringar' för att aktivera." });
  };

  const renderRecentUploads = (category: string, fieldName: string) => {
    const items = uploadHistory[category];
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-2 pt-3 border-t border-border/30">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <History className="w-3 h-3" />
          <span>Senaste uppladdningar</span>
        </div>
        <div className="flex gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => selectFromHistory(category, fieldName, item.image_url)}
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const logoPreview = getImagePreview("logo") || PLACEHOLDER_LOGO;
  const ogPreview = getImagePreview("og");

  return (
    <div className="w-full max-w-[600px] mx-auto flex flex-col gap-8">
        {/* Save Button - Sticky */}
        {hasPendingChanges && (
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-3 -mx-4 px-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                ⚠️ Du har osparade ändringar
              </p>
              <Button onClick={handleSave} disabled={saving} size="lg" className="text-base px-8">
                {saving ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : saved ? (
                  <CheckCircle2 className="w-5 h-5 mr-2 text-green-400" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                {saved ? "Sparat! ✅" : "Spara ändringar"}
              </Button>
            </div>
          </div>
        )}

        {/* ===== LOGOTYP ===== */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-neon-purple" />
              Logotyp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Logotypen visas i navigeringen (menyn) och i sidfoten. Den bör ha <strong>genomskinlig bakgrund</strong> (PNG) så att den smälter in i designen.
            </p>

            <div className="flex flex-col gap-4">
              <div className="relative w-full h-24 rounded-lg overflow-hidden border border-border/50"
                style={{ background: "repeating-conic-gradient(hsl(var(--muted)) 0% 25%, hsl(var(--background)) 0% 50%) 50% / 16px 16px" }}
              >
                <img 
                  src={logoPreview} 
                  alt="Förhandsgranskning av logotyp" 
                  className="w-full h-full object-contain p-2"
                />
                {uploading === "logo" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => handleFileSelect(e, "logo", "logo_url", 300)}
              />
              <div className="flex gap-2">
                <Button 
                  size="lg"
                  variant="outline" 
                  className="text-base py-6 flex-1"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploading === "logo"}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {uploading === "logo" ? "Laddar upp..." : "Ladda upp logotyp"}
                </Button>
                {(getImagePreview("logo") || branding?.logo_url) && (
                  <Button 
                    variant="destructive" 
                    size="icon"
                    className="h-14 w-14"
                    onClick={() => setPendingChanges((prev) => ({ ...prev, logo_url: null }))}
                    title="Ta bort logotyp"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm font-medium mb-1">📐 Rekommenderad storlek</p>
                <p className="text-xs text-muted-foreground">
                  400×100 pixlar, PNG med genomskinlig bakgrund, max 300 KB
                </p>
              </div>
            </div>
            {renderRecentUploads("logo", "logo_url")}
          </CardContent>
        </Card>

        {/* ===== OG / DELA-BILD ===== */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-lg">
              <Share2 className="w-5 h-5 text-neon-cyan" />
              Dela-bild (sociala medier)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Den här bilden visas när någon delar din sida på Facebook, Twitter eller andra sociala medier. Den kallas "Open Graph"-bild.
            </p>

            <div className="space-y-4">
              <div className="relative w-full max-w-md rounded-lg overflow-hidden border border-border/50 bg-muted/30"
                style={{ aspectRatio: "1200/630" }}
              >
                {ogPreview ? (
                  <img src={ogPreview} alt="Dela-bild förhandsgranskning" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
                    <Share2 className="w-10 h-10 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground text-center">Ingen dela-bild uppladdad ännu</p>
                  </div>
                )}
                {uploading === "hero" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>

              <input
                ref={ogInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, "hero", "og_image_url")}
              />
              <Button
                size="lg"
                variant="outline"
                className="w-full max-w-md text-base py-6"
                onClick={() => ogInputRef.current?.click()}
              >
                <Upload className="w-5 h-5 mr-2" />
                Ladda upp dela-bild
              </Button>

              <div className="bg-muted/30 rounded-lg p-3 max-w-md">
                <p className="text-sm font-medium mb-1">📐 Rekommenderad storlek</p>
                <p className="text-xs text-muted-foreground">
                  1200×630 pixlar, JPG eller PNG, max 2 MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== FÄRGTEMA ===== */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-lg">
              <Palette className="w-5 h-5 text-primary" />
              Färgtema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Välj ett färgtema eller skapa ett eget. Färgerna syns som neon-glöd på hela sidan.
            </p>
            {/* Presets */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Snabbval</Label>
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
                        isSelected ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/50 bg-muted/20"
                      }`}
                    >
                      <div className="flex gap-1 mb-2">
                        <span className="w-6 h-6 rounded-full" style={{ backgroundColor: `hsl(${preset.primary})` }} />
                        <span className="w-6 h-6 rounded-full" style={{ backgroundColor: `hsl(${preset.secondary})` }} />
                        <span className="w-6 h-6 rounded-full" style={{ backgroundColor: `hsl(${preset.accent})` }} />
                      </div>
                      <span className="text-xs font-medium">{preset.name}</span>
                      {isSelected && <Check className="absolute top-2 right-2 w-4 h-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Colors */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Egna färger</Label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Primär glöd", key: "primary_glow_color", def: "300 100% 50%" },
                  { label: "Sekundär glöd", key: "secondary_glow_color", def: "180 100% 50%" },
                  { label: "Accent", key: "accent_color", def: "270 100% 60%" },
                ].map((c) => (
                  <div key={c.key}>
                    <Label className="text-xs text-muted-foreground mb-1 block">{c.label}</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={hslToHex((pendingChanges as any)[c.key] || (branding as any)?.[c.key] || c.def)}
                        onChange={(e) => handleCustomColor(c.key, e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-0"
                      />
                      <div 
                        className="w-10 h-10 rounded"
                        style={{ 
                          backgroundColor: `hsl(${(pendingChanges as any)[c.key] || (branding as any)?.[c.key] || c.def})`,
                          boxShadow: `0 0 20px hsla(${(pendingChanges as any)[c.key] || (branding as any)?.[c.key] || c.def}, 0.5)`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom save */}
        {hasPendingChanges && (
          <Button onClick={handleSave} disabled={saving} size="lg" className="w-full text-base py-6">
            {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            {saved ? "Sparat! ✅" : "Spara ändringar"}
          </Button>
        )}
    </div>
  );
};

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
  } catch { return "#ff00ff"; }
}

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
  } catch { return null; }
}

export default BrandingTab;
