import { useState, useCallback, useEffect } from "react";
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
  saveMode?: "crop" | "contain";
  outputType?: "image/jpeg" | "image/png";
  onComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

type CropViewport = {
  width: number;
  height: number;
};

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

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      outputType,
      outputType === "image/jpeg" ? 0.92 : undefined
    );
  });
}

async function getContainedImg(
  imageSrc: string,
  crop: { x: number; y: number },
  zoom: number,
  cropViewport: CropViewport,
  aspect: number,
  outputType: "image/jpeg" | "image/png" = "image/png"
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const baseSize = Math.min(Math.max(Math.max(sourceWidth, sourceHeight), 1024), 2048);
  const canvasWidth = aspect >= 1 ? baseSize : Math.round(baseSize * aspect);
  const canvasHeight = aspect >= 1 ? Math.round(baseSize / aspect) : baseSize;

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext("2d")!;
  if (outputType === "image/jpeg") {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  } else {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  }

  const baseScale = Math.min(canvasWidth / sourceWidth, canvasHeight / sourceHeight);
  const drawWidth = sourceWidth * baseScale * zoom;
  const drawHeight = sourceHeight * baseScale * zoom;
  const offsetScaleX = canvasWidth / cropViewport.width;
  const offsetScaleY = canvasHeight / cropViewport.height;
  const x = canvasWidth / 2 - drawWidth / 2 + crop.x * offsetScaleX;
  const y = canvasHeight / 2 - drawHeight / 2 + crop.y * offsetScaleY;

  ctx.drawImage(image, x, y, drawWidth, drawHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
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
  saveMode = "crop",
  outputType = "image/jpeg",
  onComplete,
  onCancel,
}: ImageCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [cropViewport, setCropViewport] = useState<CropViewport | null>(null);
  const [saving, setSaving] = useState(false);
  const minZoom = saveMode === "contain" ? 0.5 : 1;
  const maxZoom = saveMode === "contain" ? 1 : 5;

  useEffect(() => {
    if (!open) return;

    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropViewport(null);
  }, [open, imageSrc, saveMode]);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    if (saveMode === "crop" && !croppedAreaPixels) return;
    if (saveMode === "contain" && !cropViewport) return;

    setSaving(true);
    try {
      const blob = saveMode === "contain" && cropViewport
        ? await getContainedImg(imageSrc, crop, zoom, cropViewport, aspect, outputType)
        : await getCroppedImg(imageSrc, croppedAreaPixels!, outputType);

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
            minZoom={minZoom}
            maxZoom={maxZoom}
            aspect={aspect}
            cropShape={cropShape}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            onCropSizeChange={setCropViewport}
            showGrid={cropShape === "rect"}
            objectFit={saveMode === "contain" ? "contain" : "cover"}
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
            min={minZoom}
            max={maxZoom}
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
          <Button onClick={handleSave} disabled={saving || (saveMode === "contain" ? !cropViewport : !croppedAreaPixels)}>
            <Check className="w-4 h-4 mr-1" />
            {saving ? "Sparar..." : "Använd beskärning"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;
