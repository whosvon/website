import { Product, Order } from "@shared/api";

// Mock database
export const products: Product[] = [
  {
    id: "1",
    name: "Aether Wireless Headphones",
    description: "Premium noise-canceling headphones with crystal clear sound and 40-hour battery life.",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    category: "Electronics",
    stock: 15,
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    name: "Lumina Smart Watch",
    description: "Elegant health tracking with a vibrant OLED display and week-long battery.",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    category: "Wearables",
    stock: 25,
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    name: "Terra Ceramic Coffee Set",
    description: "Hand-crafted minimalist ceramic set including four mugs and a matching carafe.",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80",
    category: "Home",
    stock: 10,
    createdAt: new Date().toISOString()
  }
];

export const orders: Order[] = [
  {
    id: "ORD-1001",
    customerName: "Jane Doe",
    customerEmail: "jane@example.com",
    items: [
      { productId: "1", name: "Aether Wireless Headphones", price: 299.99, quantity: 1 }
    ],
    total: 299.99,
    status: "delivered",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];
