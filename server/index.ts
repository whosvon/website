import "dotenv/config";
import express from "express";
import cors from "cors";
import { getProducts, addProduct, updateProduct } from "./routes/products";
import { getOrders, createOrder } from "./routes/orders";
import { handleLogin } from "./routes/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes
  app.get("/api/products", getProducts);
  app.post("/api/products", addProduct);

  app.get("/api/orders", getOrders);
  app.post("/api/orders", createOrder);

  app.post("/api/login", handleLogin);

  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  return app;
}
