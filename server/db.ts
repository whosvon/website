import { Product, Order, StorefrontConfig } from "@shared/api";

// Mock database - starting fresh
export const products: Product[] = [];

export const orders: Order[] = [];

export let storefrontConfig: StorefrontConfig = {
  brandName: "AETHER",
  brandTagline: "STORE",
  heroTitle: "Elevate Your Digital Lifestyle.",
  heroDescription: "Experience the perfect blend of minimalist design and cutting-edge technology. Our curated collection brings you the future of living.",
  heroImage: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=1200&q=80",
  accentColor: "262 83% 58%", // Default purple
  announcementText: "Welcome to our new store! Check out our latest products."
};
