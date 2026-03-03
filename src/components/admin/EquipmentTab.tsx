import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Save, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ICON_OPTIONS = [
  "Disc3", "Headphones", "Music2", "Radio", "Speaker", "Mic2", "MonitorSpeaker", "Podcast",
  "Music", "Volume2", "Wifi", "Zap", "Lightbulb", "Camera",
];

interface EquipmentItem {
  id: string;
  title_sv: string;
  title_en: string;
  title_es: string;
  description_sv: string;
  description_en: string;
  description_es: string;
  icon: string;
  sort_order: number;
}

const EquipmentTab = () => {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("equipment")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleAdd = async () => {
    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.sort_order)) + 1 : 0;
    const { data, error } = await supabase.from("equipment").insert({
      title_sv: "Ny utrustning",
      title_en: "New equipment",
      title_es: "Nuevo equipo",
      description_sv: "Beskrivning",
      description_en: "Description",
      description_es: "Descripción",
      icon: "Disc3",
      sort_order: maxOrder,
    }).select().single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data) {
      setItems(prev => [...prev, data]);
      toast({ title: "Tillagd", description: "Ny utrustning tillagd" });
    }
  };

  const handleSave = async (item: EquipmentItem) => {
    setSaving(item.id);
    const { error } = await supabase.from("equipment").update({
      title_sv: item.title_sv,
      title_en: item.title_en,
      title_es: item.title_es,
      description_sv: item.description_sv,
      description_en: item.description_en,
      description_es: item.description_es,
      icon: item.icon,
      sort_order: item.sort_order,
    }).eq("id", item.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sparad", description: "Utrustning uppdaterad" });
    }
    setSaving(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Är du säker på att du vill ta bort denna utrustning?")) return;
    const { error } = await supabase.from("equipment").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setItems(prev => prev.filter(i => i.id !== id));
      toast({ title: "Borttagen", description: "Utrustning borttagen" });
    }
  };

  const updateItem = (id: string, field: keyof EquipmentItem, value: string | number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-neon-gradient">Utrustning</h2>
          <p className="text-sm text-muted-foreground">Hantera utrustning som visas på Spelningar-sidan</p>
        </div>
        <Button onClick={handleAdd} className="neon-glow-pink">
          <Plus className="w-4 h-4 mr-2" />
          Lägg till
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="glass-card">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Icon selector */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Ikon</label>
                  <Select value={item.icon} onValueChange={(v) => updateItem(item.id, "icon", v)}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map(ic => (
                        <SelectItem key={ic} value={ic}>{ic}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort order */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Sortering</label>
                  <Input
                    type="number"
                    value={item.sort_order}
                    onChange={(e) => updateItem(item.id, "sort_order", parseInt(e.target.value) || 0)}
                    className="bg-input border-border"
                  />
                </div>

                {/* Swedish */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">🇸🇪 Titel</label>
                  <Input value={item.title_sv} onChange={(e) => updateItem(item.id, "title_sv", e.target.value)} className="bg-input border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">🇸🇪 Beskrivning</label>
                  <Input value={item.description_sv} onChange={(e) => updateItem(item.id, "description_sv", e.target.value)} className="bg-input border-border" />
                </div>

                {/* English */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">🇬🇧 Title</label>
                  <Input value={item.title_en} onChange={(e) => updateItem(item.id, "title_en", e.target.value)} className="bg-input border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">🇬🇧 Description</label>
                  <Input value={item.description_en} onChange={(e) => updateItem(item.id, "description_en", e.target.value)} className="bg-input border-border" />
                </div>

                {/* Spanish */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">🇪🇸 Título</label>
                  <Input value={item.title_es} onChange={(e) => updateItem(item.id, "title_es", e.target.value)} className="bg-input border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">🇪🇸 Descripción</label>
                  <Input value={item.description_es} onChange={(e) => updateItem(item.id, "description_es", e.target.value)} className="bg-input border-border" />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Ta bort
                </Button>
                <Button size="sm" onClick={() => handleSave(item)} disabled={saving === item.id}>
                  <Save className="w-4 h-4 mr-1" />
                  {saving === item.id ? "Sparar..." : "Spara"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Ingen utrustning tillagd ännu.</p>
          <Button onClick={handleAdd} variant="outline" className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Lägg till första
          </Button>
        </div>
      )}
    </div>
  );
};

export default EquipmentTab;
