import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Save, Loader2, ImageIcon, CheckCircle2, Trash2 } from "lucide-react";
import { useBranding, SiteBranding } from "@/hooks/useBranding";
import { toast } from "sonner";
import ImageCropper from "./ImageCropper";

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

const FramsidaTab = () => {
  const { branding, loading, updateBranding, uploadImage, refetch } = useBranding();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Partial<SiteBranding>>({});
  const [previewProfile, setPreviewProfile] = useState<string | null>(null);
  const [previewHero, setPreviewHero] = useState<string | null>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  // Cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSrc, setCropperSrc] = useState<string>("");
  const [cropperTarget, setCropperTarget] = useState<"profile" | "hero">("profile");

  const currentBio = pendingChanges.bio_text ?? branding?.bio_text ?? "";
  const currentProfileUrl = previewProfile || branding?.profile_image_url || null;
  const currentHeroUrl = previewHero || branding?.hero_image_url || null;
  const hasPending = Object.keys(pendingChanges).length > 0;

  const handleFileSelect = (type: "profile" | "hero") => (e: React.ChangeEvent<HTMLInputElement>) => {
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
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setCropperSrc(src);
      setCropperTarget(type);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropperOpen(false);
    const previewUrl = URL.createObjectURL(croppedBlob);
    
    if (cropperTarget === "profile") {
      setPreviewProfile(previewUrl);
      const file = new File([croppedBlob], "profile-cropped.jpg", { type: "image/jpeg" });
      setUploadingType("profile");
      const { url, error } = await uploadImage(file, "profile");
      setUploadingType(null);

      if (error) {
        toast.error(error);
        setPreviewProfile(null);
        return;
      }
      setPendingChanges((prev) => ({ ...prev, profile_image_url: url }));
      toast.success("Profilbilden beskars och laddades upp! Tryck 'Spara ändringar'.");
    } else {
      setPreviewHero(previewUrl);
      const file = new File([croppedBlob], "hero-cropped.jpg", { type: "image/jpeg" });
      setUploadingType("hero");
      const { url, error } = await uploadImage(file, "hero");
      setUploadingType(null);

      if (error) {
        toast.error(error);
        setPreviewHero(null);
        return;
      }
      setPendingChanges((prev) => ({ ...prev, hero_image_url: url }));
      toast.success("Hero-bakgrundsbilden beskars och laddades upp! Tryck 'Spara ändringar'.");
    }
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
    <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
      {hasPending && (
        <div className="sticky top-[60px] sm:top-[72px] z-10 bg-background/95 backdrop-blur py-3 -mx-3 sm:-mx-4 px-3 sm:px-4 border-b border-border/50 flex items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-muted-foreground">⚠️ Osparade ändringar</p>
          <Button onClick={handleSave} disabled={saving} size="lg" className="text-sm sm:text-base px-4 sm:px-8 h-10 sm:h-11">
            {saving ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-400" /> : <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />}
            {saved ? "Sparat! ✅" : "Spara"}
          </Button>
        </div>
      )}

      {/* Sajtnamn & Slogan */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">✏️ Välkomsttext</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <p className="text-xs sm:text-sm text-muted-foreground">Sajtens namn och slogan som visas på startsidan.</p>
          <div>
            <Label htmlFor="siteName" className="text-sm">Sajtnamn</Label>
            <Input id="siteName" value={pendingChanges.site_name ?? branding?.site_name ?? ""} onChange={(e) => setPendingChanges((prev) => ({ ...prev, site_name: e.target.value }))} <Input id="siteName" value={pendingChanges.site_name ?? branding?.site_name ?? ""} onChange={(e) => setPendingChanges((prev) => ({ ...prev, site_name: e.target.value }))} placeholder="DJ Lobo Producciones" className="mt-1.5 h-11 sm:h-10 text-base" /> className="mt-1.5 h-11 sm:h-10 text-base" />
          </div>
          <div>
            <Label htmlFor="tagline" className="text-sm">Slogan</Label>
            <Input id="tagline" value={pendingChanges.tagline ?? branding?.tagline ?? ""} onChange={(e) => setPendingChanges((prev) => ({ ...prev, tagline: e.target.value }))} placeholder="Bringing the best of 80s and 90s music" className="mt-1.5 h-11 sm:h-10 text-base" />
          </div>
        </CardContent>
      </Card>


      {/* Huvudbild (Om mig) - 4:5 */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />Huvudbild – "Om mig" (4:5)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <p className="text-xs sm:text-sm text-muted-foreground">Visas i "Om DJ Lobo"-sektionen. <strong>4:5 stående format</strong> för professionellt utseende.</p>
          {currentProfileUrl ? (
            <div className="space-y-2 sm:space-y-3 max-w-[280px]">
              <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden border-2 border-primary/50">
                <img src={currentProfileUrl} alt="Nuvarande profilbild" className="w-full h-full object-cover object-center" />
                {uploadingType === "profile" && <div className="absolute inset-0 bg-background/50 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
              </div>
              <p className="text-xs text-muted-foreground">👆 Förhandsvisning i 4:5 – exakt som på sajten</p>
            </div>
          ) : (
            <div className="relative w-full aspect-[4/5] max-w-[280px] rounded-lg overflow-hidden border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-2">
              <ImageIcon className="w-10 h-10 text-muted-foreground" />
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">4:5 stående format</p>
              <p className="text-xs text-muted-foreground">Ladda upp profilbild här</p>
              {uploadingType === "profile" && <div className="absolute inset-0 bg-background/50 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
            </div>
          )}
          <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect("profile")} />
          <div className="flex gap-2 max-w-[280px]">
            <Button size="lg" variant="outline" className="flex-1 text-sm sm:text-base py-5 sm:py-6 h-auto" onClick={() => profileInputRef.current?.click()} disabled={uploadingType === "profile"}>
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />{uploadingType === "profile" ? "Laddar..." : "Ladda upp"}
            </Button>
            {currentProfileUrl && (
              <Button variant="destructive" size="icon" className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0" onClick={() => { setPendingChanges((prev) => ({ ...prev, profile_image_url: null })); setPreviewProfile(null); }} title="Ta bort">
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
          </div>
          <div className="bg-muted/30 rounded-lg p-3 max-w-[280px] space-y-1.5">
            <p className="text-xs sm:text-sm font-medium">✂️ Så funkar det</p>
            <p className="text-xs text-muted-foreground">1. Klicka "Ladda upp"</p>
            <p className="text-xs text-muted-foreground">2. Beskär motivet i 4:5 format</p>
            <p className="text-xs text-muted-foreground">3. Klicka "Använd" – bilden sparas</p>
            <p className="text-xs text-muted-foreground">• Max filstorlek: {MAX_FILE_SIZE_MB} MB</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">✍️ Om mig – Text</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <p className="text-xs sm:text-sm text-muted-foreground">Skriv en kort presentation. Visas i "Om DJ Lobo"-sektionen på startsidan.</p>
          <div>
            <Label htmlFor="bio-text" className="text-sm">Din presentation</Label>
            <Textarea id="bio-text" value={currentBio} onChange={(e) => setPendingChanges((prev) => ({ ...prev, bio_text: e.target.value }))} placeholder="Skriv om dig själv, din musik och din erfarenhet..." className="mt-1.5 min-h-[140px] sm:min-h-[160px] text-base" maxLength={2000} />
            <p className="text-xs text-muted-foreground mt-1 text-right">{currentBio.length} / 2 000 tecken</p>
          </div>
          {hasPending && (
            <Button onClick={handleSave} disabled={saving} size="lg" className="w-full text-sm sm:text-base py-5 sm:py-6 h-auto">
              {saving ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-400" /> : <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />}
              {saved ? "Sparat! ✅" : "Spara ändringar"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Image Cropper Dialog */}
      <ImageCropper
        open={cropperOpen}
        imageSrc={cropperSrc}
        aspect={cropperTarget === "hero" ? 16 / 9 : 4 / 5}
        cropShape="rect"
        title={cropperTarget === "hero" ? "Beskär hero-bakgrundsbild (16:9)" : "Beskär profilbild (4:5)"}
        onComplete={handleCropComplete}
        onCancel={() => setCropperOpen(false)}
      />
    </div>
  );
};

export default FramsidaTab;
