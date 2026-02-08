import { RequestHandler } from "express";
import { AuthResponse } from "@shared/api";

export const handleLogin: RequestHandler = (req, res) => {
  const { email, password } = req.body;

  // Simple hardcoded check for demo purposes
  if (email === "admin@store.com" && password === "admin123") {
    const response: AuthResponse = {
      success: true,
      token: "mock-jwt-token",
      user: {
        id: "admin-1",
        email: "admin@store.com",
        role: "admin"
      }
    };
    return res.json(response);
  }

  res.status(401).json({ success: false, message: "Invalid credentials" });
};
