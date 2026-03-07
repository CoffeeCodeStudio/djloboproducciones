import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Save, Loader2, AlertTriangle, ImageIcon, CheckCircle2, Trash2 } from "lucide-react";
import { useBranding, SiteBranding } from "@/hooks/useBranding";
import { toast } from "sonner";

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

const FramsidaTab = () => {
  const { branding, loading, updateBranding, uploadImage, refetch } = useBranding();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Partial<SiteBranding>>({});
  const [previewHero, setPreviewHero] = useState<string | null>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const currentBio = pendingChanges.bio_text ?? branding?.bio_text ?? "";
  const currentProfileUrl = previewProfile || branding?.profile_image_url || null;
  const currentHeroUrl = previewHero || branding?.hero_image_url || null;
  const hasPending = Object.keys(pendingChanges).length > 0;

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    imageType: "profile" | "hero",
    fieldName: keyof SiteBranding,
    setPreview: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Fel filtyp – välj en bild (JPG, PNG eller WebP).");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Bilden är för stor (${(file.size / 1024 / 1024).toFixed(1)} MB). Välj en bild under ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setUploadingType(imageType);
    const { url, error } = await uploadImage(file, imageType);
    setUploadingType(null);
    if (error) { toast.error(error); setPreview(null); return; }
    setPendingChanges((prev) => ({ ...prev, [fieldName]: url }));
    toast.success("Bilden laddades upp! Tryck 'Spara ändringar'.");
  };

  const handleSave = async () => {
    if (!hasPending) return;
    setSaving(true);
    const { error } = await updateBranding(pendingChanges);
    setSaving(false);
    if (error) { toast.error("Kunde inte spara: " + error); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    toast.success("✅ Ändringarna har sparats!");
    setPendingChanges({});
    setPreviewProfile(null);
    setPreviewHero(null);
    refetch();
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {hasPending && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-3 border-b border-border/50 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">⚠️ Du har osparade ändringar</p>
          <Button onClick={handleSave} disabled={saving} size="lg" className="text-base px-8">
            {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : saved ? <CheckCircle2 className="w-5 h-5 mr-2 text-green-400" /> : <Save className="w-5 h-5 mr-2" />}
            {saved ? "Sparat! ✅" : "Spara ändringar"}
          </Button>
        </div>
      )}

      {/* Sajtnamn & Slogan */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">✏️ Välkomsttext</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Sajtens namn och slogan som visas på startsidan.</p>
          <div>
            <Label htmlFor="siteName">Sajtnamn</Label>
            <Input id="siteName" value={pendingChanges.site_name ?? branding?.site_name ?? ""} onChange={(e) => setPendingChanges((prev) => ({ ...prev, site_name: e.target.value }))} placeholder="DJ Lobo Radio" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="tagline">Slogan</Label>
            <Input id="tagline" value={pendingChanges.tagline ?? branding?.tagline ?? ""} onChange={(e) => setPendingChanges((prev) => ({ ...prev, tagline: e.target.value }))} placeholder="Bringing the best of 80s and 90s music" className="mt-1.5" />
          </div>
        </CardContent>
      </Card>

      {/* Profilbild */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><User className="w-5 h-5 text-primary" />Profilbild</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Visas som din profilbild på startsidan i en <strong>rund</strong> ram.</p>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary/50 bg-muted/30 flex-shrink-0" style={{ background: !currentProfileUrl ? "repeating-conic-gradient(hsl(var(--muted)) 0% 25%, hsl(var(--background)) 0% 50%) 50% / 16px 16px" : undefined }}>
              {currentProfileUrl ? <img src={currentProfileUrl} alt="Profilbild" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User className="w-10 h-10 text-muted-foreground" /></div>}
              {uploadingType === "profile" && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>}
            </div>
            <div className="flex-1 space-y-3">
              <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, "profile", "profile_image_url", setPreviewProfile)} />
              <div className="flex gap-2">
                <Button size="lg" variant="outline" className="flex-1 text-base py-6" onClick={() => profileInputRef.current?.click()} disabled={uploadingType === "profile"}>
                  <Upload className="w-5 h-5 mr-2" />{uploadingType === "profile" ? "Laddar upp..." : "Ladda upp profilbild"}
                </Button>
                {currentProfileUrl && (
                  <Button variant="destructive" size="icon" className="h-14 w-14" onClick={() => { setPendingChanges((prev) => ({ ...prev, profile_image_url: null })); setPreviewProfile(null); }} title="Ta bort">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
              </div>
              <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-amber-400" />Fyrkantig bild (400×400 px), max {MAX_FILE_SIZE_MB} MB</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Huvudbild (Om mig) */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><ImageIcon className="w-5 h-5 text-primary" />Huvudbild – "Om mig"</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Huvudbilden i "Om DJ Lobo"-sektionen. Visas i <strong>liggande rektangel</strong>.</p>
          <div className="relative w-full aspect-video max-w-md rounded-lg overflow-hidden border-2 border-primary/50 bg-muted/30" style={{ background: !currentHeroUrl ? "repeating-conic-gradient(hsl(var(--muted)) 0% 25%, hsl(var(--background)) 0% 50%) 50% / 16px 16px" : undefined }}>
            {currentHeroUrl ? <img src={currentHeroUrl} alt="Om mig-bild" className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center gap-2"><ImageIcon className="w-10 h-10 text-muted-foreground" /><p className="text-xs text-muted-foreground">Ingen bild uppladdad</p></div>}
            {uploadingType === "hero" && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>}
          </div>
          <input ref={heroInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, "hero", "hero_image_url", setPreviewHero)} />
          <div className="flex gap-2 max-w-md">
            <Button size="lg" variant="outline" className="flex-1 text-base py-6" onClick={() => heroInputRef.current?.click()} disabled={uploadingType === "hero"}>
              <Upload className="w-5 h-5 mr-2" />{uploadingType === "hero" ? "Laddar upp..." : "Ladda upp ny bild"}
            </Button>
            {currentHeroUrl && (
              <Button variant="destructive" size="icon" className="h-14 w-14" onClick={() => { setPendingChanges((prev) => ({ ...prev, hero_image_url: null })); setPreviewHero(null); }} title="Ta bort">
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
          </div>
          <div className="bg-muted/30 rounded-lg p-3 max-w-md">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-amber-400" />Liggande bild (1200×800 px), max {MAX_FILE_SIZE_MB} MB</p>
          </div>
        </CardContent>
      </Card>

      {/* Bio text */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">✍️ Om mig – Text</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Skriv en kort presentation. Visas i "Om DJ Lobo"-sektionen på startsidan.</p>
          <div>
            <Label htmlFor="bio-text">Din presentation</Label>
            <Textarea id="bio-text" value={currentBio} onChange={(e) => setPendingChanges((prev) => ({ ...prev, bio_text: e.target.value }))} placeholder="Skriv om dig själv, din musik och din erfarenhet..." className="mt-1.5 min-h-[160px] text-base" maxLength={2000} />
            <p className="text-xs text-muted-foreground mt-1 text-right">{currentBio.length} / 2 000 tecken</p>
          </div>
          {hasPending && (
            <Button onClick={handleSave} disabled={saving} size="lg" className="w-full text-base py-6">
              {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : saved ? <CheckCircle2 className="w-5 h-5 mr-2 text-green-400" /> : <Save className="w-5 h-5 mr-2" />}
              {saved ? "Sparat! ✅" : "Spara ändringar"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FramsidaTab;
