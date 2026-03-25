import { useState, useRef } from "react";
import { useGallery, GalleryImage, extractYouTubeId } from "@/hooks/useGallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Trash2, ImageIcon, Loader2, X, Play, Video } from "lucide-react";

const GalleryTab = () => {
  const { images, isLoading, addImage, updateImage, deleteImage } = useGallery();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAltText, setNewAltText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New item form state
  const [newMediaType, setNewMediaType] = useState<"photo" | "video">("photo");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [addingVideo, setAddingVideo] = useState(false);

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      const { toast } = await import("sonner");
      toast.error(`Bilden är för stor (${(file.size / 1024 / 1024).toFixed(1)} MB). Välj en bild under 2 MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    await addImage.mutateAsync({ file, mediaType: "photo" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddVideo = async () => {
    if (!newVideoUrl.trim()) return;
    setAddingVideo(true);
    try {
      await addImage.mutateAsync({ mediaType: "video", videoUrl: newVideoUrl.trim() });
      setNewVideoUrl("");
      setNewMediaType("photo");
    } finally {
      setAddingVideo(false);
    }
  };

  const handleAddVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      const { toast } = await import("sonner");
      toast.error("Ogiltigt filformat. Välj en videofil (t.ex. MP4).");
      e.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      const { toast } = await import("sonner");
      toast.error(`Videon är för stor (${(file.size / 1024 / 1024).toFixed(1)} MB). Välj en fil under 2 MB.`);
      e.target.value = "";
      return;
    }
    await addImage.mutateAsync({ file, mediaType: "video" });
  };

  const handleDeleteImage = async (id: string) => {
    if (confirm("Är du säker på att du vill ta bort denna media?")) {
      await deleteImage.mutateAsync(id);
    }
  };

  const startEditing = (image: GalleryImage) => {
    setEditingId(image.id);
    setNewAltText(image.alt_text || "");
  };

  const handleUpdateAltText = async (id: string) => {
    await updateImage.mutateAsync({ id, altText: newAltText });
    setEditingId(null);
    setNewAltText("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-neon-cyan flex items-center gap-2 text-base sm:text-lg">
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            Bildgalleri & Video
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Type selector */}
          <div className="flex gap-2 mb-2">
            <Button
              variant={newMediaType === "photo" ? "default" : "outline"}
              size="sm"
              onClick={() => setNewMediaType("photo")}
              className="flex-1 h-10 sm:h-9 sm:flex-none"
            >
              <ImageIcon className="w-4 h-4 mr-1" /> Foto
            </Button>
            <Button
              variant={newMediaType === "video" ? "default" : "outline"}
              size="sm"
              onClick={() => setNewMediaType("video")}
              className="flex-1 h-10 sm:h-9 sm:flex-none"
            >
              <Video className="w-4 h-4 mr-1" /> Video
            </Button>
          </div>

          {newMediaType === "photo" ? (
            <div className="border-2 border-dashed border-white/20 rounded-lg p-4 sm:p-6 text-center hover:border-neon-cyan/50 transition-colors">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAddPhoto}
                accept="image/*"
                className="hidden"
                id="add-gallery-image"
              />
              <label htmlFor="add-gallery-image" className="cursor-pointer flex flex-col items-center gap-2 sm:gap-3">
                {addImage.isPending ? (
                  <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-neon-cyan animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                )}
                <span className="text-sm sm:text-base text-muted-foreground">
                  {addImage.isPending ? "Laddar upp..." : "Klicka för att lägga till en ny bild"}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  💡 Liggande bild (1200×800 px) ger bäst resultat. Max 2 MB.
                </span>
              </label>
            </div>
          ) : (
            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-1 block">YouTube URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <Button onClick={handleAddVideo} disabled={addingVideo || !newVideoUrl.trim()}>
                    {addingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lägg till"}
                  </Button>
                </div>
              </div>
              <div className="text-center text-xs text-muted-foreground">— ELLER —</div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1 block">Ladda upp videofil (MP4)</Label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleAddVideoFile}
                  className="text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>
            </div>
          )}

          {/* Gallery grid - Mobile optimized */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {images.map((image) => {
              const isVideo = image.media_type === "video";
              const ytId = isVideo && image.video_url ? extractYouTubeId(image.video_url) : null;

              return (
                <div
                  key={image.id}
                  className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-neon-pink/50 transition-all"
                >
                  <img
                    src={image.image_url}
                    alt={image.alt_text || "Galleribild"}
                    className="w-full h-full object-cover"
                  />

                  {/* Video play icon */}
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Type badge */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isVideo ? "bg-primary/80 text-primary-foreground" : "bg-black/60 text-white"}`}>
                      {isVideo ? "Video" : "Foto"}
                    </span>
                    <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                      #{image.sort_order}
                    </span>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                    {editingId === image.id ? (
                      <div className="w-full space-y-2">
                        <Input
                          value={newAltText}
                          onChange={(e) => setNewAltText(e.target.value)}
                          placeholder="Alt-text"
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateAltText(image.id)} disabled={updateImage.isPending} className="flex-1">
                            Spara
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => startEditing(image)}>
                          Redigera
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteImage(image.id)} disabled={deleteImage.isPending}>
                          <Trash2 className="w-4 h-4 mr-1" /> Ta bort
                        </Button>
                        {isVideo && ytId && (
                          <p className="text-xs text-muted-foreground truncate w-full text-center mt-1">
                            YT: {ytId}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {images.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Inga bilder eller videor i galleriet. Lägg till ovan.
            </p>
          )}

          <p className="text-sm text-muted-foreground">
            Tips: Dessa bilder och videor visas i "Event Highlights"-sektionen på Media-sidan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GalleryTab;
