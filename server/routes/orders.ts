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
  const { userId, customerName, customerEmail, items, total, pointsUsed } = req.body;
  
  let finalTotal = total;
  let discountAmount = 0;
  let pointsEarned = 0;

  const user = users.find(u => u.id === userId);
  const loyalty = storefrontConfig.loyaltySettings;

  if (user && loyalty.enabled) {
    // Handle redemption
    if (pointsUsed && pointsUsed > 0) {
      if (user.loyaltyPoints >= pointsUsed) {
        discountAmount = pointsUsed / loyalty.pointsToDollarRate;
        finalTotal = Math.max(0, total - discountAmount);
        user.loyaltyPoints -= pointsUsed;
      }
    }

    // Handle earning (on the final paid amount)
    pointsEarned = Math.floor(finalTotal * loyalty.pointsPerDollar);
    user.loyaltyPoints += pointsEarned;
  }

  const newOrder: Order = {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    userId,
    customerName,
    customerEmail,
    items,
    total: finalTotal,
    pointsUsed: pointsUsed || 0,
    pointsEarned,
    discountAmount,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };

  orders.push(newOrder);
  
  // Return updated user data if applicable
  res.status(201).json({ order: newOrder, user });
};