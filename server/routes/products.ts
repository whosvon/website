import { RequestHandler } from "express";
import { products } from "../db";
import { Product } from "@shared/api";

export const getProducts: RequestHandler = (req, res) => {
  res.json(products);
};

export const addProduct: RequestHandler = (req, res) => {
  const productData = req.body as Partial<Product>;

  if (!productData.name || !productData.price) {
    return res.status(400).json({ error: "Name and price are required" });
  }

  const newProduct: Product = {
    id: Math.random().toString(36).substring(2, 9),
    name: productData.name,
    description: productData.description || "",
    price: Number(productData.price),
    image: productData.image || "https://via.placeholder.com/400",
    category: productData.category || "General",
    stock: Number(productData.stock) || 0,
    createdAt: new Date().toISOString()
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
};
