const express = require("express");
const cors = require("cors");

const module4Routes = require("./routes/module4Routes");

const app = express();


// ===============================
// Global Middleware
// ===============================

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ===============================
// Health Check
// ===============================

app.get("/api/health", (req, res) => {

    return res.status(200).json({
        success: true,
        message: "IN-Track Module 4 API is running"
    });

});


// ===============================
// Module 4 Routes
// ===============================

app.use(
    "/api/module4",
    module4Routes
);


// ===============================
// 404 Handler
// ===============================

app.use((req, res) => {

    return res.status(404).json({
        success: false,
        message: "Route not found"
    });

});


// ===============================
// Global Error Handler
// ===============================

app.use((err, req, res, next) => {

    console.error(
        "Unhandled application error:",
        err
    );

    return res.status(
        err.status || 500
    ).json({
        success: false,
        message:
            err.message ||
            "Internal server error"
    });

});


module.exports = app;
