import { RequestHandler } from "express";
import { AuthResponse, User } from "@shared/api";
import { users } from "../db";

export const handleLogin: RequestHandler = (req, res) => {
  const password = (req.body.password || "").trim();
  const secretCode = (req.body.secretCode || "").trim();

  // Find staff user with matching credentials
  const staffUser = users.find(u => 
    (u.role === 'admin' || u.role === 'employee') && 
    u.password === password && 
    u.secretCode?.toLowerCase() === secretCode.toLowerCase()
  );

  if (staffUser) {
    const response: AuthResponse = {
      success: true,
      token: `staff-token-${staffUser.id}`,
      user: { ...staffUser, password: '', secretCode: '' } // Don't send credentials back
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

export const createStaff: RequestHandler = (req, res) => {
  const staffData = req.body as Partial<User>;
  
  if (!staffData.email || !staffData.password || !staffData.secretCode) {
    return res.status(400).json({ message: "Email, Password, and Secret Code required" });
  }

  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    email: staffData.email,
    name: staffData.name || "Staff Member",
    role: staffData.role || 'employee',
    loyaltyPoints: 0,
    permissions: staffData.permissions || [],
    password: staffData.password,
    secretCode: staffData.secretCode,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  res.status(201).json(newUser);
};

export const updateStaff: RequestHandler = (req, res) => {
  const { id } = req.params;
  const updateData = req.body as Partial<User>;
  
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ message: "User not found" });

  users[index] = { ...users[index], ...updateData };
  res.json(users[index]);
};

export const deleteStaff: RequestHandler = (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ message: "User not found" });
  
  // Prevent deleting the last admin
  if (users[index].id === 'admin-master') {
    return res.status(403).json({ message: "Cannot delete master admin" });
  }

  users.splice(index, 1);
  res.json({ success: true });
};