import { useState, useCallback, useEffect, useRef } from "react";
import Cropper, { Area } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, Check, X, RotateCcw } from "lucide-react";

interface ImageCropperProps {
  open: boolean;
  imageSrc: string;
  aspect?: number;
  cropShape?: "rect" | "round";
  title?: string;
  /** Kept for backwards compatibility, but only "crop" is supported. */
  saveMode?: "crop";
  outputType?: "image/jpeg" | "image/png";
  onComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

async function loadImage(imageSrc: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = imageSrc;
  });

  return image;
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputType: "image/jpeg" | "image/png" = "image/jpeg"
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;

  const cropX = Math.max(0, Math.round(pixelCrop.x));
  const cropY = Math.max(0, Math.round(pixelCrop.y));
  const cropWidth = Math.round(pixelCrop.width);
  const cropHeight = Math.round(pixelCrop.height);
  const cropSize = Math.max(1, Math.min(cropWidth, cropHeight));

  const safeX = Math.min(cropX, Math.max(0, imageWidth - cropSize));
  const safeY = Math.min(cropY, Math.max(0, imageHeight - cropSize));

  // === [ImageCropper] DEBUG: input vs. normaliserad export ===
  const aspectRatio = cropHeight === 0 ? 0 : cropWidth / cropHeight;
  const aspectDeviation = Math.abs(aspectRatio - 1);
  const xClampDelta = cropX - safeX;
  const yClampDelta = cropY - safeY;
  const widthDelta = cropWidth - cropSize;
  const heightDelta = cropHeight - cropSize;
  const hasDeviation =
    aspectDeviation > 0.001 ||
    xClampDelta !== 0 ||
    yClampDelta !== 0 ||
    widthDelta !== 0 ||
    heightDelta !== 0;

  const debugPayload = {
    image: { naturalWidth: imageWidth, naturalHeight: imageHeight },
    rawCrop: {
      x: pixelCrop.x,
      y: pixelCrop.y,
      width: pixelCrop.width,
      height: pixelCrop.height,
      aspectRatio: Number(aspectRatio.toFixed(4)),
    },
    normalizedCrop: { x: safeX, y: safeY, size: cropSize },
    canvas: { width: cropSize, height: cropSize },
    deltas: {
      aspectDeviation: Number(aspectDeviation.toFixed(4)),
      xClampDelta,
      yClampDelta,
      widthDelta,
      heightDelta,
    },
    outputType,
  };

  if (hasDeviation) {
    console.warn(
      "[ImageCropper] ⚠️ Export avviker från förhandsvisningen – cropdata justerades innan canvas-render:",
      debugPayload
    );
  } else {
    console.log("[ImageCropper] ✅ Crop matchar förhandsvisning 1:1:", debugPayload);
  }

  const canvas = document.createElement("canvas");
  canvas.width = cropSize;
  canvas.height = cropSize;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    safeX,
    safeY,
    cropSize,
    cropSize,
    0,
    0,
    cropSize,
    cropSize
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error("[ImageCropper] ❌ canvas.toBlob() returnerade null", debugPayload);
          reject(new Error("Canvas toBlob failed"));
          return;
        }
        console.log("[ImageCropper] 💾 Exporterad fil:", {
          sizeKB: Number((blob.size / 1024).toFixed(1)),
          type: blob.type,
          canvas: { width: canvas.width, height: canvas.height },
        });
        resolve(blob);
      },
      outputType,
      outputType === "image/jpeg" ? 0.92 : undefined
    );
  });
}

const ImageCropper = ({
  open,
  imageSrc,
  aspect = 4 / 5,
  cropShape = "rect",
  title = "Beskär bild",
  outputType = "image/jpeg",
  onComplete,
  onCancel,
}: ImageCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const croppedAreaPixelsRef = useRef<Area | null>(null);
  const [saving, setSaving] = useState(false);

  // === Visuell export-verifiering ===
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [pendingMeta, setPendingMeta] = useState<{
    width: number;
    height: number;
    sizeKB: number;
    type: string;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    croppedAreaPixelsRef.current = null;
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPendingBlob(null);
    setPendingUrl(null);
    setPendingMeta(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, imageSrc]);

  useEffect(() => {
    return () => {
      if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    };
  }, [pendingUrl]);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    const roundedCrop = {
      x: Math.round(croppedPixels.x),
      y: Math.round(croppedPixels.y),
      width: Math.round(croppedPixels.width),
      height: Math.round(croppedPixels.height),
    };

    croppedAreaPixelsRef.current = roundedCrop;
    setCroppedAreaPixels(roundedCrop);
  }, []);

  const handleSave = async () => {
    const latestCrop = croppedAreaPixelsRef.current ?? croppedAreaPixels;
    if (!latestCrop) return;
    setSaving(true);
    try {
      const blob = await getCroppedImg(imageSrc, latestCrop, outputType);

      // Mät den faktiskt exporterade filen för visuell verifiering
      const url = URL.createObjectURL(blob);
      const probe = new Image();
      const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
        probe.onload = () => resolve({ w: probe.naturalWidth, h: probe.naturalHeight });
        probe.onerror = reject;
        probe.src = url;
      });

      setPendingBlob(blob);
      setPendingUrl(url);
      setPendingMeta({
        width: dims.w,
        height: dims.h,
        sizeKB: Number((blob.size / 1024).toFixed(1)),
        type: blob.type,
      });
    } catch (error) {
      console.error("[ImageCropper] Failed to save image", error);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmVerified = () => {
    if (!pendingBlob) return;
    const blob = pendingBlob;
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPendingBlob(null);
    setPendingUrl(null);
    setPendingMeta(null);
    onComplete(blob);
  };

  const handleRecrop = () => {
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPendingBlob(null);
    setPendingUrl(null);
    setPendingMeta(null);
  };

  const isSquare = pendingMeta ? pendingMeta.width === pendingMeta.height : false;
  const aspectRatioStr = pendingMeta
    ? (pendingMeta.width / Math.max(1, pendingMeta.height)).toFixed(3)
    : "—";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-base">
            {pendingUrl ? "Verifiera exporterad bild" : title}
          </DialogTitle>
        </DialogHeader>

        {pendingUrl && pendingMeta ? (
          <>
            <div className="px-4 pb-2 pt-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Förhandsvisning (cirkel)
                  </p>
                  <div className="relative w-full aspect-square rounded-full overflow-hidden bg-black/60 border border-border">
                    <img
                      src={pendingUrl}
                      alt="Förhandsvisning som cirkel"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">
                    Så här ser den ut på /lyssna
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Exporterad fil (rå)
                  </p>
                  <div className="relative w-full aspect-square overflow-hidden bg-muted/30 border border-border">
                    <img
                      src={pendingUrl}
                      alt="Exporterad fil"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">
                    Faktiska pixlarna som sparas
                  </p>
                </div>
              </div>

              <div className="rounded-md border border-border bg-muted/20 p-2.5 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Dimensioner</span>
                  <span className="font-mono">
                    {pendingMeta.width} × {pendingMeta.height} px
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Aspect ratio</span>
                  <span
                    className={`font-mono ${isSquare ? "text-emerald-500" : "text-amber-500"}`}
                  >
                    {aspectRatioStr} {isSquare ? "✓ 1:1" : "⚠ ej 1:1"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Filstorlek</span>
                  <span className="font-mono">{pendingMeta.sizeKB} KB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Typ</span>
                  <span className="font-mono">{pendingMeta.type}</span>
                </div>
              </div>

              {!isSquare && (
                <p className="text-[11px] text-amber-500">
                  ⚠ Exporten är inte exakt 1:1 – bilden kan bli förskjuten i cirkeln.
                </p>
              )}
            </div>

            <DialogFooter className="px-4 pb-4 pt-2 gap-2">
              <Button variant="outline" onClick={handleRecrop}>
                <RotateCcw className="w-4 h-4 mr-1" /> Beskär om
              </Button>
              <Button onClick={handleConfirmVerified}>
                <Check className="w-4 h-4 mr-1" /> Bekräfta & spara
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="relative w-full aspect-square bg-black/90">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                minZoom={1}
                maxZoom={5}
                aspect={aspect}
                cropShape={cropShape}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid={cropShape === "rect"}
                objectFit="cover"
                roundCropAreaPixels
                restrictPosition={true}
                style={{
                  containerStyle: { width: "100%", height: "100%" },
                }}
              />
            </div>

            <div className="px-4 py-3 flex items-center gap-3">
              <ZoomOut className="w-4 h-4 text-muted-foreground shrink-0" />
              <Slider
                min={1}
                max={5}
                step={0.05}
                value={[zoom]}
                onValueChange={([v]) => setZoom(v)}
                className="flex-1"
              />
              <ZoomIn className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground w-10 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <DialogFooter className="px-4 pb-4 gap-2">
              <Button variant="outline" onClick={onCancel} disabled={saving}>
                <X className="w-4 h-4 mr-1" /> Avbryt
              </Button>
              <Button onClick={handleSave} disabled={saving || !croppedAreaPixels}>
                <Check className="w-4 h-4 mr-1" />
                {saving ? "Verifierar..." : "Använd beskärning"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;
