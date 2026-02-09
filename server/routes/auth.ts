import { RequestHandler } from "express";
import { AuthResponse } from "@shared/api";

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
        role: "admin"
      }
    };
    return res.json(response);
  }

  res.status(401).json({ success: false, message: "Security breach detected" });
};
