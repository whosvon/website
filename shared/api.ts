export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'customer';
  avatar?: string;
  createdAt: string;
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
  items: OrderItem[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface StorefrontSection {
  id: string;
  type: 'hero' | 'products' | 'about' | 'newsletter' | 'banner';
  title?: string;
  subtitle?: string;
  content?: string;
  image?: string;
  visible: boolean;
}

export interface StorefrontConfig {
  brandName: string;
  brandTagline: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  announcementText?: string;
  sections: StorefrontSection[];
}
