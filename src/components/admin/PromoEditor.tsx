import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Upload, X, ImageIcon, Youtube, Video, FileVideo } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ImageCropper from "./ImageCropper";
import { usePromosAdmin } from "@/hooks/usePromosAdmin";
import { useUpcomingEvents } from "@/hooks/useUpcomingEvents";
import type { Promo } from "@/hooks/useActivePromo";
import PromoPopup from "@/components/PromoPopup";

interface PromoEditorProps {
  open: boolean;
  onClose: () => void;
  promo?: Promo;
}

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

async function uploadPromoFlyer(blob: Blob): Promise<string> {
  const fileName = `promos/${crypto.randomUUID()}.jpg`;
  const { error: upErr } = await supabase.storage
    .from("branding")
    .upload(fileName, blob, { upsert: true, contentType: "image/jpeg" });
  if (upErr) throw upErr;
  const { data } = supabase.storage.from("branding").getPublicUrl(fileName);
  return data.publicUrl;
}

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

async function uploadPromoVideo(file: File): Promise<string> {
  const fileName = `promos/videos/${crypto.randomUUID()}.mp4`;
  const { error: upErr } = await supabase.storage
    .from("branding")
    .upload(fileName, file, { upsert: true, contentType: file.type || "video/mp4" });
  if (upErr) {
    const msg = upErr.message?.toLowerCase() ?? "";
    if (msg.includes("payload") || msg.includes("too large") || msg.includes("size")) {
      throw new Error("Videon är för stor. Max 50 MB. Använd YouTube-länk istället.");
    }
    throw upErr;
  }
  const { data } = supabase.storage.from("branding").getPublicUrl(fileName);
  return data.publicUrl;
}

function isYouTubeUrl(url: string): boolean {
  if (!url.trim()) return false;
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url.trim());
}

type MediaType = "none" | "video" | "youtube";

const PromoEditor = ({ open, onClose, promo }: PromoEditorProps) => {
  const isEdit = !!promo;
  const { createPromo, updatePromo } = usePromosAdmin();
  const { events, isLoading: eventsLoading } = useUpcomingEvents();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [flyerUrl, setFlyerUrl] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [source, setSource] = useState<"calendar" | "manual">("manual");
  const [googleEventId, setGoogleEventId] = useState<string | null>(null);
  const [activeFrom, setActiveFrom] = useState<Date | undefined>();
  const [activeTo, setActiveTo] = useState<Date | undefined>();
  const [priority, setPriority] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Cropper state
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [uploadingFlyer, setUploadingFlyer] = useState(false);

  // Video state
  const [mediaType, setMediaType] = useState<MediaType>("none");
  const [videoFileUrl, setVideoFileUrl] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [videoFileSize, setVideoFileSize] = useState<number | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Preview state
  const [previewOpen, setPreviewOpen] = useState(false);

  // Reset form when opening
  useEffect(() => {
    if (!open) return;
    if (promo) {
      setTitle(promo.title);
      setSubtitle(promo.subtitle ?? "");
      setFlyerUrl(promo.flyer_image_url);
      setYoutubeUrl(promo.youtube_url ?? "");
      setVideoFileUrl(promo.video_file_url ?? null);
      setVideoFileName(null);
      setVideoFileSize(null);
      if (promo.video_file_url) setMediaType("video");
      else if (promo.youtube_url) setMediaType("youtube");
      else setMediaType("none");
      setCtaText(promo.cta_text ?? "");
      setCtaUrl(promo.cta_url ?? "");
      setSource(promo.source);
      setGoogleEventId(promo.google_event_id);
      setActiveFrom(new Date(promo.active_from));
      setActiveTo(new Date(promo.active_to));
      setPriority(promo.priority);
      setIsActive(promo.is_active);
    } else {
      setTitle("");
      setSubtitle("");
      setFlyerUrl(null);
      setYoutubeUrl("");
      setVideoFileUrl(null);
      setVideoFileName(null);
      setVideoFileSize(null);
      setMediaType("none");
      setCtaText("");
      setCtaUrl("");
      setSource("manual");
      setGoogleEventId(null);
      setActiveFrom(undefined);
      setActiveTo(undefined);
      setPriority(0);
      setIsActive(true);
    }
  }, [open, promo]);

  const ytId = useMemo(() => getYouTubeId(youtubeUrl), [youtubeUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Bilden är för stor (max 2 MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result as string);
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropComplete = async (blob: Blob) => {
    setCropOpen(false);
    setUploadingFlyer(true);
    try {
      const url = await uploadPromoFlyer(blob);
      setFlyerUrl(url);
      toast.success("Flyer uppladdad!");
    } catch (err: any) {
      toast.error("Uppladdning misslyckades", { description: err.message });
    } finally {
      setUploadingFlyer(false);
      setRawImage(null);
    }
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/") && !file.name.toLowerCase().endsWith(".mp4")) {
      toast.error("Endast MP4-videofiler tillåtna");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      toast.error("Videon är för stor. Max 50 MB. Använd YouTube-länk istället.");
      return;
    }
    setUploadingVideo(true);
    try {
      const url = await uploadPromoVideo(file);
      setVideoFileUrl(url);
      setVideoFileName(file.name);
      setVideoFileSize(file.size);
      toast.success("Video uppladdad!");
    } catch (err: any) {
      toast.error(err.message || "Uppladdning misslyckades");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleMediaTypeChange = (next: MediaType) => {
    setMediaType(next);
    if (next !== "video") {
      setVideoFileUrl(null);
      setVideoFileName(null);
      setVideoFileSize(null);
    }
    if (next !== "youtube") {
      setYoutubeUrl("");
    }
  };

  const handleEventSelect = (eventId: string) => {
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return;
    setGoogleEventId(eventId);
    const startDate = new Date(ev.start);
    const from = new Date(startDate);
    from.setDate(from.getDate() - 14);
    const to = new Date(startDate);
    to.setDate(to.getDate() + 1);
    setActiveFrom(from);
    setActiveTo(to);
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      toast.error("Titel krävs");
      return;
    }
    if (title.length > 80) {
      toast.error("Titel max 80 tecken");
      return;
    }
    if (source === "calendar" && !googleEventId) {
      toast.error("Välj ett kalender-event");
      return;
    }
    if (!activeFrom || !activeTo) {
      toast.error("Datum krävs");
      return;
    }
    if (activeTo <= activeFrom) {
      toast.error("Slutdatum måste vara efter startdatum");
      return;
    }
    if (mediaType === "youtube" && youtubeUrl.trim() && !isYouTubeUrl(youtubeUrl)) {
      toast.error("Ogiltig YouTube-länk");
      return;
    }

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      flyer_image_url: flyerUrl,
      youtube_url: mediaType === "youtube" ? (youtubeUrl.trim() || null) : null,
      video_file_url: mediaType === "video" ? videoFileUrl : null,
      cta_text: ctaText.trim() || null,
      cta_url: ctaUrl.trim() || null,
      source,
      google_event_id: source === "calendar" ? googleEventId : null,
      active_from: activeFrom.toISOString(),
      active_to: activeTo.toISOString(),
      priority,
      is_active: isActive,
    };

    setSubmitting(true);
    try {
      if (isEdit && promo) {
        await updatePromo.mutateAsync({ id: promo.id, updates: payload as any });
      } else {
        await createPromo.mutateAsync(payload as any);
      }
      onClose();
    } catch {
      // toast handled by hook
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Redigera kampanj" : "Skapa ny kampanj"}</DialogTitle>
            <DialogDescription>
              Fyll i informationen för din reklamkampanj nedan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* SECTION 1: Innehåll */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">Innehåll</h3>

              <div className="space-y-2">
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={80}
                  placeholder="t.ex. Sommarfest på Stranden"
                />
                <p className="text-xs text-muted-foreground">{title.length}/80</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Undertitel</Label>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  maxLength={120}
                  placeholder="t.ex. Lördag 15 juni - Köp biljett nu!"
                />
                <p className="text-xs text-muted-foreground">{subtitle.length}/120</p>
              </div>

              <div className="space-y-2">
                <Label>Flyer-bild (1:1)</Label>
                <div className="flex items-center gap-3">
                  {flyerUrl ? (
                    <div className="relative w-24 h-24 rounded-md overflow-hidden border border-border">
                      <img src={flyerUrl} alt="Flyer" className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => setFlyerUrl(null)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-md border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
                      <Upload className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <input
                      id="flyer-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("flyer-upload")?.click()}
                      disabled={uploadingFlyer}
                    >
                      {uploadingFlyer ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-1" />
                      )}
                      {flyerUrl ? "Byt bild" : "Ladda upp"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Media-typ</Label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { key: "none", label: "Ingen video", Icon: ImageIcon },
                    { key: "video", label: "Ladda upp video", Icon: Upload },
                    { key: "youtube", label: "YouTube-länk", Icon: Youtube },
                  ] as const).map(({ key, label, Icon }) => {
                    const active = mediaType === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleMediaTypeChange(key)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-1.5 p-3 rounded-md border text-xs font-medium transition-colors",
                          active
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-card/40 text-muted-foreground hover:bg-card/60"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {label}
                      </button>
                    );
                  })}
                </div>

                {mediaType === "video" && (
                  <div className="space-y-2 rounded-md border border-border p-3 bg-card/30">
                    {videoFileUrl ? (
                      <div className="flex items-center gap-3">
                        <FileVideo className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{videoFileName ?? "Uppladdad video"}</div>
                          {videoFileSize !== null && (
                            <div className="text-xs text-muted-foreground">
                              {(videoFileSize / 1024 / 1024).toFixed(1)} MB
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                          onClick={() => {
                            setVideoFileUrl(null);
                            setVideoFileName(null);
                            setVideoFileSize(null);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <input
                          id="video-upload"
                          type="file"
                          accept="video/mp4,video/*"
                          className="hidden"
                          onChange={handleVideoSelect}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("video-upload")?.click()}
                          disabled={uploadingVideo}
                          className="w-full"
                        >
                          {uploadingVideo ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Video className="w-4 h-4 mr-1" />
                          )}
                          {uploadingVideo ? "Laddar upp..." : "Välj MP4-fil (max 50 MB)"}
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {mediaType === "youtube" && (
                  <div className="space-y-2 rounded-md border border-border p-3 bg-card/30">
                    <Input
                      id="youtube"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    {ytId && (
                      <img
                        src={`https://i.ytimg.com/vi/${ytId}/mqdefault.jpg`}
                        alt="YouTube-förhandsvisning"
                        className="mt-2 rounded-md w-40 border border-border"
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="cta-text">CTA-knapp text</Label>
                  <Input
                    id="cta-text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    maxLength={30}
                    placeholder="Köp biljett"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta-url">CTA-knapp URL</Label>
                  <Input
                    id="cta-url"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </section>

            {/* SECTION 2: Tids-styrning */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">Tids-styrning</h3>

              <RadioGroup value={source} onValueChange={(v) => setSource(v as any)}>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="calendar" id="src-cal" className="mt-1" />
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="src-cal" className="font-medium cursor-pointer">
                      Koppla till Google Calendar-event
                    </Label>
                    {source === "calendar" && (
                      <>
                        <Select
                          value={googleEventId ?? undefined}
                          onValueChange={handleEventSelect}
                          disabled={eventsLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={eventsLoading ? "Laddar..." : "Välj event"} />
                          </SelectTrigger>
                          <SelectContent>
                            {events.length === 0 ? (
                              <div className="p-2 text-sm text-muted-foreground">Inga kommande event</div>
                            ) : (
                              events.map((ev) => (
                                <SelectItem key={ev.id} value={ev.id}>
                                  {ev.summary} — {format(new Date(ev.start), "d MMM yyyy")}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Datum synkas automatiskt med kalendern
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-2 mt-3">
                  <RadioGroupItem value="manual" id="src-man" className="mt-1" />
                  <Label htmlFor="src-man" className="font-medium cursor-pointer">
                    Ange datum manuellt
                  </Label>
                </div>
              </RadioGroup>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Aktiv från</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !activeFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {activeFrom ? format(activeFrom, "PPP") : "Välj datum"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={activeFrom}
                        onSelect={setActiveFrom}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Aktiv till</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !activeTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {activeTo ? format(activeTo, "PPP") : "Välj datum"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={activeTo}
                        onSelect={setActiveTo}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </section>

            {/* SECTION 3: Inställningar */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">Inställningar</h3>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioritet</Label>
                <Input
                  id="priority"
                  type="number"
                  min={0}
                  max={100}
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Högre prioritet visas först om flera kampanjer är aktiva samtidigt
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <Label htmlFor="active-toggle" className="font-medium">
                    {isActive ? "Aktiv" : "Pausad"}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {isActive ? "Kampanjen visas för besökare under aktiv period" : "Kampanjen visas inte"}
                  </p>
                </div>
                <Switch id="active-toggle" checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </section>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Avbryt
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (!title.trim()) {
                  toast.error("Lägg till en titel för att förhandsgranska");
                  return;
                }
                setPreviewOpen(true);
              }}
              disabled={submitting}
            >
              Förhandsgranska
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Spara
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {rawImage && (
        <ImageCropper
          open={cropOpen}
          imageSrc={rawImage}
          aspect={1}
          cropShape="rect"
          title="Beskär flyer (1:1)"
          onComplete={handleCropComplete}
          onCancel={() => {
            setCropOpen(false);
            setRawImage(null);
          }}
        />
      )}

      {previewOpen && (
        <PromoPopup
          promo={{
            id: "preview",
            title: title || "Förhandsvisning",
            subtitle: subtitle || null,
            flyer_image_url: flyerUrl,
            youtube_url: mediaType === "youtube" ? (youtubeUrl.trim() || null) : null,
            video_file_url: mediaType === "video" ? videoFileUrl : null,
            cta_text: ctaText.trim() || null,
            cta_url: ctaUrl.trim() || null,
            source,
            google_event_id: googleEventId,
            active_from: (activeFrom ?? new Date()).toISOString(),
            active_to: (activeTo ?? new Date()).toISOString(),
            priority,
            is_active: isActive,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }}
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          onPermanentDismiss={() => setPreviewOpen(false)}
        />
      )}
    </>
  );
};

export default PromoEditor;
