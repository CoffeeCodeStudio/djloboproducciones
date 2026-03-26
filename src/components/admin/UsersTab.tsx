import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, ShieldOff, Users, Mail, RefreshCw } from "lucide-react";

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "moderator" | "user";
  created_at: string;
  email: string | null;
}

const UsersTab = ({ currentUserId }: { currentUserId: string }) => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);
  const [addingRole, setAddingRole] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const { toast } = useToast();

  const fetchRoles = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("list-admin-users");

    if (error) {
      toast({ title: "Fel", description: "Kunde inte hämta användare.", variant: "destructive" });
    } else {
      setRoles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRoles(); }, []);

  const removeRole = async (roleId: string, userId: string) => {
    if (userId === currentUserId) {
      toast({ title: "Varning", description: "Du kan inte ta bort din egen adminroll.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
    if (error) {
      toast({ title: "Fel", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Klart", description: "Rollen har tagits bort." });
      fetchRoles();
    }
  };

  const changeRole = async (roleId: string, userId: string, newRole: "admin" | "moderator" | "user") => {
    if (userId === currentUserId) {
      toast({ title: "Varning", description: "Du kan inte ändra din egen roll.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("user_roles").update({ role: newRole }).eq("id", roleId);
    if (error) {
      toast({ title: "Fel", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Klart", description: `Roll ändrad till ${newRole}.` });
      fetchRoles();
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setChangingEmail(true);

    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      toast({ title: "Fel", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Bekräftelse skickad", description: "Kolla din nya mejl för att bekräfta ändringen." });
      setNewEmail("");
    }
    setChangingEmail(false);
  };

  const roleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "border-primary/50 text-primary";
      case "moderator": return "border-accent/50 text-accent-foreground";
      default: return "border-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Change own email */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="w-5 h-5" />
            Byt e-postadress
          </CardTitle>
          <CardDescription>Uppdatera din inloggningsadress. En bekräftelselänk skickas till den nya adressen.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangeEmail} className="flex gap-2">
            <Input
              type="email"
              placeholder="Ny e-postadress"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="bg-input border-border flex-1"
              required
            />
            <Button type="submit" disabled={changingEmail} size="sm">
              {changingEmail ? <span className="loading-spinner" /> : "Byt mejl"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* User roles list */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5" />
                Användare & roller
              </CardTitle>
              <CardDescription>Hantera vilka som har åtkomst till adminpanelen.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={fetchRoles} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-8"><div className="loading-spinner" /></div>
          ) : roles.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">Inga roller hittades.</p>
          ) : (
            <div className="space-y-2">
              {roles.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{r.user_id.slice(0, 8)}...</p>
                      <Badge variant="outline" className={`text-[10px] ${roleBadgeColor(r.role)}`}>
                        {r.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {r.role === "admin" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => changeRole(r.id, r.user_id, "user")}
                        disabled={r.user_id === currentUserId}
                        className="text-xs hover:text-destructive"
                      >
                        <ShieldOff className="w-3 h-3 mr-1" />
                        Ta bort admin
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => changeRole(r.id, r.user_id, "admin")}
                        className="text-xs hover:text-primary"
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        Gör admin
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersTab;
