import { RequestHandler } from "express";
import { storefrontConfig } from "../db";
import { StorefrontConfig } from "@shared/api";

export const getConfig: RequestHandler = (req, res) => {
  res.json(storefrontConfig);
};

export const updateConfig: RequestHandler = (req, res) => {
  const newConfig = req.body as Partial<StorefrontConfig>;
  
  // Update the exported object
  Object.assign(storefrontConfig, newConfig);
  
  res.json(storefrontConfig);
};
