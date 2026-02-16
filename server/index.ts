import "dotenv/config";
import express from "express";
import cors from "cors";
import { getProducts, addProduct, updateProduct, deleteProduct } from "./routes/products";
import { getOrders, createOrder, getMyOrders, updateOrder } from "./routes/orders";
import { handleLogin, handleRegister, handleCustomerLogin, handleGoogleLogin, getUsers } from "./routes/auth";
import { getConfig, updateConfig } from "./routes/config";
import { getMessages, sendMessage, markAsRead } from "./routes/chat";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API routes
  app.get("/api/products", getProducts);
  app.post("/api/products", addProduct);
  app.put("/api/products/:id", updateProduct);
  app.delete("/api/products/:id", deleteProduct);

  app.get("/api/orders", getOrders);
  app.get("/api/orders/me", getMyOrders);
  app.post("/api/orders", createOrder);
  app.put("/api/orders/:id", updateOrder);

  app.get("/api/config", getConfig);
  app.post("/api/config", updateConfig);

  app.get("/api/chat", getMessages);
  app.post("/api/chat", sendMessage);
  app.post("/api/chat/read", markAsRead);

  app.get("/api/users", getUsers);

  app.post("/api/subscribe", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });
    console.log(`New subscriber: ${email}`);
    res.json({ success: true, message: "Welcome to the network." });
  });

  app.post("/api/login", handleLogin);
  app.post("/api/register", handleRegister);
  app.post("/api/login/customer", handleCustomerLogin);
  app.post("/api/login/google", handleGoogleLogin);

  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  return app;
}