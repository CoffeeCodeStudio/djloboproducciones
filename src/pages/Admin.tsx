import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Send, Users, MessageSquare, Shield, Ban, Radio, ArrowLeft, LogOut, Palette, ImageIcon, Calendar, Music, Disc3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePresenceObserver } from "@/hooks/usePresence";
import { useAuth } from "@/hooks/useAuth";
import AdminLogin from "@/components/AdminLogin";
import BrandingTab from "@/components/admin/BrandingTab";
import GalleryTab from "@/components/admin/GalleryTab";
import ScheduleTab from "@/components/admin/ScheduleTab";
import MixesTab from "@/components/admin/MixesTab";
import MixcloudTab from "@/components/admin/MixcloudTab";

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

const Admin = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [adminMessage, setAdminMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { listenerCount, listeners } = usePresenceObserver();
  const { user, isAdmin, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isAdmin) {
      fetchMessages();
      fetchBannedUsers();
    }
  }, [user, isAdmin]);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      toast({ title: "Error", description: "Failed to fetch messages", variant: "destructive" });
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const fetchBannedUsers = async () => {
    const { data, error } = await supabase
      .from("chat_bans")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBannedUsers(data);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    const { error } = await supabase
      .from("chat_messages")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ 
        title: "Error", 
        description: "Failed to delete message: " + error.message,
        variant: "destructive" 
      });
    } else {
      toast({ title: "Deleted", description: "Message removed successfully" });
      setMessages(prev => prev.filter(msg => msg.id !== id));
    }
  };

  const handleClearAllMessages = async () => {
    if (!window.confirm("Are you sure you want to delete ALL chat messages? This cannot be undone.")) {
      return;
    }

    const { error } = await supabase
      .from("chat_messages")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all rows

    if (error) {
      toast({ 
        title: "Error", 
        description: "Failed to clear messages: " + error.message,
        variant: "destructive" 
      });
    } else {
      toast({ title: "Cleared", description: "All messages have been deleted" });
      setMessages([]);
    }
  };

  const handleBanUser = async (sessionId: string, nickname: string) => {
    if (!sessionId) {
      toast({ title: "Error", description: "Cannot ban user without session ID", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("chat_bans").insert({
      session_id: sessionId,
      nickname: nickname,
      reason: "Banned by admin",
    });

    if (error) {
      toast({ title: "Error", description: "Failed to ban user", variant: "destructive" });
    } else {
      toast({ title: "Success", description: `${nickname} has been shadow-banned` });
      fetchBannedUsers();
    }
  };

  const handleUnbanUser = async (id: string) => {
    const { error } = await supabase.from("chat_bans").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to unban user", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "User has been unbanned" });
      fetchBannedUsers();
    }
  };

  const handleSendAdminMessage = async () => {
    if (!adminMessage.trim()) return;

    const { error } = await supabase.from("chat_messages").insert({
      nickname: "👑 DJ Lobo",
      message: `📢 ${adminMessage}`,
      session_id: "admin-broadcast",
    });

    if (error) {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Admin message sent!" });
      setAdminMessage("");
      fetchMessages();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out", description: "You have been logged out." });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="light-leak-purple" />
        <div className="light-leak-blue" />
        <div className="loading-spinner" />
      </div>
    );
  }

  // Not logged in - show login form
  if (!user) {
    return <AdminLogin onSignIn={signIn} onSignUp={signUp} />;
  }

  // Logged in but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="light-leak-purple" />
        <div className="light-leak-blue" />
        
        <Card className="glass-card-neon w-full max-w-md relative z-10">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="font-display text-2xl text-foreground">
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have admin privileges.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Logged in as: {user.email}
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authenticated admin view
  return (
    <div className="min-h-screen bg-background">
      <div className="light-leak-purple" />
      <div className="light-leak-blue" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full icon-gradient-pink flex items-center justify-center">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display text-xl text-neon-gradient">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary/50 text-primary">
              <Shield className="w-3 h-3 mr-1" />
              Admin
            </Badge>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSignOut}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <Tabs defaultValue="moderation" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8 glass-card">
            <TabsTrigger value="moderation" className="data-[state=active]:bg-primary/20">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="mixes" className="data-[state=active]:bg-primary/20">
              <Music className="w-4 h-4 mr-2" />
              Mixar
            </TabsTrigger>
            <TabsTrigger value="mixcloud" className="data-[state=active]:bg-primary/20">
              <Disc3 className="w-4 h-4 mr-2" />
              Mixcloud
            </TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-primary/20">
              <Calendar className="w-4 h-4 mr-2" />
              Spelningar
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-primary/20">
              <ImageIcon className="w-4 h-4 mr-2" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="branding" className="data-[state=active]:bg-primary/20">
              <Palette className="w-4 h-4 mr-2" />
              Branding
            </TabsTrigger>
          </TabsList>

          {/* Chat Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg icon-gradient-cyan flex items-center justify-center relative">
                      <Users className="w-6 h-6 text-white" />
                      {listenerCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    <div>
                      <p className="text-2xl font-display font-bold text-foreground">{listenerCount}</p>
                      <p className="text-sm text-muted-foreground">Live Listeners</p>
                    </div>
                  </div>
                  {listeners.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2">Active users:</p>
                      <div className="flex flex-wrap gap-1">
                        {listeners.slice(0, 5).map((listener, idx) => (
                          <span 
                            key={idx}
                            className="text-xs px-2 py-0.5 rounded-full bg-muted/50 text-foreground"
                          >
                            {listener.nickname}
                          </span>
                        ))}
                        {listeners.length > 5 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                            +{listeners.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg icon-gradient-pink flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-display font-bold text-foreground">{messages.length}</p>
                      <p className="text-sm text-muted-foreground">Chat Messages</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg icon-gradient-purple flex items-center justify-center">
                      <Ban className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-display font-bold text-foreground">{bannedUsers.length}</p>
                      <p className="text-sm text-muted-foreground">Banned Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Admin Broadcast */}
              <Card className="glass-card-pink">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Send className="w-5 h-5 text-primary" />
                    Admin Broadcast
                  </CardTitle>
                  <CardDescription>Send an official message to the chat</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      placeholder="Type your announcement..."
                      className="bg-input border-border"
                      maxLength={200}
                      onKeyDown={(e) => e.key === "Enter" && handleSendAdminMessage()}
                    />
                    <Button 
                      onClick={handleSendAdminMessage}
                      className="neon-glow-pink"
                      disabled={!adminMessage.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Message will appear as "👑 DJ Lobo" with 📢 prefix
                  </p>
                </CardContent>
              </Card>

              {/* Banned Users */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Ban className="w-5 h-5 text-destructive" />
                    Shadow-Banned Users
                  </CardTitle>
                  <CardDescription>Users who can't send visible messages</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[150px]">
                    {bannedUsers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No banned users
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {bannedUsers.map((user) => (
                          <div 
                            key={user.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                          >
                            <div>
                              <p className="font-medium text-sm">{user.nickname || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">
                                Banned: {formatTime(user.created_at)}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnbanUser(user.id)}
                              className="text-xs"
                            >
                              Unban
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Recent Messages */}
              <Card className="glass-card lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-display flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-secondary" />
                        Recent Chat Messages
                      </CardTitle>
                      <CardDescription>Manage and moderate chat messages</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={fetchMessages}>
                        Refresh
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={handleClearAllMessages}
                        disabled={messages.length === 0}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Clear All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="loading-spinner" />
                      </div>
                    ) : messages.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No messages yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {messages.map((msg) => (
                          <div 
                            key={msg.id}
                            className="flex items-start justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors group"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-primary">
                                  {msg.nickname}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(msg.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-foreground break-words">
                                {msg.message}
                              </p>
                              {msg.session_id && (
                                <p className="text-xs text-muted-foreground mt-1 font-mono">
                                  Session: {msg.session_id.substring(0, 8)}...
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                              {msg.session_id && msg.session_id !== "admin-broadcast" && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-orange-500 hover:text-orange-400 hover:bg-orange-500/10"
                                  onClick={() => handleBanUser(msg.session_id!, msg.nickname)}
                                  title="Ban user"
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteMessage(msg.id)}
                                title="Delete message"
                              >
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

          {/* Mixes Tab */}
          <TabsContent value="mixes">
            <MixesTab />
          </TabsContent>

          {/* Mixcloud Tab */}
          <TabsContent value="mixcloud">
            <MixcloudTab />
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <ScheduleTab />
          </TabsContent>

          <TabsContent value="gallery">
            <GalleryTab />
          </TabsContent>

          <TabsContent value="branding">
            <BrandingTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
