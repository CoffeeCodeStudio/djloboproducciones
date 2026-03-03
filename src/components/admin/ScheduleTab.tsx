import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar, Save, ExternalLink, Info, Key, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ScheduleTab = () => {
  const [calendarId, setCalendarId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("site_branding")
      .select("google_calendar_id")
      .limit(1)
      .maybeSingle();

    if (!error && data?.google_calendar_id) {
      setCalendarId(data.google_calendar_id);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const { data: existing } = await supabase
      .from("site_branding")
      .select("id")
      .limit(1)
      .maybeSingle();

    let error;
    if (existing) {
      const result = await supabase
        .from("site_branding")
        .update({ google_calendar_id: calendarId || null })
        .eq("id", existing.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("site_branding")
        .insert({ google_calendar_id: calendarId || null });
      error = result.error;
    }

    if (error) {
      toast({ title: "Fel", description: "Kunde inte spara: " + error.message, variant: "destructive" });
    } else {
      toast({ title: "Sparat!", description: "Kalender-inställningar uppdaterade" });
    }
    setSaving(false);
  };

  const handleTest = async () => {
    if (!calendarId) {
      setTestResult({ ok: false, message: "Ange ett Kalender-ID först" });
      return;
    }
    setTesting(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("google-calendar", {
        body: { calendarId },
      });

      if (error) {
        setTestResult({ ok: false, message: `Fel: ${error.message}` });
      } else if (data?.error) {
        setTestResult({ ok: false, message: `Google API: ${data.details || data.error}` });
      } else {
        const count = data?.items?.length ?? 0;
        setTestResult({ ok: true, message: `✅ Fungerar! ${count} event(s) hittade.` });
      }
    } catch (err: any) {
      setTestResult({ ok: false, message: `Oväntat fel: ${err.message}` });
    }
    setTesting(false);
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
      {/* Google Calendar ID */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Google Calendar
          </CardTitle>
          <CardDescription>
            Koppla din Google Kalender för att visa kommande spelningar på sidan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info box */}
          <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Så här konfigurerar du:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Gå till <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a></li>
                  <li>Aktivera <strong>Google Calendar API</strong></li>
                  <li>Skapa en <strong>API Key</strong> under Credentials</li>
                  <li>Klistra in nyckeln nedan</li>
                </ol>
                <p className="mt-2">
                  <strong>Kalender-ID:</strong> Finns i Google Calendar → Inställningar → Integrera kalender. Kalendern måste vara <strong>offentlig</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Calendar ID */}
          <div className="space-y-2">
            <Label htmlFor="calendar-id">Kalender-ID</Label>
            <Input
              id="calendar-id"
              value={calendarId}
              onChange={(e) => setCalendarId(e.target.value)}
              placeholder="din-email@gmail.com"
              className="bg-input border-border"
            />
            <p className="text-xs text-muted-foreground">
              T.ex. din Gmail-adress eller ett längre kalender-ID
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSave} disabled={saving} className="neon-glow-pink">
              {saving ? <div className="loading-spinner w-4 h-4" /> : <><Save className="w-4 h-4 mr-2" />Spara</>}
            </Button>
            <Button onClick={handleTest} disabled={testing} variant="outline">
              {testing ? <div className="loading-spinner w-4 h-4" /> : <><RefreshCw className="w-4 h-4 mr-2" />Testa anslutning</>}
            </Button>
          </div>

          {/* Test result */}
          {testResult && (
            <div className={`rounded-lg p-3 text-sm ${testResult.ok ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-destructive/10 border border-destructive/30 text-destructive'}`}>
              {testResult.message}
            </div>
          )}

          {/* Status */}
          <div className="pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              <strong>Status:</strong>{" "}
              {calendarId ? (
                <span className="text-green-400">Kalender kopplad ({calendarId})</span>
              ) : (
                <span className="text-yellow-400">Ingen kalender kopplad</span>
              )}
            </p>
          </div>

          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            Öppna Google Calendar
          </a>
        </CardContent>
      </Card>

      {/* API Key info card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            API-nyckel
          </CardTitle>
          <CardDescription>
            Google Calendar API-nyckeln hanteras säkert som en server-hemlighet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              API-nyckeln lagras säkert på servern och kan <strong>inte</strong> ses i webbläsaren. 
              Om du behöver byta nyckel, kontakta utvecklaren eller uppdatera den via Lovable Chat med kommandot: 
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs ml-1">"Uppdatera GOOGLE_CALENDAR_API_KEY"</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleTab;
