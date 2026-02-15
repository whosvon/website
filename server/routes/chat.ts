import { RequestHandler } from "express";
import { chatMessages } from "../db";
import { ChatMessage } from "@shared/api";

export const getMessages: RequestHandler = (req, res) => {
  const { userId } = req.query;
  
  if (userId) {
    // Return messages for a specific customer (used by the customer or admin chatting with them)
    // In this mock, we'll assume senderId or a new recipientId field. 
    // To keep it simple, let's filter messages involving this userId
    const messages = chatMessages.filter(m => m.senderId === userId || (m.senderRole === 'admin' && m.text.includes(`@${userId}`)));
    // A better way would be a conversationId, but let's stick to a simple filter for now.
    // Actually, let's just return all for now and filter on frontend, or improve the model.
    res.json(chatMessages.filter(m => m.senderId === userId || m.text.includes(`@${userId}`)));
  } else {
    res.json(chatMessages);
  }
};

export const sendMessage: RequestHandler = (req, res) => {
  const { senderId, senderName, senderRole, text } = req.body;
  
  const newMessage: ChatMessage = {
    id: Math.random().toString(36).substr(2, 9),
    senderId,
    senderName,
    senderRole,
    text,
    timestamp: new Date().toISOString(),
    read: false
  };
  
  chatMessages.push(newMessage);
  res.status(201).json(newMessage);
};

export const markAsRead: RequestHandler = (req, res) => {
  const { userId } = req.body;
  chatMessages.forEach(m => {
    if (m.senderId === userId) {
      m.read = true;
    }
  });
  res.json({ success: true });
};
