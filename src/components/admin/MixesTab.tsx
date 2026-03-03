import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Pencil, Check, X, Music, Pin, EyeOff, Eye, RefreshCw, Disc3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Mix {
  id: string;
  title: string;
  url: string;
  cover_art_url: string | null;
  sort_order: number;
  pinned: boolean;
  hidden: boolean;
  source: string;
  table: "soundcloud" | "mixcloud";
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
  const [fetching, setFetching] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchMixes(); }, []);

  const fetchMixes = async () => {
    setLoading(true);
    const [scRes, mcRes] = await Promise.all([
      supabase.from("soundcloud_mixes").select("*").order("sort_order", { ascending: true }),
      supabase.from("mixcloud_mixes").select("*").order("sort_order", { ascending: true }),
    ]);

    const scMixes: Mix[] = (scRes.data || []).map((m) => ({
      id: m.id,
      title: m.title,
      url: m.soundcloud_url,
      cover_art_url: m.cover_art_url,
      sort_order: m.sort_order,
      pinned: m.pinned ?? false,
      hidden: m.hidden ?? false,
      source: m.source ?? "manual",
      table: "soundcloud" as const,
    }));

    const mcMixes: Mix[] = (mcRes.data || []).map((m) => ({
      id: m.id,
      title: m.title,
      url: m.mixcloud_url,
      cover_art_url: m.cover_art_url,
      sort_order: m.sort_order,
      pinned: m.pinned ?? false,
      hidden: m.hidden ?? false,
      source: m.source ?? "manual",
      table: "mixcloud" as const,
    }));

    const all = [...scMixes, ...mcMixes].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return a.sort_order - b.sort_order;
    });

    setMixes(all);
    setLoading(false);
  };

  const detectSource = (url: string): "soundcloud" | "mixcloud" | null => {
    if (url.includes("soundcloud.com")) return "soundcloud";
    if (url.includes("mixcloud.com")) return "mixcloud";
    return null;
  };

  const buildSoundCloudEmbedUrl = (rawUrl: string): string => {
    if (rawUrl.includes("w.soundcloud.com/player")) return rawUrl;
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

    const source = detectSource(trimmedUrl);
    if (!source) {
      toast({ title: "Ogiltig URL", description: "Ange en SoundCloud eller Mixcloud-länk", variant: "destructive" });
      return;
    }

    setAdding(true);
    const nextOrder = mixes.length > 0 ? Math.max(...mixes.map(m => m.sort_order)) + 1 : 0;

    if (source === "soundcloud") {
      const { error } = await supabase.from("soundcloud_mixes").insert({
        title: trimmedTitle,
        soundcloud_url: buildSoundCloudEmbedUrl(trimmedUrl),
        sort_order: nextOrder,
        source: "manual",
      });
      if (error) toast({ title: "Fel", description: error.message, variant: "destructive" });
      else { toast({ title: "✅ Mix tillagd!" }); setNewTitle(""); setNewUrl(""); fetchMixes(); }
    } else {
      const { error } = await supabase.from("mixcloud_mixes").insert({
        title: trimmedTitle,
        mixcloud_url: trimmedUrl,
        sort_order: nextOrder,
        source: "manual",
      });
      if (error) toast({ title: "Fel", description: error.message, variant: "destructive" });
      else { toast({ title: "✅ Set tillagt!" }); setNewTitle(""); setNewUrl(""); fetchMixes(); }
    }
    setAdding(false);
  };

  const handleDelete = async (mix: Mix) => {
    if (!window.confirm(`Ta bort "${mix.title}"?`)) return;
    const table = mix.table === "soundcloud" ? "soundcloud_mixes" : "mixcloud_mixes";
    const { error } = await supabase.from(table).delete().eq("id", mix.id);
    if (error) toast({ title: "Fel", description: error.message, variant: "destructive" });
    else { toast({ title: "Borttagen" }); setMixes(prev => prev.filter(m => m.id !== mix.id)); }
  };

  const togglePin = async (mix: Mix) => {
    const table = mix.table === "soundcloud" ? "soundcloud_mixes" : "mixcloud_mixes";
    const { error } = await supabase.from(table).update({ pinned: !mix.pinned }).eq("id", mix.id);
    if (!error) {
      setMixes(prev => prev.map(m => m.id === mix.id ? { ...m, pinned: !m.pinned } : m));
      toast({ title: mix.pinned ? "Avpinnad" : "📌 Pinnad!" });
    }
  };

  const toggleHidden = async (mix: Mix) => {
    const table = mix.table === "soundcloud" ? "soundcloud_mixes" : "mixcloud_mixes";
    const { error } = await supabase.from(table).update({ hidden: !mix.hidden }).eq("id", mix.id);
    if (!error) {
      setMixes(prev => prev.map(m => m.id === mix.id ? { ...m, hidden: !m.hidden } : m));
      toast({ title: mix.hidden ? "Synlig igen" : "🙈 Dold" });
    }
  };

  const handleAutoFetch = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-mixcloud");
      if (error) throw error;
      toast({
        title: "✅ Mixcloud synkad!",
        description: `${data?.inserted || 0} nya mixar hämtades`,
      });
      fetchMixes();
    } catch (err: any) {
      toast({ title: "Fel vid hämtning", description: err.message, variant: "destructive" });
    }
    setFetching(false);
  };

  const startEdit = (mix: Mix) => {
    setEditingId(mix.id);
    setEditTitle(mix.title);
    setEditUrl(mix.url);
  };

  const cancelEdit = () => { setEditingId(null); };

  const saveEdit = async () => {
    if (!editingId) return;
    const mix = mixes.find(m => m.id === editingId);
    if (!mix) return;
    const trimmedTitle = editTitle.trim();
    const trimmedUrl = editUrl.trim();
    if (!trimmedTitle || !trimmedUrl) { toast({ title: "Fyll i alla fält", variant: "destructive" }); return; }

    const table = mix.table === "soundcloud" ? "soundcloud_mixes" : "mixcloud_mixes";
    const urlField = mix.table === "soundcloud" ? "soundcloud_url" : "mixcloud_url";
    const finalUrl = mix.table === "soundcloud" ? buildSoundCloudEmbedUrl(trimmedUrl) : trimmedUrl;

    const { error } = await supabase
      .from(table)
      .update({ title: trimmedTitle, [urlField]: finalUrl })
      .eq("id", editingId);

    if (error) toast({ title: "Fel", description: error.message, variant: "destructive" });
    else { toast({ title: "✅ Uppdaterad!" }); cancelEdit(); fetchMixes(); }
  };

  return (
    <div className="space-y-6">
      {/* Auto-fetch + Add mix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Auto-fetch card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-accent" />
              Auto-Fetch Mixcloud
            </CardTitle>
            <CardDescription>
              Hämta senaste mixar automatiskt från DjLobo75 på Mixcloud
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleAutoFetch}
              disabled={fetching}
              className="w-full h-12 text-base"
              variant="outline"
            >
              {fetching ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Hämtar från Mixcloud...
                </>
              ) : (
                <>
                  <Disc3 className="w-5 h-5 mr-2" />
                  Synka med Mixcloud
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Nya mixar läggs till automatiskt. Befintliga uppdateras inte.
            </p>
          </CardContent>
        </Card>

        {/* Add new mix */}
        <Card className="glass-card-pink">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Lägg till mix manuellt
            </CardTitle>
            <CardDescription>SoundCloud eller Mixcloud — detekteras automatiskt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Titel, t.ex. Latin House 2025"
              className="bg-input border-border h-11"
              maxLength={100}
            />
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://soundcloud.com/... eller https://mixcloud.com/..."
              className="bg-input border-border h-11"
            />
            <Button
              onClick={handleAdd}
              disabled={adding || !newTitle.trim() || !newUrl.trim()}
              className="w-full h-11 neon-glow-pink"
            >
              {adding ? <div className="loading-spinner mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
              Lägg till
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Unified mix list */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Music className="w-5 h-5 text-secondary" />
            Alla mixar ({mixes.length})
          </CardTitle>
          <CardDescription>Hantera alla SoundCloud & Mixcloud-mixar. Pinna, dölj eller ta bort.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8"><div className="loading-spinner" /></div>
          ) : mixes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm">
              Inga mixar tillagda. Synka med Mixcloud eller lägg till manuellt!
            </p>
          ) : (
            <div className="space-y-2">
              {mixes.map((mix) => (
                <div
                  key={mix.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors group ${
                    mix.hidden ? "bg-muted/10 opacity-60" : "bg-muted/20 hover:bg-muted/30"
                  }`}
                >
                  {/* Cover art thumbnail */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border/30 bg-muted">
                    {mix.cover_art_url ? (
                      <img src={mix.cover_art_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {editingId === mix.id ? (
                    <div className="flex-1 space-y-2">
                      <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="bg-input border-border h-9" maxLength={100} />
                      <Input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} className="bg-input border-border h-9 text-xs" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit} className="gap-1"><Check className="w-3 h-3" /> Spara</Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit} className="gap-1"><X className="w-3 h-3" /> Avbryt</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-foreground truncate">{mix.title}</p>
                          {mix.pinned && <Pin className="w-3 h-3 text-primary shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            mix.table === "mixcloud" ? "bg-accent/20 text-accent" : "bg-secondary/20 text-secondary"
                          }`}>
                            {mix.table === "mixcloud" ? "MC" : "SC"}
                          </span>
                          <span className="truncate">{mix.source === "auto" ? "Auto-fetched" : "Manuell"}</span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className={`h-8 w-8 ${mix.pinned ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                          onClick={() => togglePin(mix)} title={mix.pinned ? "Avpinna" : "Pinna"}>
                          <Pin className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className={`h-8 w-8 ${mix.hidden ? "text-muted-foreground" : "text-muted-foreground hover:text-foreground"}`}
                          onClick={() => toggleHidden(mix)} title={mix.hidden ? "Visa" : "Dölj"}>
                          {mix.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-secondary"
                          onClick={() => startEdit(mix)} title="Redigera">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(mix)} title="Ta bort">
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
