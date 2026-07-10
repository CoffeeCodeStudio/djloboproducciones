import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface Package {
  id: string;
  key: string;
  sort_order: number;
  price: string;
  name_sv: string; name_en: string; name_es: string;
  guests_sv: string; guests_en: string; guests_es: string;
  hours_sv: string; hours_en: string; hours_es: string;
  sound_light_sv: string; sound_light_en: string; sound_light_es: string;
  addon_sv: string; addon_en: string; addon_es: string;
}

interface Settings {
  id: string;
  large_event_sv: string; large_event_en: string; large_event_es: string;
  info_sv: string; info_en: string; info_es: string;
  cta_text_sv: string; cta_text_en: string; cta_text_es: string;
}

const langs = [
  { code: "sv", label: "Svenska" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
] as const;

const PricingTab = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const load = async () => {
    setLoading(true);
    const [pkgRes, setRes] = await Promise.all([
      supabase.from("pricing_packages" as any).select("*").order("sort_order"),
      supabase.from("pricing_settings" as any).select("*").limit(1).maybeSingle(),
    ]);
    if (pkgRes.data) setPackages(pkgRes.data as any);
    if (setRes.data) setSettings(setRes.data as any);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updatePkg = (id: string, field: keyof Package, value: string) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const savePkg = async (pkg: Package) => {
    setSavingId(pkg.id);
    const { id, ...rest } = pkg;
    const { error } = await supabase.from("pricing_packages" as any).update(rest as any).eq("id", id);
    setSavingId(null);
    if (error) toast.error("Kunde inte spara: " + error.message);
    else toast.success(`✅ ${pkg.name_sv} sparat!`);
  };

  const updateSettings = (field: keyof Settings, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    const { id, ...rest } = settings;
    const { error } = await supabase.from("pricing_settings" as any).update(rest as any).eq("id", id);
    setSavingSettings(false);
    if (error) toast.error("Kunde inte spara: " + error.message);
    else toast.success("✅ Gemensamma texter sparade!");
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center mb-4">
        <h2 className="font-display text-2xl flex items-center justify-center gap-2"><DollarSign className="w-6 h-6" />Prispaket</h2>
        <p className="text-sm text-muted-foreground mt-1">Ändra pris, namn och beskrivningar. Ändringarna syns direkt på prislistan.</p>
      </div>

      {packages.map(pkg => (
        <Card key={pkg.id} className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">{pkg.name_sv} — {pkg.price} kr</CardTitle>
            <CardDescription>Paket: {pkg.key}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Pris (utan "kr")</Label>
              <Input value={pkg.price} onChange={e => updatePkg(pkg.id, "price", e.target.value)} placeholder="7 000" className="mt-1.5" />
            </div>
            {langs.map(l => (
              <div key={l.code} className="border-t border-border/50 pt-4 space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">{l.label}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Paketnamn</Label>
                    <Input value={(pkg as any)[`name_${l.code}`]} onChange={e => updatePkg(pkg.id, `name_${l.code}` as any, e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Antal gäster</Label>
                    <Input value={(pkg as any)[`guests_${l.code}`]} onChange={e => updatePkg(pkg.id, `guests_${l.code}` as any, e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Speltid</Label>
                    <Input value={(pkg as any)[`hours_${l.code}`]} onChange={e => updatePkg(pkg.id, `hours_${l.code}` as any, e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Ljud & ljus</Label>
                    <Input value={(pkg as any)[`sound_light_${l.code}`]} onChange={e => updatePkg(pkg.id, `sound_light_${l.code}` as any, e.target.value)} className="mt-1.5" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Tilläggstext</Label>
                    <Input value={(pkg as any)[`addon_${l.code}`]} onChange={e => updatePkg(pkg.id, `addon_${l.code}` as any, e.target.value)} className="mt-1.5" />
                  </div>
                </div>
              </div>
            ))}
            <Button onClick={() => savePkg(pkg)} disabled={savingId === pkg.id} size="lg" className="w-full">
              {savingId === pkg.id ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sparar...</> : <><Save className="w-4 h-4 mr-2" />Spara {pkg.name_sv}</>}
            </Button>
          </CardContent>
        </Card>
      ))}

      {settings && (
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Gemensamma texter</CardTitle>
            <CardDescription>Visas under prispaketen: stor-event-rad, info-rad och CTA-text.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {langs.map(l => (
              <div key={l.code} className="border-t border-border/50 pt-4 space-y-3 first:border-t-0 first:pt-0">
                <p className="text-sm font-semibold text-muted-foreground">{l.label}</p>
                <div>
                  <Label>Stort event (150+ personer)</Label>
                  <Input value={(settings as any)[`large_event_${l.code}`]} onChange={e => updateSettings(`large_event_${l.code}` as any, e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label>Info-rad (under paketen)</Label>
                  <Textarea value={(settings as any)[`info_${l.code}`]} onChange={e => updateSettings(`info_${l.code}` as any, e.target.value)} className="mt-1.5" rows={2} />
                </div>
                <div>
                  <Label>CTA-text</Label>
                  <Input value={(settings as any)[`cta_text_${l.code}`]} onChange={e => updateSettings(`cta_text_${l.code}` as any, e.target.value)} className="mt-1.5" />
                </div>
              </div>
            ))}
            <Button onClick={saveSettings} disabled={savingSettings} size="lg" className="w-full">
              {savingSettings ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sparar...</> : <><Save className="w-4 h-4 mr-2" />Spara gemensamma texter</>}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PricingTab;
