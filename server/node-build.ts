import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "./index";
import * as express from "express";
import fs from "fs";

const app = createServer();
const port = process.env.PORT || 3000;

// Robust path resolution for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In production, serve the built SPA files
// We look for 'spa' relative to the 'dist/server' directory
const distPath = path.resolve(__dirname, "../spa");

console.log(`📂 Static files directory: ${distPath}`);

// Verify directory exists
if (!fs.existsSync(distPath)) {
  console.error(`❌ Error: Static directory not found at ${distPath}`);
}

// Health check for Wasmer/Load Balancers
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Serve static files
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  const indexPath = path.join(distPath, "index.html");
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Frontend build not found. Please run 'npm run build' first.");
  }
});

app.listen(port, () => {
  console.log(`🚀 Aether server running on port ${port}`);
  console.log(`📱 Mode: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});