import { Product, Order, StorefrontConfig, User, ChatMessage } from "@shared/api";

export const products: Product[] = [];
export const orders: Order[] = [];
export const users: User[] = [];
export const chatMessages: ChatMessage[] = [];

export let storefrontConfig: StorefrontConfig = {
  brandName: "AETHER",
  brandTagline: "SYSTEMS",
  accentColor: "262 83% 58%",
  backgroundColor: "0 0% 100%",
  textColor: "240 10% 3.9%",
  announcementText: "SYSTEM UPDATE: NEW INVENTORY DETECTED.",
  etransferEmail: "payments@aether.store",
  socialLinks: {
    instagram: "https://instagram.com",
    twitter: "https://twitter.com",
    discord: "https://discord.com"
  },
  loyaltySettings: {
    enabled: true,
    pointsPerDollar: 10,
    pointsToDollarRate: 120
  },
  shippingSettings: {
    freeShippingThreshold: 150,
    flatRate: 17.99,
    taxRate: 13, // Default 13%
    pickupLocation: "123 Aether Way, Toronto, ON",
    allowPayOnArrival: true
  },
  sections: [
    {
      id: "hero-1",
      type: "hero",
      title: "The Future of Digital Commerce.",
      subtitle: "Experience a marketplace built on speed, security, and minimalist aesthetics.",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80",
      visible: true
    },
    {
      id: "products-1",
      type: "products",
      title: "Neural Catalog",
      subtitle: "Browse our latest hardware and software drops.",
      visible: true
    },
    {
      id: "faq-1",
      type: "faq",
      title: "Technical Support",
      subtitle: "Commonly asked questions about our protocols.",
      items: [
        { q: "How do I pay?", a: "We currently accept E-Transfer for maximum security and privacy." },
        { q: "Is shipping worldwide?", a: "Yes, we transmit physical goods to all major global hubs." },
        { q: "What is the loyalty program?", a: "Earn points on every purchase to unlock future discounts." }
      ],
      visible: true
    },
    {
      id: "newsletter-1",
      type: "newsletter",
      title: "Join the Network",
      subtitle: "Subscribe for encrypted updates and early access.",
      visible: true
    }
  ]
};