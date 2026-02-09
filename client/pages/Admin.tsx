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
  Megaphone
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
import { Product, Order, StorefrontConfig } from "@shared/api";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";

export default function Admin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Storefront Config state
  const [config, setConfig] = useState<StorefrontConfig | null>(null);
  const [configForm, setConfigForm] = useState<StorefrontConfig | null>(null);

  const navigate = useNavigate();

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
      const [prodRes, ordRes, configRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders"),
        fetch("/api/config")
      ]);

      if (!prodRes.ok || !ordRes.ok || !configRes.ok) throw new Error("Fetch failed");

      const prodData = await prodRes.json();
      const ordData = await ordRes.json();
      const configData = await configRes.json();

      setProducts(prodData);
      setOrders(ordData);
      setConfig(configData);
      setConfigForm(configData);
    } catch (error) {
      toast.error("Security Clearance Required. Data retrieval failed.");
    } finally {
      setLoading(false);
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
                <h3 className="text-2xl font-black">0</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-background border p-1 rounded-xl h-12">
            <TabsTrigger value="products" className="rounded-lg px-6 font-bold uppercase tracking-tighter data-[state=active]:bg-primary/5 data-[state=active]:text-primary">Products</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg px-6 font-bold uppercase tracking-tighter data-[state=active]:bg-primary/5 data-[state=active]:text-primary">Orders</TabsTrigger>
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
