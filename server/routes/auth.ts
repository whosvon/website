import { RequestHandler } from "express";
import { AuthResponse } from "@shared/api";

export const handleLogin: RequestHandler = (req, res) => {
  const { password, secretCode } = req.body;

  // Secret security sequence
  if (password === "rROBLOX00" && secretCode === "27Club") {
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
