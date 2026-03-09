import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Users, MessageSquare, Ban, Trash2, Music, Save, CheckCircle2, Loader2, Upload, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePresenceObserver } from "@/hooks/usePresence";
import { useBranding } from "@/hooks/useBranding";
import MixesTab from "./MixesTab";
import ImageCropper from "./ImageCropper";

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

interface ChatMessage {
  id: string;
  nickname: string;
  message: string;
  created_at: string;
  session_id: string | null;
}

interface BannedUser {
  id: string;
  session_id: string;
  nickname: string | null;
  reason: string | null;
  created_at: string;
  expires_at: string | null;
}

const RadioTab = () => {
  const { branding, updateBranding, uploadImage, refetch } = useBranding();
  const { listenerCount, listeners } = usePresenceObserver();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [adminMessage, setAdminMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [radioSectionTitle, setRadioSectionTitle] = useState("");
  
  // Radio image upload state
  const [uploadingRadio, setUploadingRadio] = useState(false);
  const [previewRadio, setPreviewRadio] = useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSrc, setCropperSrc] = useState<string>("");
  const radioInputRef = useRef<HTMLInputElement>(null);

  // Sync radioSectionTitle when branding loads
  useEffect(() => {
    if (branding?.radio_section_title !== undefined) {
      setRadioSectionTitle(branding.radio_section_title || "Live Radio");
    }
  }, [branding?.radio_section_title]);

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase.from("chat_messages").select("*").order("created_at", { ascending: false }).limit(50);
    setMessages(data || []);
    setLoading(false);
    setLoaded(true);
  };

  const fetchBannedUsers = async () => {
    const { data } = await supabase.from("chat_bans").select("*").order("created_at", { ascending: false });
    if (data) setBannedUsers(data);
  };

  const loadChat = () => { fetchMessages(); fetchBannedUsers(); };

  const handleDeleteMessage = async (id: string) => {
    const { error } = await supabase.from("chat_messages").delete().eq("id", id);
    if (error) { toast({ title: "Fel", description: error.message, variant: "destructive" }); }
    else { setMessages((prev) => prev.filter((m) => m.id !== id)); toast({ title: "Borttaget" }); }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Är du säker? Alla meddelanden tas bort permanent.")) return;
    const { error } = await supabase.from("chat_messages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (!error) { setMessages([]); toast({ title: "Alla meddelanden borttagna" }); }
  };

  const handleBanUser = async (sessionId: string, nickname: string) => {
    if (!sessionId) return;
    const { error } = await supabase.from("chat_bans").insert({ session_id: sessionId, nickname, reason: "Banned by admin" });
    if (!error) { toast({ title: `${nickname} blockerad` }); fetchBannedUsers(); }
  };

  const handleUnbanUser = async (id: string) => {
    const { error } = await supabase.from("chat_bans").delete().eq("id", id);
    if (!error) { toast({ title: "Användare avblockerad" }); fetchBannedUsers(); }
  };

  const handleSendAdminMessage = async () => {
    if (!adminMessage.trim()) return;
    const { error } = await supabase.from("chat_messages").insert({ nickname: "👑 DJ Lobo", message: `📢 ${adminMessage}`, session_id: "admin-broadcast" });
    if (!error) { toast({ title: "Meddelande skickat!" }); setAdminMessage(""); if (loaded) fetchMessages(); }
  };

  const handleSaveRadioTitle = async () => {
    setSaving(true);
    const { error } = await updateBranding({ radio_section_title: radioSectionTitle });
    setSaving(false);
    if (error) {
      sonnerToast.error("Kunde inte spara: " + error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      sonnerToast.success("✅ Radiotitel sparad!");
      refetch();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      sonnerToast.error("Fel filtyp – välj en bild (JPG, PNG eller WebP).");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      sonnerToast.error(`Bilden är för stor (${(file.size / 1024 / 1024).toFixed(1)} MB). Välj en bild under ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setCropperSrc(src);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropperOpen(false);
    const previewUrl = URL.createObjectURL(croppedBlob);
    setPreviewRadio(previewUrl);

    const file = new File([croppedBlob], "radio-cropped.jpg", { type: "image/jpeg" });
    setUploadingRadio(true);
    const { url, error } = await uploadImage(file, "radio");
    setUploadingRadio(false);

    if (error) {
      sonnerToast.error(error);
      setPreviewRadio(null);
      return;
    }

    const { error: updateError } = await updateBranding({ radio_image_url: url });
    if (updateError) {
      sonnerToast.error("Kunde inte spara: " + updateError);
    } else {
      sonnerToast.success("✅ Radiobild sparad!");
      setPreviewRadio(null);
      refetch();
    }
  };

  const formatTime = (d: string) => new Date(d).toLocaleString();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="settings">
        <TabsList className="grid w-full grid-cols-3 mb-6 glass-card">
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary/20">
            <Music className="w-4 h-4 mr-2" />Inställningar
          </TabsTrigger>
          <TabsTrigger value="mixes" className="data-[state=active]:bg-primary/20">
            <Music className="w-4 h-4 mr-2" />Mixar
          </TabsTrigger>
          <TabsTrigger value="chat" className="data-[state=active]:bg-primary/20" onClick={() => { if (!loaded) loadChat(); }}>
            <MessageSquare className="w-4 h-4 mr-2" />Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          {/* Radio Section Title */}
          <Card className="glass-card border-white/10 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                📻 Radiosidesrubrik
              </CardTitle>
              <CardDescription>
                Titel som visas högst upp på radiosidan (t.ex. "Live Radio", "On Air", "Lyssna Live")
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="radioSectionTitle">Sektionsrubrik</Label>
                <Input
                  id="radioSectionTitle"
                  value={radioSectionTitle}
                  onChange={(e) => setRadioSectionTitle(e.target.value)}
                  placeholder="Live Radio"
                  className="mt-1.5"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {radioSectionTitle.length} / 50 tecken
                </p>
              </div>
              <Button
                onClick={handleSaveRadioTitle}
                disabled={saving || radioSectionTitle === (branding?.radio_section_title || "Live Radio")}
                size="lg"
                className="w-full text-base py-6"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sparar...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2 text-green-400" />
                    Sparat! ✅
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Spara ändringar
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Radio Image */}
          <Card className="glass-card border-white/10 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="w-5 h-5 text-secondary" />
                Radiobild
              </CardTitle>
              <CardDescription>
                Rund profilbild som visas på radiosidan (Lyssna). Beskärs automatiskt till cirkel.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(previewRadio || (branding as any)?.radio_image_url) ? (
                <div className="space-y-3 max-w-[280px] mx-auto">
                  <div className="relative w-full aspect-square rounded-full overflow-hidden border-4 border-secondary/50">
                    <img
                      src={previewRadio || (branding as any)?.radio_image_url}
                      alt="Radiobild"
                      className="w-full h-full object-cover object-center"
                    />
                    {uploadingRadio && (
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-secondary" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    👆 Förhandsvisning – exakt som på sajten
                  </p>
                </div>
              ) : (
                <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-full overflow-hidden border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-2">
                  <ImageIcon className="w-10 h-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground font-medium">Rund profilbild</p>
                  <p className="text-xs text-muted-foreground">1:1 format</p>
                  {uploadingRadio && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-secondary" />
                    </div>
                  )}
                </div>
              )}
              <input
                ref={radioInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                size="lg"
                variant="outline"
                className="w-full max-w-[280px] mx-auto text-base py-6 flex"
                onClick={() => radioInputRef.current?.click()}
                disabled={uploadingRadio}
              >
                <Upload className="w-5 h-5 mr-2" />
                {uploadingRadio ? "Laddar upp..." : "Ladda upp radiobild"}
              </Button>
              <div className="bg-muted/30 rounded-lg p-3 max-w-[280px] mx-auto space-y-1.5">
                <p className="text-sm font-medium">✂️ Så funkar det</p>
                <p className="text-xs text-muted-foreground">1. Klicka "Ladda upp radiobild"</p>
                <p className="text-xs text-muted-foreground">2. En rund beskärare öppnas – dra och zooma för att välja motivet</p>
                <p className="text-xs text-muted-foreground">3. Klicka "Använd beskärning" – bilden sparas direkt</p>
                <p className="text-xs text-muted-foreground">• Max filstorlek: {MAX_FILE_SIZE_MB} MB</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mixes">
          <MixesTab />
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg icon-gradient-cyan flex items-center justify-center relative">
                    <Users className="w-6 h-6 text-white" />
                    {listenerCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />}
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-foreground">{listenerCount}</p>
                    <p className="text-sm text-muted-foreground">Lyssnare just nu</p>
                  </div>
                </div>
                {listeners.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex flex-wrap gap-1">
                      {listeners.slice(0, 5).map((l, i) => <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-muted/50">{l.nickname}</span>)}
                      {listeners.length > 5 && <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">+{listeners.length - 5}</span>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg icon-gradient-pink flex items-center justify-center"><MessageSquare className="w-6 h-6 text-white" /></div>
                  <div><p className="text-2xl font-display font-bold">{messages.length}</p><p className="text-sm text-muted-foreground">Meddelanden</p></div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg icon-gradient-purple flex items-center justify-center"><Ban className="w-6 h-6 text-white" /></div>
                  <div><p className="text-2xl font-display font-bold">{bannedUsers.length}</p><p className="text-sm text-muted-foreground">Blockerade</p></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Broadcast */}
            <Card className="glass-card-pink">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2"><Send className="w-5 h-5 text-primary" />Skicka meddelande</CardTitle>
                <CardDescription>Visas som "👑 DJ Lobo" i chatten</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input value={adminMessage} onChange={(e) => setAdminMessage(e.target.value)} placeholder="Skriv ditt meddelande..." className="bg-input border-border" maxLength={200} onKeyDown={(e) => e.key === "Enter" && handleSendAdminMessage()} />
                  <Button onClick={handleSendAdminMessage} disabled={!adminMessage.trim()}><Send className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>

            {/* Banned */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2"><Ban className="w-5 h-5 text-destructive" />Blockerade användare</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px]">
                  {bannedUsers.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">Inga blockerade</p> : (
                    <div className="space-y-2">
                      {bannedUsers.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                          <div><p className="font-medium text-sm">{u.nickname || "Okänd"}</p><p className="text-xs text-muted-foreground">{formatTime(u.created_at)}</p></div>
                          <Button size="sm" variant="outline" onClick={() => handleUnbanUser(u.id)}>Avblockera</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display flex items-center gap-2"><MessageSquare className="w-5 h-5 text-secondary" />Chattmeddelanden</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchMessages}>Uppdatera</Button>
                    <Button variant="destructive" size="sm" onClick={handleClearAll} disabled={messages.length === 0}><Trash2 className="w-3 h-3 mr-1" />Rensa alla</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {loading ? <div className="flex justify-center py-8"><div className="loading-spinner" /></div> : messages.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Inga meddelanden</p> : (
                    <div className="space-y-2">
                      {messages.map((msg) => (
                        <div key={msg.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors group">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-primary">{msg.nickname}</span>
                              <span className="text-xs text-muted-foreground">{formatTime(msg.created_at)}</span>
                            </div>
                            <p className="text-sm text-foreground break-words">{msg.message}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                            {msg.session_id && msg.session_id !== "admin-broadcast" && (
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-orange-500 hover:text-orange-400 hover:bg-orange-500/10" onClick={() => handleBanUser(msg.session_id!, msg.nickname)} title="Blockera">
                                <Ban className="w-4 h-4" />
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteMessage(msg.id)} title="Ta bort">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RadioTab;
