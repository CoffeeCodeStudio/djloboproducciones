import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Mail, Lock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminLoginProps {
  onSignIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  onSignUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  onResetPassword: (email: string) => Promise<{ error: Error | null }>;
  loading?: boolean;
  error?: string | null;
}

const AdminLogin = ({ onSignIn, onSignUp, onResetPassword, loading, error }: AdminLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    setLocalError(null);

    if (isForgotPassword) {
      const { error } = await onResetPassword(email);
      if (error) {
        setLocalError(error.message);
      } else {
        setResetSent(true);
      }
      setLocalLoading(false);
      return;
    }

    const { error } = isSignUp 
      ? await onSignUp(email, password)
      : await onSignIn(email, password);

    if (error) {
      setLocalError(error.message);
    }
    setLocalLoading(false);
  };

  const displayError = error || localError;
  const isLoading = loading || localLoading;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="light-leak-purple" />
      <div className="light-leak-blue" />
      
      <Card className="glass-card-neon w-full max-w-md relative z-10">
        <CardHeader className="text-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/")}
            className="absolute left-4 top-4 hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="mx-auto w-16 h-16 rounded-full icon-gradient-pink flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="font-display text-2xl text-neon-gradient">
            {isForgotPassword ? "Återställ lösenord" : isSignUp ? "Skapa konto" : "Admin Login"}
          </CardTitle>
          <CardDescription>
            {isForgotPassword
              ? "Ange din e-post för att få en återställningslänk"
              : isSignUp 
                ? "Registrera dig för att begära åtkomst" 
                : "Logga in för att nå kontrollpanelen"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="E-post"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-input border-border"
                  required
                />
              </div>
              {!isForgotPassword && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Lösenord"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-input border-border"
                    required
                    minLength={6}
                  />
                </div>
              )}
            </div>

            {resetSent && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm">
                Återställningslänk skickad! Kolla din inkorg.
              </div>
            )}

            {displayError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {displayError}
              </div>
            )}

            <Button 
              type="submit"
              className="w-full neon-glow-pink" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner" />
              ) : isForgotPassword ? (
                "Skicka återställningslänk"
              ) : isSignUp ? (
                "Skapa konto"
              ) : (
                "Logga in"
              )}
            </Button>

            {!isForgotPassword && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(true); setLocalError(null); setResetSent(false); }}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Glömt lösenord?
                </button>
              </div>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setIsForgotPassword(false); setLocalError(null); setResetSent(false); }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isForgotPassword
                  ? "Tillbaka till inloggning"
                  : isSignUp 
                    ? "Har du redan ett konto? Logga in" 
                    : "Behöver du ett konto? Registrera dig"}
              </button>
            </div>

            {isSignUp && (
              <p className="text-xs text-muted-foreground text-center">
                OBS: Efter registrering måste en admin ge dig åtkomst.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
