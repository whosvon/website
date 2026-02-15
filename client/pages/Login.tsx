import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, ArrowLeft, ShieldCheck, Mail, UserPlus, LogIn, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function Login() {
  const [activeTab, setActiveTab] = useState("customer");
  
  // Admin State
  const [adminStep, setAdminStep] = useState(1);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  
  // Customer State
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Admin Login
  const handleAdminNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword) return;
    setAdminStep(2);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword, secretCode: adminSecret }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("admin-token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Admin identity verified.");
        navigate("/admin");
      } else {
        toast.error("Auth failed.");
        setAdminStep(1);
        setAdminPassword("");
        setAdminSecret("");
      }
    } catch (error) {
      toast.error("System error.");
    } finally {
      setLoading(false);
    }
  };

  // Customer Login/Register
  const handleCustomerAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isRegistering ? "/api/register" : "/api/login/customer";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success(isRegistering ? "Account created!" : "Welcome back!");
        navigate("/account");
      } else {
        toast.error(data.message || "Auth failed.");
      }
    } catch (error) {
      toast.error("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    // Mocking Google login for the UI
    try {
      const mockGoogleData = {
        email: "google.user@gmail.com",
        name: "Google User",
        picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Google"
      };
      const res = await fetch("/api/login/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockGoogleData),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Signed in with Google");
        navigate("/account");
      }
    } catch (error) {
      toast.error("Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" /> Return to Store
      </Link>
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
           <h1 className="text-4xl font-black tracking-tighter uppercase italic">AETHER AUTH</h1>
           <p className="text-muted-foreground">Select your access protocol</p>
        </div>

        <Tabs defaultValue="customer" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl h-12 bg-muted/50 p-1">
            <TabsTrigger value="customer" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Customer</TabsTrigger>
            <TabsTrigger value="admin" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="customer" className="mt-6">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>{isRegistering ? "Create Account" : "Welcome Back"}</CardTitle>
                <CardDescription>
                  {isRegistering ? "Join Aether to track your orders." : "Sign in to access your profile."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleCustomerAuth} className="space-y-4">
                  {isRegistering && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full h-11 font-bold rounded-xl" disabled={loading}>
                    {loading ? "Processing..." : (isRegistering ? "Register Account" : "Sign In")}
                  </Button>
                </form>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
                </div>

                <Button variant="outline" className="w-full h-11 font-medium rounded-xl border-border/50" onClick={handleGoogleLogin}>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </Button>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="w-full text-muted-foreground text-xs" onClick={() => setIsRegistering(!isRegistering)}>
                  {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Register"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="admin" className="mt-6">
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="text-center pb-8">
                <div className="mx-auto bg-primary/5 w-16 h-16 rounded-3xl flex items-center justify-center mb-2 rotate-3 border border-primary/10">
                  {adminStep === 1 ? <Lock className="h-8 w-8 text-primary" /> : <ShieldCheck className="h-8 w-8 text-primary animate-pulse" />}
                </div>
                <CardTitle className="uppercase italic">Admin Access</CardTitle>
                <CardDescription>Security Phase {adminStep}</CardDescription>
              </CardHeader>
              <CardContent>
                {adminStep === 1 ? (
                  <form onSubmit={handleAdminNext} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminPass">Primary Key</Label>
                      <Input id="adminPass" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="h-12 bg-muted/50 border-none rounded-xl" autoFocus required />
                    </div>
                    <Button type="submit" className="w-full h-12 font-bold rounded-xl shadow-lg shadow-primary/20">Verify Phase I</Button>
                  </form>
                ) : (
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="space-y-2 text-center">
                       <p className="text-xs text-muted-foreground mb-2">Input Secret Code Below</p>
                       <Input id="adminSecret" type="text" value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)} className="h-14 bg-muted/50 border-none rounded-xl text-center text-lg tracking-widest" autoFocus required />
                    </div>
                    <Button type="submit" className="w-full h-12 font-bold rounded-xl bg-foreground text-background" disabled={loading}>Finalize Access</Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
