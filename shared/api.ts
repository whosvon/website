export type Permission = 'products' | 'orders' | 'points' | 'chat' | 'settings' | 'staff';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'customer' | 'employee';
  avatar?: string;
  loyaltyPoints: number;
  permissions?: Permission[];
  password?: string; // For staff login
  secretCode?: string; // For staff login
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'customer';
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
  pointsUsed?: number;
  pointsEarned?: number;
  discountAmount?: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  shippingMethod: 'pickup' | 'delivery';
  paymentMethod: 'etransfer' | 'on_arrival';
  createdAt: string;
}

export interface StorefrontSection {
  id: string;
  type: 'hero' | 'products' | 'about' | 'newsletter' | 'banner' | 'faq' | 'gallery' | 'testimonials';
  title?: string;
  subtitle?: string;
  content?: string;
  image?: string;
  items?: { q: string; a: string }[];
  visible: boolean;
}

export interface LoyaltySettings {
  enabled: boolean;
  pointsPerDollar: number;
  pointsToDollarRate: number;
}

export interface ShippingSettings {
  freeShippingThreshold: number;
  flatRate: number;
  taxRate: number;
  pickupLocation: string;
  allowPayOnArrival: boolean;
}

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  snapchat?: string;
  discord?: string;
}

export interface HeaderSettings {
  showSearch: boolean;
  showCart: boolean;
  showLoyalty: boolean;
  sticky: boolean;
}

export interface FooterSettings {
  footerText: string;
  showSocials: boolean;
}

export interface ThemePreset {
  id: string;
  name: string;
  primary: string;
  background: string;
  foreground: string;
}

export interface StorefrontConfig {
  brandName: string;
  brandTagline: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  themePresetId?: string;
  announcementText?: string;
  etransferEmail?: string;
  maintenanceMode: boolean;
  headerSettings: HeaderSettings;
  footerSettings: FooterSettings;
  socialLinks: SocialLinks;
  loyaltySettings: LoyaltySettings;
  shippingSettings: ShippingSettings;
  sections: StorefrontSection[];
}