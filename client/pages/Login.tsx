import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ArrowLeft, ShieldCheck, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function Login() {
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setStep(2);
  };

  const handleFinalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, secretCode }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("admin-token", data.token);
        toast.success("Identity verified. Access granted.");
        navigate("/admin");
      } else {
        toast.error("Authentication failed. Security protocol engaged.");
        setStep(1);
        setPassword("");
        setSecretCode("");
      }
    } catch (error) {
      toast.error("System error. Security bypass blocked.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" /> Return to Store
      </Link>
      
      <Card className="w-full max-w-md border-none shadow-none bg-transparent">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto bg-primary/5 w-16 h-16 rounded-3xl flex items-center justify-center mb-2 rotate-3 border border-primary/10">
            {step === 1 ? (
              <Lock className="h-8 w-8 text-primary" />
            ) : (
              <ShieldCheck className="h-8 w-8 text-primary animate-pulse" />
            )}
          </div>
          <CardTitle className="text-4xl font-black tracking-tighter uppercase italic">
            {step === 1 ? "Security Phase I" : "Security Phase II"}
          </CardTitle>
          <CardDescription className="text-base">
            {step === 1 
              ? "Master level authorization required." 
              : "Secondary authentication layer active."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">Primary Key</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="h-14 bg-muted/50 border-none rounded-2xl text-lg px-6 focus-visible:ring-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <Button type="submit" className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95">
                Verify Identity
              </Button>
            </form>
          ) : (
            <form onSubmit={handleFinalLogin} className="space-y-6">
              <div className="space-y-2">
                {/* No label for the secret box as requested */}
                <div className="h-6" /> 
                <Input
                  id="secretCode"
                  type="text"
                  autoComplete="off"
                  placeholder=""
                  className="h-14 bg-muted/50 border-none rounded-2xl text-lg px-6 focus-visible:ring-primary text-center"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-bold rounded-2xl bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-95" 
                disabled={loading}
              >
                {loading ? "Decrypting..." : "Finalize Access"}
              </Button>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="justify-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium opacity-50">
            Encrypted End-to-End • Aether Security System
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
