import { RequestHandler } from "express";
import { orders } from "../db";

export const getOrders: RequestHandler = (req, res) => {
  res.json(orders);
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
