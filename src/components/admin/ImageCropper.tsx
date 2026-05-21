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
import { ZoomIn, ZoomOut, Check, X } from "lucide-react";

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

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    croppedAreaPixelsRef.current = null;
  }, [open, imageSrc]);

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
      onComplete(blob);
    } catch (error) {
      console.error("[ImageCropper] Failed to save image", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-base">{title}</DialogTitle>
        </DialogHeader>

        {/* Crop area */}
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

        {/* Zoom slider */}
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
            {saving ? "Sparar..." : "Använd beskärning"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;
