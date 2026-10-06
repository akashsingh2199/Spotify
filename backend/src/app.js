const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRouter = require("./router/auth.router");
const musicRouter = require("./router/music.router");
const dns = require("dns");

// Custom DNS servers to prevent SRV lookup timeouts on Windows/certain ISPs
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

// CORS configuration supporting credentials (cookies)
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date() });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/music", musicRouter);

// Centralized error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error"
    });
});

module.exports = app;
