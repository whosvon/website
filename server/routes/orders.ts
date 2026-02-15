import { RequestHandler } from "express";
import { orders } from "../db";

export const getOrders: RequestHandler = (req, res) => {
  res.json(orders);
};

export const getMyOrders: RequestHandler = (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ message: "userId required" });
  }
  const myOrders = orders.filter(o => o.userId === userId);
  res.json(myOrders);
};

export const createOrder: RequestHandler = (req, res) => {
  const orderData = req.body;
  const newOrder = {
    ...orderData,
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  orders.push(newOrder);
  res.status(201).json(newOrder);
};
