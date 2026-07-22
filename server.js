const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

const uploadRoutes = require("./src/routes/uploadRoutes");
const statusRoutes = require("./src/routes/statusRoutes");
const resultRoutes = require("./src/routes/resultRoutes");

dotenv.config();

console.log("DB_USER =", process.env.DB_USER);
console.log("DB_HOST =", process.env.DB_HOST);
console.log("DB_NAME =", process.env.DB_NAME);

// Database Connection
require("./src/config/database");
const { createImageWorker } = require("./src/workers/imageWorker");

try {
    createImageWorker();
} catch (err) {
    console.warn("⚠️ Worker creation skipped:", err.message);
}

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));

// ✅ Log every request
app.use((req, res, next) => {
    console.log("REQUEST:", req.method, req.url);
    next();
});

// Serve Frontend & Uploaded Files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));

// API Routes
app.use("/api", uploadRoutes);
app.use("/api", statusRoutes);
app.use("/api", resultRoutes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error("❌ Express Error Handler:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});