import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Plus,
  LogOut,
  Search,
  Filter,
  DollarSign,
  Users,
  Pencil,
  Settings,
  Palette,
  Megaphone,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Product, Order, StorefrontConfig, User, ChatMessage, StorefrontSection } from "@shared/api";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, Eye, EyeOff, Layout, Type, Palette as PaletteIcon, Check, Layers } from "lucide-react";

export default function Admin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Chat state
  const [activeChatUser, setActiveChatUser] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");

  // Storefront Config state
  const [config, setConfig] = useState<StorefrontConfig | null>(null);
  const [configForm, setConfigForm] = useState<StorefrontConfig | null>(null);
  const [activeEditorSection, setActiveEditorSection] = useState<string | null>(null);

  const navigate = useNavigate();

  const themePresets = [
    { name: "Cyber Purple", accent: "262 83% 58%", bg: "240 10% 3.9%", text: "0 0% 98%" },
    { name: "Minimal White", accent: "240 5.9% 10%", bg: "0 0% 100%", text: "240 10% 3.9%" },
    { name: "Deep Ocean", accent: "221.2 83.2% 53.3%", bg: "222.2 84% 4.9%", text: "210 40% 98%" },
    { name: "Forest Dark", accent: "142.1 76.2% 36.3%", bg: "240 10% 3.9%", text: "0 0% 98%" },
    { name: "Solar Orange", accent: "24.6 95% 53.1%", bg: "240 10% 3.9%", text: "0 0% 98%" },
  ];

  const applyPreset = (preset: any) => {
    if (!configForm) return;
    setConfigForm({
      ...configForm,
      accentColor: preset.accent,
      backgroundColor: preset.bg,
      textColor: preset.text
    });
    toast.success(`${preset.name} preset applied.`);
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    if (!configForm) return;
    const sections = [...configForm.sections];
    const index = sections.findIndex(s => s.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const [moved] = sections.splice(index, 1);
    sections.splice(newIndex, 0, moved);

    setConfigForm({ ...configForm, sections });
  };

  const toggleSectionVisibility = (id: string) => {
    if (!configForm) return;
    const sections = configForm.sections.map(s =>
      s.id === id ? { ...s, visible: !s.visible } : s
    );
    setConfigForm({ ...configForm, sections });
  };

  const updateSectionData = (id: string, data: Partial<StorefrontSection>) => {
    if (!configForm) return;
    const sections = configForm.sections.map(s =>
      s.id === id ? { ...s, ...data } : s
    );
    setConfigForm({ ...configForm, sections });
  };

  // Form state for products
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    image: "",
    stock: "0"
  });

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [prodRes, ordRes, configRes, usersRes, chatRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders"),
        fetch("/api/config"),
        fetch("/api/users"),
        fetch("/api/chat")
      ]);

      if (!prodRes.ok || !ordRes.ok || !configRes.ok || !usersRes.ok || !chatRes.ok)
        throw new Error("Fetch failed");

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
      toast.error("Security Clearance Required. Data retrieval failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeChatUser) {
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [activeChatUser]);

  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatUser) return;

    const newMessage = {
      senderId: "admin-master",
      senderName: "Admin Support",
      senderRole: 'admin',
      text: `@${activeChatUser} ${chatInput}`
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });

      if (res.ok) {
        setChatInput("");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    navigate("/login");
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productForm),
      });
      if (res.ok) {
        toast.success("Product initialized successfully.");
        setIsAddDialogOpen(false);
        setProductForm({ name: "", price: "", description: "", category: "", image: "", stock: "0" });
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to add product");
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      category: product.category,
      image: product.image,
      stock: product.stock.toString()
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productForm),
      });
      if (res.ok) {
        toast.success("Product records updated.");
        setIsEditDialogOpen(false);
        setEditingProduct(null);
        setProductForm({ name: "", price: "", description: "", category: "", image: "", stock: "0" });
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to update product");
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
        toast.success("Storefront configuration updated.");
        const updatedConfig = await res.json();
        setConfig(updatedConfig);
      }
    } catch (error) {
      toast.error("Failed to update storefront configuration");
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered": return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Delivered</Badge>;
      case "shipped": return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Shipped</Badge>;
      case "pending": return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <h2 className="text-xl font-bold uppercase italic tracking-tighter">Initializing System...</h2>
        <p className="text-muted-foreground mt-2 text-sm opacity-50">Syncing encrypted data channels.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row text-foreground">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-background border-r p-6 space-y-8 md:h-screen md:sticky md:top-0">
        <div>
          <h1 className="text-xl font-bold tracking-tighter flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            ADMIN PANEL
          </h1>
        </div>
        <nav className="space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-3 bg-primary/5 text-primary font-semibold">
            <LayoutDashboard className="h-4 w-4" /> Overview
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={() => navigate("/")}>
            <ShoppingBag className="h-4 w-4" /> Store Front
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">Control Center</h2>
            <p className="text-muted-foreground">Monitor system operations and inventory.</p>
          </div>
          
          <div className="flex gap-4">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 h-11 px-6 rounded-xl font-bold uppercase tracking-tighter">
                  <Plus className="h-4 w-4" /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-background border-primary/20">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase italic">Add New Product</DialogTitle>
                  <DialogDescription>Input product specifications for the neural catalog.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddProduct} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input id="name" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required className="bg-muted/30" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input id="price" type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required className="bg-muted/30" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock</Label>
                      <Input id="stock" type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} required className="bg-muted/30" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="category">Category</Label>
                      <Input id="category" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="bg-muted/30" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Product Image</Label>
                      <ImageUpload
                        value={productForm.image}
                        onChange={(val) => setProductForm({...productForm, image: val})}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="desc">Description</Label>
                      <Textarea id="desc" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="bg-muted/30" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full h-12 font-bold uppercase italic">Initialize Product</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-sm bg-background/50 backdrop-blur border border-primary/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-2xl">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Revenue</p>
                <h3 className="text-2xl font-black">${totalRevenue.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-background/50 backdrop-blur border border-primary/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-emerald-500/10 p-3 rounded-2xl">
                <ShoppingBag className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Orders</p>
                <h3 className="text-2xl font-black">{orders.length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-background/50 backdrop-blur border border-primary/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-blue-500/10 p-3 rounded-2xl">
                <Package className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Products</p>
                <h3 className="text-2xl font-black">{products.length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-background/50 backdrop-blur border border-primary/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-amber-500/10 p-3 rounded-2xl">
                <Users className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Customers</p>
                <h3 className="text-2xl font-black">{users.length}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-background border p-1 rounded-xl h-12">
            <TabsTrigger value="products" className="rounded-lg px-6 font-bold uppercase tracking-tighter data-[state=active]:bg-primary/5 data-[state=active]:text-primary">Products</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg px-6 font-bold uppercase tracking-tighter data-[state=active]:bg-primary/5 data-[state=active]:text-primary">Orders</TabsTrigger>
            <TabsTrigger value="chat" className="rounded-lg px-6 font-bold uppercase tracking-tighter data-[state=active]:bg-primary/5 data-[state=active]:text-primary">Live Chat</TabsTrigger>
            <TabsTrigger value="editor" className="rounded-lg px-6 font-bold uppercase tracking-tighter data-[state=active]:bg-primary/5 data-[state=active]:text-primary">Store Editor</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="border border-primary/5 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div>
                  <CardTitle className="uppercase italic font-black">Inventory</CardTitle>
                  <CardDescription>Records of all items in stock.</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search records..." className="pl-9 h-9 bg-muted/20" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="pl-6 uppercase text-[10px] font-bold tracking-widest">Item</TableHead>
                      <TableHead className="uppercase text-[10px] font-bold tracking-widest">Price</TableHead>
                      <TableHead className="uppercase text-[10px] font-bold tracking-widest">Stock</TableHead>
                      <TableHead className="text-right pr-6 uppercase text-[10px] font-bold tracking-widest">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground opacity-50">
                          No product records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product.id} className="hover:bg-muted/20">
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden border">
                                <img src={product.image} alt="" className="h-full w-full object-cover" />
                              </div>
                              <div className="font-bold">{product.name}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-black text-lg">${product.price}</TableCell>
                          <TableCell>
                            <Badge variant={product.stock < 5 ? "destructive" : "secondary"} className="uppercase text-[10px]">
                              {product.stock} Units
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="border border-primary/5 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div>
                  <CardTitle className="uppercase italic font-black">Recent Orders</CardTitle>
                  <CardDescription>Customer transaction history.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0 text-center py-12 text-muted-foreground opacity-50">
                {orders.length === 0 ? "No order data recorded." : "Order history functionality active."}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Card className="border border-primary/5 shadow-sm h-[600px] flex overflow-hidden">
              {/* Chat Sidebar */}
              <div className="w-64 border-r bg-muted/10 flex flex-col">
                <div className="p-4 border-b font-bold uppercase text-xs tracking-widest bg-background/50">Active Conversations</div>
                <div className="flex-1 overflow-y-auto">
                  {users.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground opacity-50">No active chats</div>
                  ) : (
                    users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => setActiveChatUser(u.id)}
                        className={cn(
                          "w-full p-4 text-left hover:bg-primary/5 transition-colors border-b",
                          activeChatUser === u.id && "bg-primary/5 border-l-4 border-l-primary"
                        )}
                      >
                        <div className="font-bold text-sm">{u.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate font-mono">{u.id}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Window */}
              <div className="flex-1 flex flex-col bg-background">
                {activeChatUser ? (
                  <>
                    <div className="p-4 border-b flex items-center justify-between bg-background/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-bold text-sm">{users.find(u => u.id === activeChatUser)?.name}</div>
                          <div className="text-[10px] text-green-500 font-bold uppercase">Connected</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {messages.filter(m => m.senderId === activeChatUser || m.text.includes(`@${activeChatUser}`)).map((msg) => (
                        <div key={msg.id} className={cn(
                          "flex flex-col max-w-[70%]",
                          msg.senderRole === 'admin' ? "items-end ml-auto" : "items-start"
                        )}>
                          <div className={cn(
                            "px-4 py-3 rounded-2xl text-sm",
                            msg.senderRole === 'admin'
                              ? "bg-primary text-primary-foreground rounded-tr-none"
                              : "bg-muted text-foreground rounded-tl-none"
                          )}>
                            {msg.senderRole === 'admin' ? msg.text.replace(`@${activeChatUser}`, '').trim() : msg.text}
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-1 px-1">
                            {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleSendAdminMessage} className="p-4 border-t bg-muted/10 flex gap-2">
                      <Input
                        placeholder="Type reply..."
                        className="bg-background border-none h-11 rounded-xl"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                      />
                      <Button type="submit" className="h-11 px-6 rounded-xl font-bold uppercase tracking-tighter">Send Reply</Button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-4 opacity-50">
                    <MessageSquare className="h-12 w-12" />
                    <p className="font-bold uppercase tracking-widest text-sm">Select a conversation to begin</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="editor">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Layout & Themes */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="border border-primary/5 shadow-sm">
                  <CardHeader>
                    <CardTitle className="uppercase italic font-black flex items-center gap-2">
                      <PaletteIcon className="h-5 w-5" /> Theme Presets
                    </CardTitle>
                    <CardDescription>Quickly change the store's vibe.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-2">
                      {themePresets.map((preset) => (
                        <Button
                          key={preset.name}
                          variant="outline"
                          className={cn(
                            "justify-start gap-3 h-12 rounded-xl border-primary/5",
                            configForm?.accentColor === preset.accent && "border-primary bg-primary/5"
                          )}
                          onClick={() => applyPreset(preset)}
                        >
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${preset.accent})` }} />
                          <span className="font-bold text-xs uppercase italic">{preset.name}</span>
                          {configForm?.accentColor === preset.accent && <Check className="h-4 w-4 ml-auto text-primary" />}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-primary/5 shadow-sm">
                  <CardHeader>
                    <CardTitle className="uppercase italic font-black flex items-center gap-2">
                      <Layers className="h-5 w-5" /> Page Layout
                    </CardTitle>
                    <CardDescription>Reorder home page sections.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">
                    <div className="space-y-1">
                      {configForm?.sections.map((section, idx) => (
                        <div
                          key={section.id}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-xl transition-all",
                            activeEditorSection === section.id ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"
                          )}
                        >
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-md hover:bg-primary/10"
                              disabled={idx === 0}
                              onClick={() => moveSection(section.id, 'up')}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-md hover:bg-primary/10"
                              disabled={idx === (configForm?.sections.length || 0) - 1}
                              onClick={() => moveSection(section.id, 'down')}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </div>

                          <button
                            className="flex-1 text-left px-2"
                            onClick={() => setActiveEditorSection(section.id)}
                          >
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{section.type}</div>
                            <div className="font-bold text-sm truncate italic uppercase tracking-tighter">{section.title || "Untitled Section"}</div>
                          </button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8 rounded-full", !section.visible && "text-muted-foreground")}
                            onClick={() => toggleSectionVisibility(section.id)}
                          >
                            {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Section Editor */}
              <div className="lg:col-span-8 space-y-6">
                {activeEditorSection ? (
                  <Card className="border border-primary/5 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="uppercase italic font-black flex items-center gap-2">
                          <Settings className="h-5 w-5" /> Section Configuration
                        </CardTitle>
                        <CardDescription>Modify properties for the selected block.</CardDescription>
                      </div>
                      <Badge variant="outline" className="uppercase italic">{configForm?.sections.find(s => s.id === activeEditorSection)?.type}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {(() => {
                        const s = configForm?.sections.find(sec => sec.id === activeEditorSection);
                        if (!s) return null;
                        return (
                          <div className="space-y-6">
                            {(s.type === 'hero' || s.type === 'products' || s.type === 'about' || s.type === 'newsletter' || s.type === 'banner') && (
                              <div className="space-y-2">
                                <Label>Section Title</Label>
                                <Input
                                  value={s.title || ""}
                                  onChange={e => updateSectionData(s.id, { title: e.target.value })}
                                  className="bg-muted/30 font-bold uppercase italic h-12"
                                />
                              </div>
                            )}

                            {(s.type === 'hero' || s.type === 'products' || s.type === 'newsletter') && (
                              <div className="space-y-2">
                                <Label>Subtitle / Description</Label>
                                <Textarea
                                  value={s.subtitle || ""}
                                  onChange={e => updateSectionData(s.id, { subtitle: e.target.value })}
                                  className="bg-muted/30 min-h-[100px]"
                                />
                              </div>
                            )}

                            {s.type === 'about' && (
                              <div className="space-y-2">
                                <Label>Body Content</Label>
                                <Textarea
                                  value={s.content || ""}
                                  onChange={e => updateSectionData(s.id, { content: e.target.value })}
                                  className="bg-muted/30 min-h-[150px]"
                                />
                              </div>
                            )}

                            {s.type === 'hero' && (
                              <div className="space-y-2">
                                <Label>Featured Image</Label>
                                <ImageUpload
                                  value={s.image || ""}
                                  onChange={val => updateSectionData(s.id, { image: val })}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-2 border-dashed border-primary/10 bg-muted/5 flex flex-col items-center justify-center p-12 text-center space-y-4">
                    <div className="h-16 w-16 bg-background rounded-3xl flex items-center justify-center border shadow-xl rotate-3">
                      <Layout className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase italic tracking-tighter">Layout Manager</h3>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">Select a section from the left sidebar to begin editing its properties and visibility.</p>
                    </div>
                  </Card>
                )}

                {/* Global Brand & Colors */}
                <Card className="border border-primary/5 shadow-sm">
                  <CardHeader>
                    <CardTitle className="uppercase italic font-black flex items-center gap-2">
                      <Type className="h-5 w-5" /> Identity & Global Theme
                    </CardTitle>
                    <CardDescription>Core brand assets and color spectrum.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateConfig} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Brand Name</Label>
                          <Input
                            value={configForm?.brandName}
                            onChange={e => setConfigForm(prev => prev ? {...prev, brandName: e.target.value} : null)}
                            className="bg-muted/30 font-black h-12 italic uppercase"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Brand Tagline</Label>
                          <Input
                            value={configForm?.brandTagline}
                            onChange={e => setConfigForm(prev => prev ? {...prev, brandTagline: e.target.value} : null)}
                            className="bg-muted/30 uppercase h-12 tracking-widest"
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label>Global Announcement</Label>
                          <Input
                            value={configForm?.announcementText}
                            onChange={e => setConfigForm(prev => prev ? {...prev, announcementText: e.target.value} : null)}
                            className="bg-muted/30 h-12"
                            placeholder="Pinned to the top of every page"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Accent Color (HSL)</Label>
                          <Input
                            value={configForm?.accentColor}
                            onChange={e => setConfigForm(prev => prev ? {...prev, accentColor: e.target.value} : null)}
                            className="bg-muted/30 font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Background Color (HSL)</Label>
                          <Input
                            value={configForm?.backgroundColor}
                            onChange={e => setConfigForm(prev => prev ? {...prev, backgroundColor: e.target.value} : null)}
                            className="bg-muted/30 font-mono"
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full h-16 text-lg font-black uppercase italic rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]">
                        Save All System Changes
                      </Button>
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
        <DialogContent className="sm:max-w-[500px] bg-background border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic">Edit Product</DialogTitle>
            <DialogDescription>Modify existing product specifications.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProduct} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-name">Product Name</Label>
                <Input id="edit-name" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required className="bg-muted/30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input id="edit-price" type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required className="bg-muted/30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock</Label>
                <Input id="edit-stock" type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} required className="bg-muted/30" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input id="edit-category" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="bg-muted/30" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Product Image</Label>
                <ImageUpload
                  value={productForm.image}
                  onChange={(val) => setProductForm({...productForm, image: val})}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-desc">Description</Label>
                <Textarea id="edit-desc" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="bg-muted/30" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full h-12 font-bold uppercase italic">Update Records</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
