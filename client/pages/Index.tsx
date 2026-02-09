import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, User, Menu, X, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product, StorefrontConfig } from "@shared/api";
import { toast } from "sonner";

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<StorefrontConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchData();
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

      // Apply dynamic accent color
      if (configData.accentColor) {
        document.documentElement.style.setProperty('--primary', configData.accentColor);
        document.documentElement.style.setProperty('--ring', configData.accentColor);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    setCartCount(prev => prev + 1);
    toast.success("Added to cart!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
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
            <Link to="/admin" className="text-sm font-bold uppercase tracking-tighter hover:text-primary transition-colors">Admin</Link>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative hover:bg-primary/5">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
            <Link to="/login">
              <Button variant="ghost" size="icon" className="hover:bg-primary/5">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10 max-w-2xl">
              <Badge variant="outline" className="px-4 py-1 text-primary border-primary/20 bg-primary/5 uppercase tracking-widest font-bold">
                New Collection 2025
              </Badge>
              <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] uppercase italic">
                {config?.heroTitle || "Elevate Your Digital Lifestyle."}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                {config?.heroDescription || "Experience the perfect blend of minimalist design and cutting-edge technology."}
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
                src={config?.heroImage || "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=1200&q=80"} 
                alt="Featured Product" 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
            </div>
          </div>
        </div>
        
        {/* Abstract background elements */}
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      </section>

      {/* Product Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-black tracking-tighter uppercase italic">Featured Inventory</h2>
              <p className="text-muted-foreground font-medium">Carefully curated items for your digital existence.</p>
            </div>
            <Link to="#" className="text-sm font-black uppercase tracking-widest flex items-center hover:text-primary transition-colors group">
              View Collection <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
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
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-6 right-6 flex flex-col gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <Button variant="secondary" size="icon" className="rounded-full shadow-lg bg-background/80 backdrop-blur-md">
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{product.category}</span>
                      <span className="text-xl font-black text-primary italic">${product.price}</span>
                    </div>
                    <h3 className="text-2xl font-black mb-3 tracking-tighter group-hover:text-primary transition-colors uppercase italic">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-8 leading-relaxed font-medium">
                      {product.description}
                    </p>
                    <Button onClick={addToCart} className="w-full rounded-2xl h-14 font-black uppercase italic text-base tracking-tighter" variant="outline">
                      Add to Registry
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <Link to="/" className="text-3xl font-black tracking-tighter text-primary italic uppercase">
                {config?.brandName || "AETHER"}<span className="text-muted-foreground font-light not-italic ml-1">{config?.brandTagline || "STORE"}</span>
              </Link>
              <p className="text-muted-foreground max-w-sm font-medium leading-relaxed">
                {config?.heroDescription || "Redefining the digital shopping experience with curated products and seamless technology."}
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
    </div>
  );
}
