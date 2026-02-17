import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "./index";
import * as express from "express";
import fs from "fs";

const app = createServer();
const port = Number(process.env.PORT) || 8080;

// Robust path resolution for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In Wasmer/Production, we expect the SPA to be in /dist/spa
// We use absolute paths to avoid issues with the working directory
const distPath = path.resolve(__dirname, "../spa");

console.log(`🚀 Starting Aether Server...`);
console.log(`📂 Static files directory: ${distPath}`);

// Verify directory exists and log contents for debugging
if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  console.log(`✅ Found ${files.length} files in SPA directory.`);
} else {
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
    res.status(404).send(`Frontend build not found at ${indexPath}. Please ensure 'npm run build' was executed.`);
  }
});

app.listen(port, "0.0.0.0", () => {
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