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
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: "linear-gradient(135deg, hsl(220 25% 10%) 0%, hsl(225 20% 14%) 50%, hsl(220 25% 10%) 100%)"
    }}>
      <Card className="w-full max-w-md relative border border-white/[0.08] shadow-2xl shadow-black/40" style={{
        background: "hsl(222 20% 13%)",
      }}>
        <CardHeader className="text-center pb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/")}
            className="absolute left-4 top-4 text-muted-foreground hover:text-foreground hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="mx-auto w-14 h-14 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-4">
            <Shield className="w-7 h-7 text-slate-300" />
          </div>
          <CardTitle className="text-xl font-semibold text-slate-100 tracking-tight">
            {isForgotPassword ? "Återställ lösenord" : "Adminpanel"}
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            {isForgotPassword
              ? "Ange din e-post för att få en återställningslänk"
              : "Logga in för att nå kontrollpanelen"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type="email"
                  placeholder="E-post"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/[0.04] border-white/[0.08] text-slate-200 placeholder:text-slate-500 focus-visible:ring-slate-500/50 focus-visible:border-white/20 h-11"
                  required
                />
              </div>
              {!isForgotPassword && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type="password"
                    placeholder="Lösenord"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-white/[0.04] border-white/[0.08] text-slate-200 placeholder:text-slate-500 focus-visible:ring-slate-500/50 focus-visible:border-white/20 h-11"
                    required
                    minLength={6}
                  />
                </div>
              )}
            </div>

            {resetSent && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                Återställningslänk skickad! Kolla din inkorg.
              </div>
            )}

            {displayError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {displayError}
              </div>
            )}

            <Button 
              type="submit"
              className="w-full h-11 bg-slate-200 text-slate-900 hover:bg-white font-medium transition-colors" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner" />
              ) : isForgotPassword ? (
                "Skicka återställningslänk"
              ) : (
                "Logga in"
              )}
            </Button>

            {!isForgotPassword && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(true); setLocalError(null); setResetSent(false); }}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Glömt lösenord?
                </button>
              </div>
            )}

            {isForgotPassword && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(false); setLocalError(null); setResetSent(false); }}
                  className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Tillbaka till inloggning
                </button>
              </div>
            )}

            {!isForgotPassword && !isSignUp && (
              <p className="text-xs text-slate-500 text-center">
                Kontakta din administratör för att få ett konto skapat
              </p>
            )}
          </form>

          <div className="pt-2 border-t border-white/[0.06]">
            <p className="text-[11px] text-slate-600 text-center">
              Problem med inloggningen?{" "}
              <a 
                href="https://coffeecodestudio.se" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-400 underline underline-offset-2 transition-colors"
              >
                Kontakta ☕ Coffee Code Studio
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
