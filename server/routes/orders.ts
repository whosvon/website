import { RequestHandler } from "express";
import { orders, users, storefrontConfig } from "../db";
import { Order } from "@shared/api";

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
  const { 
    userId, 
    customerName, 
    customerEmail, 
    customerPhone,
    shippingAddress,
    items, 
    subtotal, 
    shippingFee,
    taxAmount,
    total, 
    pointsUsed,
    shippingMethod,
    paymentMethod
  } = req.body;
  
  let discountAmount = 0;
  let pointsEarned = 0;

  const user = users.find(u => u.id === userId);
  const loyalty = storefrontConfig.loyaltySettings;

  if (user && loyalty.enabled) {
    // Handle redemption
    if (pointsUsed && pointsUsed > 0) {
      if (user.loyaltyPoints >= pointsUsed) {
        discountAmount = pointsUsed / loyalty.pointsToDollarRate;
        user.loyaltyPoints -= pointsUsed;
      }
    }

    // Handle earning (on the subtotal after discount)
    const earnableAmount = Math.max(0, subtotal - discountAmount);
    pointsEarned = Math.floor(earnableAmount * loyalty.pointsPerDollar);
    user.loyaltyPoints += pointsEarned;
  }

  const newOrder: Order = {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    userId,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items,
    subtotal,
    shippingFee,
    taxAmount,
    total,
    pointsUsed: pointsUsed || 0,
    pointsEarned,
    discountAmount,
    createdAt: new Date().toISOString(),
    status: 'pending',
    shippingMethod,
    paymentMethod
  };

  orders.push(newOrder);
  
  res.status(201).json({ order: newOrder, user });
};

export const updateOrder: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Order not found" });
  }
  
  orders[index].status = status;
  res.json(orders[index]);
};