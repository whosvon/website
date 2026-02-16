import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, User, Menu, X, ArrowRight, Star, LogOut, Trash2, Mail, Info, Coins, Search, Instagram, Twitter, Facebook, Github, ChevronDown, Truck, MapPin, CreditCard, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Product, StorefrontConfig, User as UserType, OrderItem, StorefrontSection } from "@shared/api";
import { toast } from "sonner";
import ChatWidget from "@/components/ChatWidget";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<StorefrontConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Product[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'logistics' | 'payment'>('cart');
  const [searchQuery, setSearchQuery] = useState("");
  
  // Checkout State
  const [shippingMethod, setShippingMethod] = useState<'pickup' | 'delivery'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'etransfer' | 'on_arrival'>('etransfer');
  const [customerDetails, setCustomerDetails] = useState({ name: "", phone: "", address: "" });
  const [pointsToUse, setPointsToUse] = useState(0);
  
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  useEffect(() => {
    fetchData();
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setCustomerDetails(prev => ({ ...prev, name: user.name || "", phone: user.phone || "" }));
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

      if (configData.accentColor) document.documentElement.style.setProperty('--primary', configData.accentColor);
      if (configData.backgroundColor) document.documentElement.style.setProperty('--background', configData.backgroundColor);
      if (configData.textColor) document.documentElement.style.setProperty('--foreground', configData.textColor);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const addToCart = (product: Product) => {
    setCart(prev => [...prev, product]);
    toast.success(`${product.name} added to registry!`);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, p) => sum + p.price, 0);
  const discountAmount = config?.loyaltySettings.enabled ? (pointsToUse / config.loyaltySettings.pointsToDollarRate) : 0;
  const subtotalAfterDiscount = Math.max(0, cartSubtotal - discountAmount);
  
  const shippingFee = shippingMethod === 'delivery' 
    ? (subtotalAfterDiscount >= (config?.shippingSettings.freeShippingThreshold || 150) ? 0 : (config?.shippingSettings.flatRate || 17.99))
    : 0;
    
  const taxRate = (config?.shippingSettings.taxRate || 0) / 100;
  const taxAmount = subtotalAfterDiscount * taxRate;
  const finalTotal = subtotalAfterDiscount + shippingFee + taxAmount;

  const finalizeOrder = async () => {
    if (shippingMethod === 'delivery' && (!customerDetails.address || !customerDetails.phone)) {
      toast.error("Please provide delivery details.");
      return;
    }
    
    setIsCheckingOut(true);
    const items: OrderItem[] = cart.map(p => ({ productId: p.id, name: p.name, price: p.price, quantity: 1 }));
    const orderData = { 
      userId: currentUser?.id, 
      customerName: customerDetails.name || currentUser?.name || currentUser?.email, 
      customerEmail: currentUser?.email,
      customerPhone: customerDetails.phone,
      shippingAddress: shippingMethod === 'delivery' ? customerDetails.address : 'PICKUP',
      items, 
      subtotal: cartSubtotal,
      shippingFee,
      taxAmount,
      total: finalTotal, 
      pointsUsed: pointsToUse,
      shippingMethod,
      paymentMethod
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success("Order secured!");
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          setCurrentUser(data.user);
        }
        setCart([]);
        setPointsToUse(0);
        setIsCartOpen(false);
        setCheckoutStep('cart');
        navigate("/account");
      }
    } catch (error) {
      toast.error("Order transmission failed.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatePresence>
        {config?.announcementText && (
          <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="bg-primary text-primary-foreground py-2 px-4 text-center text-[10px] font-black uppercase tracking-[0.3em] z-[60] relative">
            {config.announcementText}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-black tracking-tighter text-primary italic uppercase flex items-center gap-2">
            <motion.div whileHover={{ rotate: 180 }} className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-xs not-italic">A</motion.div>
            {config?.brandName || "AETHER"}
          </Link>
          
          <div className="hidden md:flex items-center gap-10">
            {['Home', 'Shop', 'About'].map((item) => (
              <button key={item} onClick={() => item === 'Home' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : scrollToSection(item.toLowerCase())} className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="SEARCH PROTOCOLS..." 
                className="h-9 w-48 bg-muted/30 border-none text-[10px] font-bold pl-9 rounded-full focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {config?.loyaltySettings.enabled && currentUser && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10">
                <Coins className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-black text-primary italic">{currentUser.loyaltyPoints} PTS</span>
              </div>
            )}

            <Dialog open={isCartOpen} onOpenChange={(open) => { setIsCartOpen(open); if(!open) setCheckoutStep('cart'); }}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/5 rounded-full h-11 w-11">
                  <ShoppingCart className="h-5 w-5" />
                  {cart.length > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground font-black">
                      {cart.length}
                    </motion.span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px] bg-background border-primary/20 rounded-[2rem] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
                    {checkoutStep === 'cart' ? 'Registry' : checkoutStep === 'logistics' ? 'Logistics' : 'Payment'}
                  </DialogTitle>
                </DialogHeader>
                
                {checkoutStep === 'cart' && (
                  <div className="space-y-6">
                    <div className="max-h-[30vh] overflow-y-auto space-y-3 pr-2">
                      {cart.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground text-xs font-bold uppercase italic">Registry is empty</div>
                      ) : cart.map((item, idx) => (
                        <motion.div layout key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-2xl border border-primary/5">
                          <div className="flex items-center gap-3">
                            <img src={item.image} className="w-12 h-12 rounded-xl object-cover border" />
                            <div>
                              <div className="font-bold text-xs uppercase italic">{item.name}</div>
                              <div className="text-xs text-primary font-black">${item.price}</div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeFromCart(idx)} className="hover:text-destructive rounded-full"><Trash2 className="h-4 w-4" /></Button>
                        </motion.div>
                      ))}
                    </div>

                    {config?.loyaltySettings.enabled && currentUser && currentUser.loyaltyPoints > 0 && cart.length > 0 && (
                      <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-primary">
                            <Coins className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase italic">Redeem Points</span>
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground">{currentUser.loyaltyPoints} Available</span>
                        </div>
                        <Slider 
                          value={[pointsToUse]} 
                          max={Math.min(currentUser.loyaltyPoints, cartSubtotal * config.loyaltySettings.pointsToDollarRate)} 
                          step={config.loyaltySettings.pointsToDollarRate}
                          onValueChange={(val) => setPointsToUse(val[0])}
                        />
                        <p className="text-[9px] text-center font-bold text-muted-foreground uppercase">Using {pointsToUse} points for ${discountAmount.toFixed(2)} off</p>
                      </div>
                    )}

                    <div className="border-t pt-4 space-y-4">
                      <div className="flex justify-between font-black uppercase italic text-xs">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${cartSubtotal.toFixed(2)}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between font-black uppercase italic text-xs text-primary">
                          <span>Discount</span>
                          <span>-${discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <Button disabled={cart.length === 0} onClick={() => setCheckoutStep('logistics')} className="w-full h-14 font-black uppercase italic rounded-2xl">Continue to Logistics</Button>
                    </div>
                  </div>
                )}

                {checkoutStep === 'logistics' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Select Method</Label>
                      <RadioGroup value={shippingMethod} onValueChange={(val: any) => setShippingMethod(val)} className="grid grid-cols-2 gap-4">
                        <div className={cn("relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer", shippingMethod === 'delivery' ? "border-primary bg-primary/5" : "border-muted hover:border-primary/20")}>
                          <RadioGroupItem value="delivery" id="delivery" className="sr-only" />
                          <Label htmlFor="delivery" className="cursor-pointer flex flex-col items-center gap-2">
                            <Truck className={cn("h-6 w-6", shippingMethod === 'delivery' ? "text-primary" : "text-muted-foreground")} />
                            <span className="text-[10px] font-black uppercase italic">Delivery</span>
                          </Label>
                        </div>
                        <div className={cn("relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer", shippingMethod === 'pickup' ? "border-primary bg-primary/5" : "border-muted hover:border-primary/20")}>
                          <RadioGroupItem value="pickup" id="pickup" className="sr-only" />
                          <Label htmlFor="pickup" className="cursor-pointer flex flex-col items-center gap-2">
                            <MapPin className={cn("h-6 w-6", shippingMethod === 'pickup' ? "text-primary" : "text-muted-foreground")} />
                            <span className="text-[10px] font-black uppercase italic">Pickup</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {shippingMethod === 'delivery' ? (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase">Full Name</Label>
                          <Input value={customerDetails.name} onChange={e => setCustomerDetails({...customerDetails, name: e.target.value})} placeholder="John Doe" className="h-12 bg-muted/30 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase">Phone Number</Label>
                          <Input value={customerDetails.phone} onChange={e => setCustomerDetails({...customerDetails, phone: e.target.value})} placeholder="+1 (555) 000-0000" className="h-12 bg-muted/30 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase">Shipping Address</Label>
                          <Textarea value={customerDetails.address} onChange={e => setCustomerDetails({...customerDetails, address: e.target.value})} placeholder="Street, City, Province, Postal Code" className="bg-muted/30 rounded-xl min-h-[80px]" />
                        </div>
                        <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-3">
                          <Info className="h-4 w-4 text-primary" />
                          <p className="text-[9px] font-bold uppercase italic text-primary">
                            {shippingFee === 0 ? "FREE SHIPPING APPLIED" : `FLAT RATE SHIPPING: $${shippingFee}`}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="p-4 bg-muted/30 rounded-2xl border border-primary/5 space-y-2">
                          <Label className="text-[10px] font-black uppercase opacity-50">Pickup Location</Label>
                          <p className="text-xs font-bold uppercase italic">{config?.shippingSettings.pickupLocation}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase">Payment Timing</Label>
                          <RadioGroup value={paymentMethod} onValueChange={(val: any) => setPaymentMethod(val)} className="space-y-2">
                            <div className={cn("flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer", paymentMethod === 'etransfer' ? "border-primary bg-primary/5" : "border-muted")}>
                              <Label htmlFor="pay-now" className="flex items-center gap-3 cursor-pointer">
                                <CreditCard className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase italic">Pay Now (E-Transfer)</span>
                              </Label>
                              <RadioGroupItem value="etransfer" id="pay-now" />
                            </div>
                            {config?.shippingSettings.allowPayOnArrival && (
                              <div className={cn("flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer", paymentMethod === 'on_arrival' ? "border-primary bg-primary/5" : "border-muted")}>
                                <Label htmlFor="pay-arrival" className="flex items-center gap-3 cursor-pointer">
                                  <Coins className="h-4 w-4" />
                                  <span className="text-[10px] font-black uppercase italic">Pay on Arrival</span>
                                </Label>
                                <RadioGroupItem value="on_arrival" id="pay-arrival" />
                              </div>
                            )}
                          </RadioGroup>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setCheckoutStep('cart')} className="h-14 flex-1 rounded-2xl font-black uppercase italic">Back</Button>
                      <Button onClick={() => setCheckoutStep('payment')} className="h-14 flex-[2] rounded-2xl font-black uppercase italic">Review & Pay</Button>
                    </div>
                  </div>
                )}

                {checkoutStep === 'payment' && (
                  <div className="space-y-6">
                    <div className="bg-muted/30 p-6 rounded-[2rem] border border-primary/5 space-y-4">
                      <div className="space-y-2 border-b pb-4">
                        <div className="flex justify-between text-[10px] font-black uppercase italic text-muted-foreground">
                          <span>Subtotal</span>
                          <span>${subtotalAfterDiscount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase italic text-muted-foreground">
                          <span>Shipping</span>
                          <span>{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase italic text-muted-foreground">
                          <span>Tax ({config?.shippingSettings.taxRate}%)</span>
                          <span>${taxAmount.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between font-black uppercase italic">
                        <span className="text-sm">Total</span>
                        <span className="text-2xl text-primary">${finalTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {paymentMethod === 'etransfer' ? (
                      <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 space-y-4 animate-in zoom-in-95">
                        <p className="text-[10px] font-black uppercase italic text-center text-primary">E-Transfer Protocol</p>
                        <p className="font-mono font-bold text-primary text-center bg-background p-3 rounded-xl border border-dashed border-primary/20">{config?.etransferEmail}</p>
                        <p className="text-[9px] text-center text-muted-foreground uppercase font-medium">Please include your name in the transfer notes.</p>
                      </div>
                    ) : (
                      <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 space-y-2 text-center animate-in zoom-in-95">
                        <p className="text-[10px] font-black uppercase italic text-primary">Pay on Arrival</p>
                        <p className="text-[9px] text-muted-foreground uppercase font-medium">Please have payment ready at the pickup location.</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setCheckoutStep('logistics')} className="h-14 flex-1 rounded-2xl font-black uppercase italic">Back</Button>
                      <Button onClick={finalizeOrder} disabled={isCheckingOut} className="h-14 flex-[2] rounded-2xl font-black uppercase italic">Confirm Order</Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {currentUser ? (
              <Link to="/account">
                <Button variant="ghost" className="font-black uppercase tracking-tighter text-[10px] gap-2 hover:bg-primary/5 rounded-full px-4">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-3 w-3" />
                  </div>
                  {currentUser.name?.split(' ')[0]}
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="icon" className="hover:bg-primary/5 rounded-full h-11 w-11"><User className="h-5 w-5" /></Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main>
        {config?.sections.filter(s => s.visible).map((section) => (
          <SectionRenderer key={section.id} section={section} products={filteredProducts} addToCart={addToCart} scrollToSection={scrollToSection} />
        ))}
      </main>

      <footer className="bg-muted/20 border-t py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <h3 className="text-2xl font-black tracking-tighter text-primary italic uppercase">{config?.brandName}</h3>
              <p className="text-muted-foreground max-w-sm text-sm font-medium leading-relaxed">{config?.brandTagline}</p>
              <div className="flex gap-4">
                {config?.socialLinks.instagram && <a href={config.socialLinks.instagram} className="p-3 bg-background rounded-2xl border hover:text-primary transition-all"><Instagram className="h-5 w-5" /></a>}
                {config?.socialLinks.twitter && <a href={config.socialLinks.twitter} className="p-3 bg-background rounded-2xl border hover:text-primary transition-all"><Twitter className="h-5 w-5" /></a>}
                {config?.socialLinks.discord && <a href={config.socialLinks.discord} className="p-3 bg-background rounded-2xl border hover:text-primary transition-all"><Github className="h-5 w-5" /></a>}
              </div>
            </div>
            <div>
              <h4 className="font-black uppercase italic mb-6 tracking-tighter text-xs">Navigation</h4>
              <ul className="space-y-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-primary">Home</button></li>
                <li><button onClick={() => scrollToSection('products')} className="hover:text-primary">Catalog</button></li>
                <li><Link to="/admin" className="hover:text-primary">Terminal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase italic mb-6 tracking-tighter text-xs">Support</h4>
              <ul className="space-y-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <li>contact@aether.store</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
}

function SectionRenderer({ section, products, addToCart, scrollToSection }: any) {
  const containerVariants = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } };

  switch (section.type) {
    case 'hero':
      return (
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="relative py-24 lg:py-40 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">System Online</Badge>
                <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.85] uppercase italic">{section.title}</h1>
                <p className="text-lg text-muted-foreground max-w-lg font-medium">{section.subtitle}</p>
                <div className="flex gap-4 pt-4">
                  <Button onClick={() => scrollToSection('products')} size="lg" className="h-16 px-10 text-lg font-black uppercase italic rounded-2xl shadow-2xl shadow-primary/20">Shop Now</Button>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.02, rotate: -1 }} className="relative aspect-square rounded-[3rem] overflow-hidden border-8 border-background shadow-2xl">
                <img src={section.image} className="w-full h-full object-cover" />
              </motion.div>
            </div>
          </div>
        </motion.section>
      );
    case 'products':
      return (
        <section id="products" className="py-24 bg-muted/10">
          <div className="container mx-auto px-4">
            <div className="mb-16 space-y-2">
              <h2 className="text-4xl font-black tracking-tighter uppercase italic">{section.title}</h2>
              <p className="text-muted-foreground font-medium">{section.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((p: any) => (
                <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={p.id} className="group bg-background rounded-[2.5rem] border border-primary/5 overflow-hidden hover:shadow-2xl transition-all duration-500">
                  <div className="aspect-[4/5] overflow-hidden bg-muted">
                    <img src={p.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="p-8 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{p.category}</span>
                      <span className="text-xl font-black text-primary italic">${p.price}</span>
                    </div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">{p.name}</h3>
                    <Button onClick={() => addToCart(p)} className="w-full h-14 rounded-2xl font-black uppercase italic" variant="outline">Add to Registry</Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      );
    case 'faq':
      return (
        <section id="faq" className="py-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-16 space-y-2">
              <h2 className="text-4xl font-black tracking-tighter uppercase italic">{section.title}</h2>
              <p className="text-muted-foreground font-medium">{section.subtitle}</p>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              {section.items?.map((item: any, i: number) => (
                <AccordionItem key={i} value={`item-${i}`} className="border rounded-3xl px-6 bg-muted/20">
                  <AccordionTrigger className="text-sm font-black uppercase italic hover:no-underline">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground font-medium leading-relaxed">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      );
    case 'newsletter':
      return (
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="bg-primary rounded-[3rem] p-12 lg:p-24 text-primary-foreground text-center space-y-8 relative overflow-hidden">
              <h2 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase italic z-10 relative">{section.title}</h2>
              <p className="text-xl opacity-80 italic z-10 relative">{section.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto z-10 relative">
                <Input placeholder="EMAIL@SYSTEM.COM" className="h-16 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50 px-8" />
                <Button className="h-16 px-10 rounded-2xl bg-white text-primary font-black uppercase italic hover:bg-white/90">Join</Button>
              </div>
              <Mail className="absolute -bottom-20 -right-20 h-80 w-80 opacity-10 rotate-12" />
            </div>
          </div>
        </section>
      );
    default: return null;
  }
}