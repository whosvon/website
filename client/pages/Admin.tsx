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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Product, Order } from "@shared/api";
import { toast } from "sonner";

export default function Admin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  console.log("Admin page rendering, loading:", loading);
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
      const [prodRes, ordRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders")
      ]);
      const prodData = await prodRes.json();
      const ordData = await ordRes.json();
      setProducts(prodData);
      setOrders(ordData);
    } catch (error) {
      toast.error("Failed to load dashboard data");
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
    return <div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-background border-r p-6 space-y-8">
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
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
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
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">Manage your products and track customer orders.</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 h-11 px-6 rounded-xl">
                <Plus className="h-4 w-4" /> Add New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Fill in the details for the new product listing.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input id="price" type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input id="stock" type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input id="image" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} placeholder="https://unsplash.com/..." />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="desc">Description</Label>
                    <Textarea id="desc" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full h-11 mt-4">Create Product</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-sm bg-background/50 backdrop-blur">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-2xl">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold tracking-tight">$12,482</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-background/50 backdrop-blur">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-emerald-500/10 p-3 rounded-2xl">
                <ShoppingBag className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <h3 className="text-2xl font-bold tracking-tight">{orders.length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-background/50 backdrop-blur">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-blue-500/10 p-3 rounded-2xl">
                <Package className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Products</p>
                <h3 className="text-2xl font-bold tracking-tight">{products.length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-background/50 backdrop-blur">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-amber-500/10 p-3 rounded-2xl">
                <Users className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customers</p>
                <h3 className="text-2xl font-bold tracking-tight">842</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-background border p-1 rounded-xl h-12">
            <TabsTrigger value="orders" className="rounded-lg px-6 data-[state=active]:bg-primary/5 data-[state=active]:text-primary">Orders</TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg px-6 data-[state=active]:bg-primary/5 data-[state=active]:text-primary">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Review and manage your incoming customer orders.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-9 rounded-lg gap-2">
                    <Filter className="h-4 w-4" /> Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="pl-6">Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right pr-6">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/20 cursor-pointer">
                        <TableCell className="pl-6 font-mono font-medium">{order.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                        </TableCell>
                        <TableCell>{order.items.length} items</TableCell>
                        <TableCell className="font-semibold">${order.total}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right pr-6 text-muted-foreground">
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
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div>
                  <CardTitle>Inventory</CardTitle>
                  <CardDescription>Manage your product catalog and stock levels.</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search products..." className="pl-9 h-9" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="pl-6">Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id} className="hover:bg-muted/20">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden">
                              <img src={product.image} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div className="font-medium">{product.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="font-semibold">${product.price}</TableCell>
                        <TableCell>
                          <Badge variant={product.stock < 5 ? "destructive" : "secondary"}>
                            {product.stock} in stock
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button variant="ghost" size="sm">Edit</Button>
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
