import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, User, Save, Loader2, AlertTriangle } from "lucide-react";
import { useBranding, SiteBranding } from "@/hooks/useBranding";
import { toast } from "sonner";

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

const BioTab = () => {
  const { branding, loading, updateBranding, uploadImage, refetch } = useBranding();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Partial<SiteBranding>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentBio = pendingChanges.bio_text ?? (branding as any)?.bio_text ?? "";
  const currentProfileUrl = previewUrl || branding?.profile_image_url || null;
  const hasPending = Object.keys(pendingChanges).length > 0;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Fel filtyp – välj en bild (JPG, PNG eller WebP).");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        `Bilden är för stor (${(file.size / 1024 / 1024).toFixed(1)} MB). Välj en bild under ${MAX_FILE_SIZE_MB} MB så att sidan laddar snabbt.`
      );
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    const { url, error } = await uploadImage(file, "profile");
    setUploading(false);

    if (error) {
      toast.error(error);
      setPreviewUrl(null);
      return;
    }

    setPendingChanges((prev) => ({ ...prev, profile_image_url: url }));
    toast.success("Bilden laddades upp! Tryck 'Spara' för att aktivera.");
  };

  const handleSave = async () => {
    if (!hasPending) return;
    setSaving(true);
    const { error } = await updateBranding(pendingChanges);
    setSaving(false);

    if (error) {
      toast.error("Kunde inte spara: " + error);
    } else {
      toast.success("Ändringarna har sparats!");
      setPendingChanges({});
      setPreviewUrl(null);
      refetch();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Save bar */}
      {hasPending && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-3 border-b border-border/50 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Du har osparade ändringar</p>
          <Button onClick={handleSave} disabled={saving} size="lg" className="text-base px-8">
            {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            Spara
          </Button>
        </div>
      )}

      {/* Profile image */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5 text-primary" />
            Profilbild
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Den här bilden visas som din profilbild på "Om mig"-sidan. Den visas i en <strong>rund</strong> ram.
          </p>

          <div className="flex items-center gap-6">
            {/* Round preview */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary/50 bg-muted/30 flex-shrink-0">
              {currentProfileUrl ? (
                <img src={currentProfileUrl} alt="Profilbild" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                size="lg"
                variant="outline"
                className="w-full text-base py-6"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="w-5 h-5 mr-2" />
                {uploading ? "Laddar upp..." : "Ladda upp ny bild"}
              </Button>

              <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Tips för bästa resultat
                </p>
                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                  <li>Fyrkantig bild (t.ex. 400×400 eller 800×800 pixlar)</li>
                  <li>Ansiktet centrerat i mitten</li>
                  <li>Max {MAX_FILE_SIZE_MB} MB filstorlek</li>
                  <li>JPG, PNG eller WebP</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio text */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            ✍️ Om mig – Text
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Skriv en kort presentation av dig själv. Denna text visas på "Om mig"-sidan.
          </p>
          <div>
            <Label htmlFor="bio-text" className="text-sm font-medium">
              Din presentation
            </Label>
            <Textarea
              id="bio-text"
              value={currentBio}
              onChange={(e) => setPendingChanges((prev) => ({ ...prev, bio_text: e.target.value }))}
              placeholder="Skriv om dig själv, din musik och din erfarenhet..."
              className="mt-1.5 min-h-[160px] text-base"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {currentBio.length} / 2 000 tecken
            </p>
          </div>

          {!hasPending ? null : (
            <Button onClick={handleSave} disabled={saving} size="lg" className="w-full text-base py-6">
              {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              Spara ändringar
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BioTab;
