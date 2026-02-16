import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Package, Plus, LogOut, Search, Filter, DollarSign, Users, Pencil, Settings, Palette, Megaphone, MessageSquare, CheckCircle2, Truck, Clock, XCircle, Coins, ToggleLeft, ToggleRight, BarChart3, Globe, Share2, HelpCircle, Image as ImageIcon, Trash2, MapPin, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Product, Order, StorefrontConfig, User, ChatMessage, StorefrontSection } from "@shared/api";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, Eye, EyeOff, Layout, Type, Palette as PaletteIcon, Check, Layers } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Admin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ name: "", price: 0, category: "General", stock: 0, description: "", image: "" });
  
  const [config, setConfig] = useState<StorefrontConfig | null>(null);
  const [configForm, setConfigForm] = useState<StorefrontConfig | null>(null);
  const [activeEditorSection, setActiveEditorSection] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) { navigate("/login"); return; }
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [prodRes, ordRes, configRes, usersRes, chatRes] = await Promise.all([
        fetch("/api/products"), fetch("/api/orders"), fetch("/api/config"), fetch("/api/users"), fetch("/api/chat")
      ]);
      const prodData = await prodRes.json();
      const ordData = await ordRes.json();
      const configData = await configRes.json();
      const userData = await usersRes.json();
      const chatData = await chatRes.json();

      setProducts(prodData);
      setOrders(ordData);
      setConfig(configData);
      setConfigForm(configData);
      setMessages(chatData);
      setUsers(userData.filter((u: User) => u.role === 'customer'));
    } catch (error) {
      toast.error("Data retrieval failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      if (res.ok) {
        toast.success("Product added to inventory.");
        setIsAddDialogOpen(false);
        setNewProduct({ name: "", price: 0, category: "General", stock: 0, description: "", image: "" });
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to add product.");
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProduct),
      });
      if (res.ok) {
        toast.success("Product updated.");
        setIsEditDialogOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error("Update failed.");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to remove this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Product removed.");
        fetchData();
      }
    } catch (error) {
      toast.error("Deletion failed.");
    }
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configForm) return;
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configForm),
      });
      if (res.ok) {
        toast.success("Configuration updated.");
        setConfig(await res.json());
      }
    } catch (error) {
      toast.error("Update failed.");
    }
  };

  const chartData = orders.slice(-7).map(o => ({
    date: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    total: o.total
  }));

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      <aside className="w-64 bg-background border-r p-6 space-y-8 h-screen sticky top-0">
        <h1 className="text-xl font-black tracking-tighter flex items-center gap-2 italic uppercase">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-xs not-italic">A</div>
          Terminal
        </h1>
        <nav className="space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-3 bg-primary/5 text-primary font-bold uppercase text-[10px] tracking-widest">
            <LayoutDashboard className="h-4 w-4" /> Overview
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground uppercase text-[10px] tracking-widest" onClick={() => navigate("/")}>
            <Globe className="h-4 w-4" /> Storefront
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground uppercase text-[10px] tracking-widest" onClick={() => { localStorage.removeItem("admin-token"); navigate("/login"); }}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </nav>
      </aside>

      <main className="flex-1 p-10 space-y-8 overflow-y-auto">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase italic">Control Center</h2>
            <p className="text-muted-foreground font-medium">System status and configuration.</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-8 rounded-2xl font-black uppercase italic">
                <Plus className="h-4 w-4 mr-2" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">New Protocol</DialogTitle>
                <DialogDescription>Add a new product to the neural catalog.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase">Name</Label>
                    <Input value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required className="bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase">Price ($)</Label>
                    <Input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} required className="bg-muted/30" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase">Category</Label>
                    <Input value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase">Stock</Label>
                    <Input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} className="bg-muted/30" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Image</Label>
                  <ImageUpload value={newProduct.image} onChange={val => setNewProduct({...newProduct, image: val})} />
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl font-black uppercase italic">Initialize Product</Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-sm bg-background/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sales Velocity</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                  <Tooltip contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-primary text-primary-foreground">
              <CardContent className="p-6 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Total Revenue</p>
                <h3 className="text-4xl font-black italic">${orders.reduce((s, o) => s + o.total, 0).toLocaleString()}</h3>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-background/50 backdrop-blur">
              <CardContent className="p-6 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Orders</p>
                <h3 className="text-4xl font-black italic">{orders.filter(o => o.status === 'pending').length}</h3>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="bg-background border p-1 rounded-2xl h-14">
            <TabsTrigger value="products" className="rounded-xl px-8 font-black uppercase italic text-xs">Inventory</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-xl px-8 font-black uppercase italic text-xs">Orders</TabsTrigger>
            <TabsTrigger value="editor" className="rounded-xl px-8 font-black uppercase italic text-xs">Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <Card className="border-none shadow-sm bg-background/50 backdrop-blur">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Product</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Category</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Price</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Stock</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id} className="border-primary/5 hover:bg-primary/5 transition-colors">
                      <TableCell className="font-bold italic uppercase flex items-center gap-3">
                        <img src={p.image} className="w-10 h-10 rounded-lg object-cover border" />
                        {p.name}
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[9px] uppercase font-black">{p.category}</Badge></TableCell>
                      <TableCell className="font-black text-primary">${p.price}</TableCell>
                      <TableCell className="font-mono text-xs">{p.stock}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(p); setIsEditDialogOpen(true); }} className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(p.id)} className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card className="border-none shadow-sm bg-background/50 backdrop-blur">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Order ID</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Customer</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Total</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id} className="border-primary/5 hover:bg-primary/5 transition-colors">
                      <TableCell className="font-mono font-bold text-xs">{o.id}</TableCell>
                      <TableCell className="font-bold uppercase italic text-xs">{o.customerName}</TableCell>
                      <TableCell className="font-black text-primary">${o.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={o.status === 'delivered' ? 'default' : o.status === 'pending' ? 'outline' : 'secondary'} className="text-[9px] uppercase font-black">
                          {o.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-[10px] font-medium text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="editor" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                <Card className="border-none shadow-sm bg-background/50 backdrop-blur">
                  <CardHeader><CardTitle className="text-xs font-black uppercase tracking-widest">Page Layout</CardTitle></CardHeader>
                  <CardContent className="p-2 space-y-1">
                    {configForm?.sections.map((s, i) => (
                      <div key={s.id} className={cn("flex items-center gap-3 p-3 rounded-2xl transition-all", activeEditorSection === s.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50")}>
                        <div className="flex flex-col">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActiveEditorSection(s.id)}><Settings className="h-3 w-3" /></Button>
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] font-black uppercase opacity-50">{s.type}</p>
                          <p className="text-xs font-bold uppercase italic truncate">{s.title || "Untitled"}</p>
                        </div>
                        <Switch checked={s.visible} onCheckedChange={() => {
                          const sections = configForm.sections.map(sec => sec.id === s.id ? {...sec, visible: !sec.visible} : sec);
                          setConfigForm({...configForm, sections});
                        }} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-8 space-y-6">
                {activeEditorSection ? (
                  <Card className="border-none shadow-sm bg-background/50 backdrop-blur">
                    <CardHeader className="flex flex-row justify-between items-center">
                      <CardTitle className="text-xs font-black uppercase tracking-widest">Section Editor</CardTitle>
                      <Badge variant="outline" className="uppercase italic">{configForm?.sections.find(s => s.id === activeEditorSection)?.type}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {(() => {
                        const s = configForm?.sections.find(sec => sec.id === activeEditorSection);
                        if (!s) return null;
                        return (
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase">Title</Label>
                              <Input value={s.title || ""} onChange={e => {
                                const sections = configForm.sections.map(sec => sec.id === s.id ? {...sec, title: e.target.value} : sec);
                                setConfigForm({...configForm, sections});
                              }} className="h-12 bg-muted/30 font-bold uppercase italic" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase">Subtitle</Label>
                              <Textarea value={s.subtitle || ""} onChange={e => {
                                const sections = configForm.sections.map(sec => sec.id === s.id ? {...sec, subtitle: e.target.value} : sec);
                                setConfigForm({...configForm, sections});
                              }} className="bg-muted/30 min-h-[100px]" />
                            </div>
                            {s.type === 'hero' && (
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase">Image</Label>
                                <ImageUpload value={s.image || ""} onChange={val => {
                                  const sections = configForm.sections.map(sec => sec.id === s.id ? {...sec, image: val} : sec);
                                  setConfigForm({...configForm, sections});
                                }} />
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-[3rem] opacity-50">
                    <Layout className="h-12 w-12 mb-4" />
                    <p className="font-black uppercase italic tracking-tighter">Select a section to edit</p>
                  </div>
                )}

                {/* Shipping & Taxes Settings */}
                <Card className="border-none shadow-sm bg-background/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <Truck className="h-4 w-4" /> Shipping & Taxes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase">Free Shipping Threshold ($)</Label>
                        <Input
                          type="number"
                          value={configForm?.shippingSettings.freeShippingThreshold}
                          onChange={e => setConfigForm(prev => prev ? {
                            ...prev, 
                            shippingSettings: { ...prev.shippingSettings, freeShippingThreshold: Number(e.target.value) }
                          } : null)}
                          className="h-12 bg-muted/30 font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase">Flat Shipping Rate ($)</Label>
                        <Input
                          type="number"
                          value={configForm?.shippingSettings.flatRate}
                          onChange={e => setConfigForm(prev => prev ? {
                            ...prev, 
                            shippingSettings: { ...prev.shippingSettings, flatRate: Number(e.target.value) }
                          } : null)}
                          className="h-12 bg-muted/30 font-bold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase">Tax Rate (%)</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            value={configForm?.shippingSettings.taxRate}
                            onChange={e => setConfigForm(prev => prev ? {
                              ...prev, 
                              shippingSettings: { ...prev.shippingSettings, taxRate: Number(e.target.value) }
                            } : null)}
                            className="h-12 bg-muted/30 font-bold pr-10"
                          />
                          <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase">Pickup Location</Label>
                        <Input
                          value={configForm?.shippingSettings.pickupLocation}
                          onChange={e => setConfigForm(prev => prev ? {
                            ...prev, 
                            shippingSettings: { ...prev.shippingSettings, pickupLocation: e.target.value }
                          } : null)}
                          className="h-12 bg-muted/30 font-bold"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-primary/5">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-black uppercase italic">Allow Pay on Arrival</Label>
                        <p className="text-[10px] text-muted-foreground">Enable cash/card payment at pickup.</p>
                      </div>
                      <Switch 
                        checked={configForm?.shippingSettings.allowPayOnArrival} 
                        onCheckedChange={(val) => setConfigForm(prev => prev ? {
                          ...prev, 
                          shippingSettings: { ...prev.shippingSettings, allowPayOnArrival: val }
                        } : null)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Loyalty Program Settings */}
                <Card className="border-none shadow-sm bg-background/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <Coins className="h-4 w-4" /> Loyalty Program
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-primary/5">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-black uppercase italic">Enable Loyalty Points</Label>
                        <p className="text-[10px] text-muted-foreground">Allow customers to earn and redeem points.</p>
                      </div>
                      <Switch 
                        checked={configForm?.loyaltySettings.enabled} 
                        onCheckedChange={(val) => setConfigForm(prev => prev ? {
                          ...prev, 
                          loyaltySettings: { ...prev.loyaltySettings, enabled: val }
                        } : null)}
                      />
                    </div>

                    {configForm?.loyaltySettings.enabled && (
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase">Points per $1 Spent</Label>
                          <Input
                            type="number"
                            value={configForm?.loyaltySettings.pointsPerDollar}
                            onChange={e => setConfigForm(prev => prev ? {
                              ...prev, 
                              loyaltySettings: { ...prev.loyaltySettings, pointsPerDollar: Number(e.target.value) }
                            } : null)}
                            className="h-12 bg-muted/30 font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase">Points for $1 Discount</Label>
                          <Input
                            type="number"
                            value={configForm?.loyaltySettings.pointsToDollarRate}
                            onChange={e => setConfigForm(prev => prev ? {
                              ...prev, 
                              loyaltySettings: { ...prev.loyaltySettings, pointsToDollarRate: Number(e.target.value) }
                            } : null)}
                            className="h-12 bg-muted/30 font-bold"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-background/50 backdrop-blur">
                  <CardHeader><CardTitle className="text-xs font-black uppercase tracking-widest">Global Identity</CardTitle></CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateConfig} className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase">Brand Name</Label>
                          <Input value={configForm?.brandName} onChange={e => setConfigForm({...configForm!, brandName: e.target.value})} className="h-12 bg-muted/30 font-black italic uppercase" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase">E-Transfer Email</Label>
                          <Input value={configForm?.etransferEmail} onChange={e => setConfigForm({...configForm!, etransferEmail: e.target.value})} className="h-12 bg-muted/30 font-bold" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase">Social Links</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <Input placeholder="Instagram" value={configForm?.socialLinks.instagram} onChange={e => setConfigForm({...configForm!, socialLinks: {...configForm!.socialLinks, instagram: e.target.value}})} className="bg-muted/30" />
                          <Input placeholder="Twitter" value={configForm?.socialLinks.twitter} onChange={e => setConfigForm({...configForm!, socialLinks: {...configForm!.socialLinks, twitter: e.target.value}})} className="bg-muted/30" />
                        </div>
                      </div>
                      <Button type="submit" className="w-full h-16 rounded-[2rem] font-black uppercase italic text-lg shadow-2xl shadow-primary/20">Save System Changes</Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Edit Protocol</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <form onSubmit={handleUpdateProduct} className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Name</Label>
                  <Input value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} required className="bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Price ($)</Label>
                  <Input type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} required className="bg-muted/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Category</Label>
                  <Input value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Stock</Label>
                  <Input type="number" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} className="bg-muted/30" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Image</Label>
                <ImageUpload value={editingProduct.image} onChange={val => setEditingProduct({...editingProduct, image: val})} />
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl font-black uppercase italic">Update Product</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}