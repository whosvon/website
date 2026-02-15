import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, User, Menu, X, ArrowRight, Star, LogOut, Trash2, Mail, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Product, StorefrontConfig, User as UserType, OrderItem, StorefrontSection } from "@shared/api";
import { toast } from "sonner";
import ChatWidget from "@/components/ChatWidget";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<StorefrontConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Product[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, configRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/config")
      ]);
      const prodData = await prodRes.json();
      const configData = await configRes.json();
      
      setProducts(prodData);
      setConfig(configData);

      // Apply dynamic colors
      if (configData.accentColor) {
        document.documentElement.style.setProperty('--primary', configData.accentColor);
        document.documentElement.style.setProperty('--ring', configData.accentColor);
      }
      if (configData.backgroundColor) {
        document.documentElement.style.setProperty('--background', configData.backgroundColor);
      }
      if (configData.textColor) {
        document.documentElement.style.setProperty('--foreground', configData.textColor);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => [...prev, product]);
    toast.success(`${product.name} added to registry!`);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      toast.error("Please login to complete your order");
      navigate("/login");
      return;
    }

    if (cart.length === 0) return;

    setIsCheckingOut(true);

    const items: OrderItem[] = cart.map(p => ({
      productId: p.id,
      name: p.name,
      price: p.price,
      quantity: 1
    }));

    const orderData = {
      userId: currentUser.id,
      customerName: currentUser.name || currentUser.email,
      customerEmail: currentUser.email,
      items,
      total: cart.reduce((sum, p) => sum + p.price, 0),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        toast.success("Order secured! Track it in your account.");
        setCart([]);
        setIsCartOpen(false);
        navigate("/account");
      }
    } catch (error) {
      toast.error("Order transmission failed. Security bypass blocked.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Announcement Banner */}
      {config?.announcementText && (
        <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top duration-500">
          {config.announcementText}
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-black tracking-tighter text-primary italic uppercase">
            {config?.brandName || "AETHER"}<span className="text-muted-foreground font-light not-italic ml-1">{config?.brandTagline || "STORE"}</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-bold uppercase tracking-tighter hover:text-primary transition-colors">Home</Link>
            <Link to="#" className="text-sm font-bold uppercase tracking-tighter hover:text-primary transition-colors">Shop</Link>
            <Link to="#" className="text-sm font-bold uppercase tracking-tighter hover:text-primary transition-colors">About</Link>
          </div>

          <div className="flex items-center gap-4">
            <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/5">
                  <ShoppingCart className="h-5 w-5" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                      {cart.length}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-background border-primary/20">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Your Registry</DialogTitle>
                  <DialogDescription>Items queued for acquisition.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {cart.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">Registry is empty</div>
                  ) : (
                    cart.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4 p-3 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-background overflow-hidden border">
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-bold text-sm uppercase italic">{item.name}</div>
                            <div className="text-xs text-primary font-black">${item.price}</div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(idx)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                {cart.length > 0 && (
                  <div className="border-t pt-4 space-y-4">
                    <div className="flex justify-between items-center font-black uppercase italic">
                      <span>Total Acquisition Cost</span>
                      <span className="text-xl text-primary">${cart.reduce((sum, p) => sum + p.price, 0).toFixed(2)}</span>
                    </div>
                    <Button onClick={handleCheckout} disabled={isCheckingOut} className="w-full h-12 font-black uppercase italic rounded-xl">
                      {isCheckingOut ? "Processing..." : "Finalize Acquisition"}
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link to="/account">
                  <Button variant="ghost" size="sm" className="font-bold uppercase tracking-tighter">
                    {currentUser.name?.split(' ')[0] || "Profile"}
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => {
                  localStorage.removeItem("user");
                  localStorage.removeItem("token");
                  setCurrentUser(null);
                  toast.success("Logged out");
                }} className="hover:text-destructive">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="icon" className="hover:bg-primary/5">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Dynamic Sections */}
      <div className="flex flex-col">
        {config?.sections.filter(s => s.visible).map((section) => (
          <SectionRenderer 
            key={section.id} 
            section={section} 
            products={products} 
            addToCart={addToCart} 
          />
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-muted/30 border-t py-24">
        <div className="container mx-auto px-4 text-foreground">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <Link to="/" className="text-3xl font-black tracking-tighter text-primary italic uppercase">
                {config?.brandName || "AETHER"}<span className="text-muted-foreground font-light not-italic ml-1">{config?.brandTagline || "STORE"}</span>
              </Link>
              <p className="text-muted-foreground max-w-sm font-medium leading-relaxed">
                Redefining the digital shopping experience with curated products and seamless technology.
              </p>
            </div>
            <div>
              <h4 className="font-black uppercase italic mb-8 tracking-tighter">Quick Access</h4>
              <ul className="space-y-4 text-sm font-bold uppercase tracking-tighter text-muted-foreground">
                <li><Link to="#" className="hover:text-primary transition-colors">Neural Catalog</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Security Protocol</Link></li>
                <li><Link to="/admin" className="hover:text-primary transition-colors">Terminal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase italic mb-8 tracking-tighter">Connection</h4>
              <ul className="space-y-4 text-sm font-bold uppercase tracking-tighter text-muted-foreground">
                <li>contact@aether.store</li>
                <li>1-800-AETHER-XT</li>
              </ul>
            </div>
          </div>
          <div className="mt-24 pt-10 border-t text-center text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground opacity-50">
            © 2025 {config?.brandName || "AETHER"} System • All protocols reserved.
          </div>
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
}

function SectionRenderer({ section, products, addToCart }: { section: StorefrontSection, products: Product[], addToCart: (p: Product) => void }) {
  switch (section.type) {
    case 'hero':
      return (
        <section className="relative py-20 lg:py-32 overflow-hidden bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-10 max-w-2xl">
                <Badge variant="outline" className="px-4 py-1 text-primary border-primary/20 bg-primary/5 uppercase tracking-widest font-bold">
                  Exclusive Drop
                </Badge>
                <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] uppercase italic">
                  {section.title}
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  {section.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-6 pt-4">
                  <Button size="lg" className="h-16 px-10 text-lg font-black uppercase italic rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                    Shop Now <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                  <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-black uppercase italic rounded-2xl border-2 hover:bg-primary/5 transition-all active:scale-95">
                    Explore
                  </Button>
                </div>
              </div>
              <div className="relative aspect-square lg:aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl rotate-2 border-8 border-background bg-muted">
                <img 
                  src={section.image || "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=1200&q=80"} 
                  alt="" 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
              </div>
            </div>
          </div>
          <div className="absolute top-1/4 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
        </section>
      );
    case 'products':
      return (
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tighter uppercase italic">{section.title}</h2>
                <p className="text-muted-foreground font-medium">{section.subtitle}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {products.length === 0 ? (
                <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[2.5rem] bg-muted/30">
                  <p className="text-muted-foreground font-bold uppercase tracking-widest">No products in current frequency.</p>
                </div>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="group relative bg-background rounded-[2rem] border overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-primary/5">
                    <div className="aspect-[4/5] overflow-hidden bg-muted">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{product.category}</span>
                        <span className="text-xl font-black text-primary italic">${product.price}</span>
                      </div>
                      <h3 className="text-2xl font-black mb-3 tracking-tighter group-hover:text-primary transition-colors uppercase italic">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-8 leading-relaxed font-medium">{product.description}</p>
                      <Button onClick={() => addToCart(product)} className="w-full rounded-2xl h-14 font-black uppercase italic text-base tracking-tighter" variant="outline">
                        Add to Registry
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      );
    case 'about':
      return (
        <section className="py-24 bg-primary text-primary-foreground overflow-hidden relative">
          <div className="container mx-auto px-4 flex flex-col items-center text-center space-y-8 relative z-10">
            <Info className="h-12 w-12 opacity-50 mb-4" />
            <h2 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase italic">{section.title}</h2>
            <p className="text-xl lg:text-2xl max-w-3xl opacity-90 leading-relaxed italic">{section.content}</p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </section>
      );
    case 'newsletter':
      return (
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="bg-muted/50 rounded-[3rem] p-12 lg:p-24 flex flex-col lg:flex-row items-center justify-between gap-12 border border-primary/5 relative overflow-hidden">
               <div className="space-y-6 max-w-xl text-center lg:text-left z-10">
                  <h2 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase italic leading-none">{section.title}</h2>
                  <p className="text-xl text-muted-foreground italic">{section.subtitle}</p>
               </div>
               <div className="flex w-full lg:w-auto gap-4 z-10">
                  <Input placeholder="terminal@aether.store" className="h-16 rounded-2xl bg-background border-none text-lg px-8 lg:w-80 shadow-inner" />
                  <Button className="h-16 px-10 rounded-2xl font-black uppercase italic text-lg shadow-xl shadow-primary/20">Subscribe</Button>
               </div>
               <Mail className="absolute -bottom-24 -right-24 h-96 w-96 text-primary/5 rotate-12" />
            </div>
          </div>
        </section>
      );
    case 'banner':
      return (
        <div className="bg-primary py-4 text-center text-primary-foreground font-black uppercase italic tracking-widest text-lg">
          {section.title}
        </div>
      );
    default:
      return null;
  }
}
