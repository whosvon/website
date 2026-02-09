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
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Users
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
import { Product, Order } from "@shared/api";
import { toast } from "sonner";

export default function Admin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Form state for new product
  const [newProduct, setNewProduct] = useState({
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
      console.log("Fetching dashboard data...");
      const [prodRes, ordRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders")
      ]);
      
      if (!prodRes.ok || !ordRes.ok) {
        throw new Error(`Server error: ${prodRes.status} / ${ordRes.status}`);
      }

      const prodData = await prodRes.json();
      const ordData = await ordRes.json();
      
      console.log("Data received:", { products: prodData.length, orders: ordData.length });
      setProducts(Array.isArray(prodData) ? prodData : []);
      setOrders(Array.isArray(ordData) ? ordData : []);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
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
        body: JSON.stringify(newProduct),
      });
      if (res.ok) {
        toast.success("Product added successfully!");
        setIsAddDialogOpen(false);
        setNewProduct({ name: "", price: "", description: "", category: "", image: "", stock: "0" });
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to add product");
    }
  };

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
        <Button variant="ghost" className="mt-8 text-xs uppercase tracking-widest" onClick={() => navigate("/login")}>Abort Access</Button>
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
                    <Input id="name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required className="bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input id="price" type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required className="bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input id="stock" type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required className="bg-muted/30" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="bg-muted/30" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input id="image" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="bg-muted/30" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="desc">Description</Label>
                    <Textarea id="desc" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="bg-muted/30" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full h-12 font-bold uppercase italic">Initialize Product</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
                <h3 className="text-2xl font-black">$12,482</h3>
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
                <h3 className="text-2xl font-black">842</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-background border p-1 rounded-xl h-12">
            <TabsTrigger value="orders" className="rounded-lg px-6 font-bold uppercase tracking-tighter data-[state=active]:bg-primary/5 data-[state=active]:text-primary">Orders</TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg px-6 font-bold uppercase tracking-tighter data-[state=active]:bg-primary/5 data-[state=active]:text-primary">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="border border-primary/5 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div>
                  <CardTitle className="uppercase italic font-black">Recent Orders</CardTitle>
                  <CardDescription>Review customer transactions.</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-9 rounded-lg gap-2 uppercase text-[10px] font-bold tracking-widest">
                  <Filter className="h-4 w-4" /> Filter
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="pl-6 uppercase text-[10px] font-bold tracking-widest">ID</TableHead>
                      <TableHead className="uppercase text-[10px] font-bold tracking-widest">Customer</TableHead>
                      <TableHead className="uppercase text-[10px] font-bold tracking-widest">Total</TableHead>
                      <TableHead className="uppercase text-[10px] font-bold tracking-widest">Status</TableHead>
                      <TableHead className="text-right pr-6 uppercase text-[10px] font-bold tracking-widest">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/20 cursor-pointer">
                        <TableCell className="pl-6 font-mono font-medium text-primary">{order.id}</TableCell>
                        <TableCell>
                          <div className="font-bold">{order.customerName}</div>
                          <div className="text-[10px] text-muted-foreground">{order.customerEmail}</div>
                        </TableCell>
                        <TableCell className="font-black text-lg">${order.total}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right pr-6 text-muted-foreground text-xs">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="border border-primary/5 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div>
                  <CardTitle className="uppercase italic font-black">Inventory</CardTitle>
                  <CardDescription>Neural catalog management.</CardDescription>
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
                    {products.map((product) => (
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
                          <Button variant="ghost" size="sm" className="font-bold uppercase text-[10px]">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
