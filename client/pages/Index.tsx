import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, User, Menu, X, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@shared/api";
import { toast } from "sonner";

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    setCartCount(prev => prev + 1);
    toast.success("Added to cart!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-primary">
            AETHER<span className="text-muted-foreground font-light">STORE</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <Link to="#" className="text-sm font-medium hover:text-primary transition-colors">Shop</Link>
            <Link to="#" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
            <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors">Admin</Link>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
            <Link to="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 max-w-2xl">
              <Badge variant="outline" className="px-4 py-1 text-primary border-primary/20 bg-primary/5">
                New Collection 2025
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
                Elevate Your <span className="text-primary italic">Digital</span> Lifestyle.
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Experience the perfect blend of minimalist design and cutting-edge technology. Our curated collection brings you the future of living.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full">
                  Shop Collection <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=1200&q=80" 
                alt="Featured Product" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
              <p className="text-muted-foreground mt-2">Carefully selected items for your lifestyle.</p>
            </div>
            <Link to="#" className="text-sm font-semibold flex items-center hover:underline">
              View All Products <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[400px] bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.id} className="group relative bg-background rounded-2xl border overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <Button variant="secondary" size="icon" className="rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{product.category}</span>
                      <span className="text-sm font-bold text-primary">${product.price}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                      {product.description}
                    </p>
                    <Button onClick={addToCart} className="w-full rounded-xl h-11" variant="outline">
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <Link to="/" className="text-2xl font-bold tracking-tighter text-primary">
                AETHER<span className="text-muted-foreground font-light">STORE</span>
              </Link>
              <p className="text-muted-foreground max-w-sm">
                Redefining the digital shopping experience with curated products and seamless technology. Join the future of commerce.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link to="#" className="hover:text-primary transition-colors">Shop All</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/admin" className="hover:text-primary transition-colors">Admin Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Contact</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li>support@aetherstore.com</li>
                <li>1-800-AETHER-XT</li>
                <li>San Francisco, CA</li>
              </ul>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 Aether Store. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
