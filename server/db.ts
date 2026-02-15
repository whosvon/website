import { Product, Order, StorefrontConfig, User, ChatMessage } from "@shared/api";

// Mock database - starting fresh
export const products: Product[] = [];

export const orders: Order[] = [];

export const users: User[] = [];

export const chatMessages: ChatMessage[] = [];

export let storefrontConfig: StorefrontConfig = {
  brandName: "AETHER",
  brandTagline: "STORE",
  accentColor: "262 83% 58%", // Default purple
  backgroundColor: "0 0% 100%", // White
  textColor: "240 10% 3.9%", // Dark gray
  announcementText: "Welcome to our new store! Check out our latest products.",
  sections: [
    {
      id: "hero-1",
      type: "hero",
      title: "Elevate Your Digital Lifestyle.",
      subtitle: "Experience the perfect blend of minimalist design and cutting-edge technology.",
      image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=1200&q=80",
      visible: true
    },
    {
      id: "products-1",
      type: "products",
      title: "Featured Inventory",
      subtitle: "Carefully curated items for your digital existence.",
      visible: true
    },
    {
      id: "about-1",
      type: "about",
      title: "Our Philosophy",
      content: "We believe in high-quality products that merge form and function seamlessly.",
      visible: true
    },
    {
      id: "newsletter-1",
      type: "newsletter",
      title: "Join the Network",
      subtitle: "Subscribe for exclusive drops and technical updates.",
      visible: true
    }
  ]
};
