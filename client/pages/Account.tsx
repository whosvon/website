import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { User, Order } from "@shared/api";
import { Package, User as UserIcon, LogOut, ChevronRight, ShoppingBag, Coins, CreditCard, Truck, MapPin, Calendar, Hash } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function Account() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(savedUser);
    setUser(userData);
    fetchOrders(userData.id);
  }, [navigate]);

  const fetchOrders = async (userId: string) => {
    try {
      const res = await fetch(`/api/orders/me?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast({ title: "Logged out successfully" });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-black">A</div>
            <span>AETHER</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User Profile */}
          <div className="md:col-span-1 space-y-6">
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border-4 border-background shadow-xl">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <UserIcon className="h-10 w-10 text-primary" />
                  )}
                </div>
                <CardTitle>{user.name || "Customer"}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
                <div className="mt-4">
                   <Badge variant="outline" className="font-mono text-[10px] uppercase">
                     {user.role} Account
                   </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground border-t pt-4">
                    <span>Member since</span>
                    <span className="text-foreground">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Total Orders</span>
                    <span className="text-foreground">{orders.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loyalty Points Card */}
            <Card className="border-primary/20 bg-primary/5 overflow-hidden relative">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2">
                  <Coins className="h-4 w-4 text-primary" /> Loyalty Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-primary italic">{user.loyaltyPoints || 0}</span>
                  <span className="text-xs font-bold text-muted-foreground uppercase">Points</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 font-medium uppercase">
                  Earn points on every acquisition. Redeem them for exclusive discounts.
                </p>
              </CardContent>
              <Coins className="absolute -bottom-4 -right-4 h-24 w-24 text-primary/10 rotate-12" />
            </Card>
          </div>

          {/* Order History */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Order History</h2>
              <Button asChild variant="outline" size="sm">
                <Link to="/">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
            </div>

            {orders.length === 0 ? (
              <Card className="border-dashed border-border/50 bg-card/30 py-12">
                <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">No orders yet</p>
                    <p className="text-sm text-muted-foreground max-w-[250px]">
                      When you make a purchase, your orders will appear here for tracking.
                    </p>
                  </div>
                  <Button asChild className="rounded-full px-8">
                    <Link to="/">Explore Products</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors group">
                    <CardHeader className="p-4 flex-row items-center justify-between space-y-0">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold">{order.id}</span>
                          <Badge variant={
                            order.status === 'delivered' ? 'default' : 
                            order.status === 'shipped' ? 'secondary' : 
                            order.status === 'cancelled' ? 'destructive' : 'outline'
                          } className="text-[10px] uppercase h-5">
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${order.total.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                         {order.items.map((item, idx) => (
                           <div key={idx} className="flex-shrink-0 w-10 h-10 rounded border bg-background flex items-center justify-center text-[10px] font-bold">
                             {item.name.charAt(0)}
                           </div>
                         ))}
                      </div>
                      {order.pointsEarned && order.pointsEarned > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
                          <Coins className="h-3 w-3" />
                          Earned {order.pointsEarned} points
                        </div>
                      )}
                      <div className="pt-2 border-t mt-2 flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedOrder(order)}
                          className="h-8 text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                        >
                          View Details
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[2rem]">
          {selectedOrder && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="font-mono text-[10px] uppercase">
                    {selectedOrder.status}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                  <Hash className="h-5 w-5 text-primary" />
                  {selectedOrder.id}
                </DialogTitle>
                <DialogDescription className="text-[10px] font-bold uppercase tracking-widest">
                  Order Summary & Logistics
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Items List */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acquired Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-muted/30 rounded-xl border border-primary/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-background flex items-center justify-center text-[10px] font-bold border">
                            {item.quantity}x
                          </div>
                          <span className="text-xs font-bold uppercase italic">{item.name}</span>
                        </div>
                        <span className="text-xs font-black text-primary">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logistics & Payment */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-2xl border border-primary/5 space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Truck className="h-3 w-3" />
                      <span className="text-[9px] font-black uppercase">Method</span>
                    </div>
                    <p className="text-xs font-bold uppercase italic">{selectedOrder.shippingMethod}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-2xl border border-primary/5 space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CreditCard className="h-3 w-3" />
                      <span className="text-[9px] font-black uppercase">Payment</span>
                    </div>
                    <p className="text-xs font-bold uppercase italic">{selectedOrder.paymentMethod === 'etransfer' ? 'E-Transfer' : 'On Arrival'}</p>
                  </div>
                </div>

                {/* Shipping Address / Pickup */}
                <div className="p-4 bg-muted/30 rounded-2xl border border-primary/5 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="text-[9px] font-black uppercase">Destination</span>
                  </div>
                  <p className="text-xs font-bold uppercase italic leading-relaxed">
                    {selectedOrder.shippingAddress}
                  </p>
                </div>

                {/* Financial Breakdown */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-[10px] font-black uppercase italic text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discountAmount && selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-[10px] font-black uppercase italic text-primary">
                      <span>Loyalty Discount</span>
                      <span>-${selectedOrder.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[10px] font-black uppercase italic text-muted-foreground">
                    <span>Shipping</span>
                    <span>{selectedOrder.shippingFee === 0 ? 'FREE' : `$${selectedOrder.shippingFee.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase italic text-muted-foreground">
                    <span>Tax</span>
                    <span>${selectedOrder.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black uppercase italic pt-2 border-t border-dashed">
                    <span className="text-sm">Total</span>
                    <span className="text-xl text-primary">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* E-Transfer Instructions (if applicable) */}
                {selectedOrder.paymentMethod === 'etransfer' && selectedOrder.status === 'pending' && (
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-3">
                    <p className="text-[10px] font-black uppercase italic text-primary text-center">E-Transfer Message Protocol</p>
                    <div className="bg-background p-3 rounded-xl border border-dashed border-primary/20 text-center">
                      <span className="font-mono font-bold text-xs text-primary">
                        {selectedOrder.id} - {selectedOrder.customerName}
                      </span>
                    </div>
                    <p className="text-[8px] text-center text-muted-foreground uppercase font-medium">
                      Include this exact message in your transfer for verification.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-2">
                <Button onClick={() => setSelectedOrder(null)} className="w-full h-12 rounded-2xl font-black uppercase italic">
                  Close Details
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}