import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, GripVertical, Pencil, Check, X, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Mix {
  id: string;
  title: string;
  soundcloud_url: string;
  sort_order: number;
}

const MixesTab = () => {
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchMixes();
  }, []);

  const fetchMixes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("soundcloud_mixes")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      toast({ title: "Fel", description: "Kunde inte hämta mixar", variant: "destructive" });
    } else {
      setMixes(data || []);
    }
    setLoading(false);
  };

  const buildEmbedUrl = (rawUrl: string): string => {
    // If already an embed URL, return as-is
    if (rawUrl.includes("w.soundcloud.com/player")) return rawUrl;
    // Convert a regular SoundCloud URL to an embed URL
    const encoded = encodeURIComponent(rawUrl.trim());
    return `https://w.soundcloud.com/player/?url=${encoded}&color=%2300e5ff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
  };

  const handleAdd = async () => {
    const trimmedTitle = newTitle.trim();
    const trimmedUrl = newUrl.trim();

    if (!trimmedTitle || !trimmedUrl) {
      toast({ title: "Fyll i alla fält", description: "Både titel och URL krävs", variant: "destructive" });
      return;
    }

    if (trimmedTitle.length > 100) {
      toast({ title: "Titel för lång", description: "Max 100 tecken", variant: "destructive" });
      return;
    }

    if (!trimmedUrl.includes("soundcloud.com")) {
      toast({ title: "Ogiltig URL", description: "Ange en giltig SoundCloud-länk", variant: "destructive" });
      return;
    }

    setAdding(true);
    const nextOrder = mixes.length > 0 ? Math.max(...mixes.map(m => m.sort_order)) + 1 : 0;

    const { error } = await supabase.from("soundcloud_mixes").insert({
      title: trimmedTitle,
      soundcloud_url: buildEmbedUrl(trimmedUrl),
      sort_order: nextOrder,
    });

    if (error) {
      toast({ title: "Fel", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ Mix tillagd!", description: `"${trimmedTitle}" sparades` });
      setNewTitle("");
      setNewUrl("");
      fetchMixes();
    }
    setAdding(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Ta bort "${title}"?`)) return;
    const { error } = await supabase.from("soundcloud_mixes").delete().eq("id", id);
    if (error) {
      toast({ title: "Fel", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Borttagen", description: `"${title}" har tagits bort` });
      setMixes(prev => prev.filter(m => m.id !== id));
    }
  };

  const startEdit = (mix: Mix) => {
    setEditingId(mix.id);
    setEditTitle(mix.title);
    setEditUrl(mix.soundcloud_url);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditUrl("");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const trimmedTitle = editTitle.trim();
    const trimmedUrl = editUrl.trim();

    if (!trimmedTitle || !trimmedUrl) {
      toast({ title: "Fyll i alla fält", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("soundcloud_mixes")
      .update({ title: trimmedTitle, soundcloud_url: buildEmbedUrl(trimmedUrl) })
      .eq("id", editingId);

    if (error) {
      toast({ title: "Fel", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ Uppdaterad!", description: `"${trimmedTitle}" sparades` });
      cancelEdit();
      fetchMixes();
    }
  };

  return (
    <div className="space-y-6">
      {/* Add new mix */}
      <Card className="glass-card-pink">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Lägg till ny mix
          </CardTitle>
          <CardDescription>Klistra in en SoundCloud-länk och ge den en titel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Titel</label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="t.ex. Latin House Mix 2025"
              className="bg-input border-border text-base h-12"
              maxLength={100}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">SoundCloud URL</label>
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://soundcloud.com/dj-lobo/mix-name"
              className="bg-input border-border text-base h-12"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Klistra in hela länken från SoundCloud (vanlig eller embed-länk)
            </p>
          </div>
          <Button
            onClick={handleAdd}
            disabled={adding || !newTitle.trim() || !newUrl.trim()}
            className="w-full h-12 text-base neon-glow-pink"
          >
            {adding ? <div className="loading-spinner mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
            Lägg till mix
          </Button>
        </CardContent>
      </Card>

      {/* Current mixes */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Music className="w-5 h-5 text-secondary" />
            Aktiva mixar ({mixes.length})
          </CardTitle>
          <CardDescription>Dessa visas på Lyssna-sidan</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner" />
            </div>
          ) : mixes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm">
              Inga mixar tillagda ännu. Lägg till din första ovan!
            </p>
          ) : (
            <div className="space-y-3">
              {mixes.map((mix) => (
                <div
                  key={mix.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors group"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />

                  {editingId === mix.id ? (
                    <div className="flex-1 space-y-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-input border-border text-base h-10"
                        maxLength={100}
                      />
                      <Input
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="bg-input border-border text-sm h-10"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit} className="gap-1">
                          <Check className="w-3 h-3" /> Spara
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit} className="gap-1">
                          <X className="w-3 h-3" /> Avbryt
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{mix.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{mix.soundcloud_url}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-secondary hover:text-secondary hover:bg-secondary/10"
                          onClick={() => startEdit(mix)}
                          title="Redigera"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(mix.id, mix.title)}
                          title="Ta bort"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MixesTab;
