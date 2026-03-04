import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GalleryImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  media_type: string;
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useGallery = () => {
  const queryClient = useQueryClient();

  const { data: images, isLoading } = useQuery({
    queryKey: ["gallery-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as GalleryImage[];
    },
  });

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("branding")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("branding").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const addImage = useMutation({
    mutationFn: async ({
      file,
      altText,
      mediaType = "photo",
      videoUrl,
    }: {
      file?: File;
      altText?: string;
      mediaType?: string;
      videoUrl?: string;
    }) => {
      let imageUrl = "";

      if (file) {
        imageUrl = await uploadFile(file);
      }

      // For YouTube videos without a file upload, use thumbnail as image_url
      if (mediaType === "video" && videoUrl && !file) {
        const ytId = extractYouTubeId(videoUrl);
        imageUrl = ytId
          ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
          : "/placeholder.svg";
      }

      const { data: existing } = await supabase
        .from("gallery_images")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1);

      const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 1;

      const { error } = await supabase.from("gallery_images").insert({
        image_url: imageUrl,
        alt_text: altText || null,
        sort_order: nextOrder,
        media_type: mediaType,
        video_url: videoUrl || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery-images"] });
      toast.success("Media tillagd!");
    },
    onError: (error) => {
      toast.error("Kunde inte lägga till: " + error.message);
    },
  });

  const updateImage = useMutation({
    mutationFn: async ({
      id,
      file,
      altText,
      mediaType,
      videoUrl,
    }: {
      id: string;
      file?: File;
      altText?: string;
      mediaType?: string;
      videoUrl?: string;
    }) => {
      let imageUrl: string | undefined;

      if (file) {
        imageUrl = await uploadFile(file);
      }

      const updateData: Record<string, unknown> = {};
      if (imageUrl) updateData.image_url = imageUrl;
      if (altText !== undefined) updateData.alt_text = altText;
      if (mediaType !== undefined) updateData.media_type = mediaType;
      if (videoUrl !== undefined) updateData.video_url = videoUrl;

      const { error } = await supabase
        .from("gallery_images")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery-images"] });
      toast.success("Media uppdaterad!");
    },
    onError: (error) => {
      toast.error("Kunde inte uppdatera: " + error.message);
    },
  });

  const deleteImage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("gallery_images")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery-images"] });
      toast.success("Media borttagen!");
    },
    onError: (error) => {
      toast.error("Kunde inte ta bort: " + error.message);
    },
  });

  return {
    images: images || [],
    isLoading,
    addImage,
    updateImage,
    deleteImage,
  };
};

export function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] || null;
}
