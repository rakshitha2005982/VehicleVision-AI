const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

console.log("🚀 NEW SERVER RUNNING");

const uploadRoutes = require("./src/routes/uploadRoutes");
const statusRoutes = require("./src/routes/statusRoutes");
const resultRoutes = require("./src/routes/resultRoutes");

dotenv.config();

console.log("DB_USER =", process.env.DB_USER);
console.log("DB_HOST =", process.env.DB_HOST);
console.log("DB_NAME =", process.env.DB_NAME);

// Database Connection
require("./src/config/database");
require("./src/workers/imageWorker");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// ✅ Log every request
app.use((req, res, next) => {
    console.log("REQUEST:", req.method, req.url);
    next();
});

// Serve Frontend
app.use(express.static(path.join(__dirname, "public")));

// Home Page
app.get("/", (req, res) => {
    res.send("HELLO FRONTEND");
});

// API Routes
app.use("/api", uploadRoutes);
app.use("/api", statusRoutes);
app.use("/api", resultRoutes);

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});