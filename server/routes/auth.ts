import { RequestHandler } from "express";
import { AuthResponse, User } from "@shared/api";
import { users } from "../db";

export const handleLogin: RequestHandler = (req, res) => {
  const password = (req.body.password || "").trim();
  const secretCode = (req.body.secretCode || "").trim();

  // Secret security sequence
  // Making secretCode case-insensitive for better UX while keeping it secure
  if (password === "rROBLOX00" && secretCode.toLowerCase() === "27club") {
    const response: AuthResponse = {
      success: true,
      token: "secure-admin-token-777",
      user: {
        id: "admin-master",
        email: "admin@aether.store",
        role: "admin",
        name: "Admin",
        loyaltyPoints: 0,
        createdAt: new Date().toISOString()
      }
    };
    return res.json(response);
  }

  res.status(401).json({ success: false, message: "Security breach detected" });
};

export const handleRegister: RequestHandler = (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password required" });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ success: false, message: "Email already registered" });
  }

  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    email,
    name: name || email.split('@')[0],
    role: 'customer',
    loyaltyPoints: 0,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  res.json({
    success: true,
    token: `token-${newUser.id}`,
    user: newUser
  });
};

export const handleCustomerLogin: RequestHandler = (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  // In a real app, we would hash passwords. For this mock, any password works if email exists
  if (user && user.role === 'customer') {
    return res.json({
      success: true,
      token: `token-${user.id}`,
      user: user
    });
  }

  res.status(401).json({ success: false, message: "Invalid credentials" });
};

export const handleGoogleLogin: RequestHandler = (req, res) => {
  const { email, name, picture } = req.body;

  let user = users.find(u => u.email === email);

  if (!user) {
    user = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      avatar: picture,
      role: 'customer',
      loyaltyPoints: 0,
      createdAt: new Date().toISOString()
    };
    users.push(user);
  }

  res.json({
    success: true,
    token: `google-token-${user.id}`,
    user: user
  });
};

export const getUsers: RequestHandler = (req, res) => {
  res.json(users);
};