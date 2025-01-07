const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const { apiV1 } = require("./routes");
const { connectDb } = require("./db");
const { UserModel } = require("./models/user");
const bcrypt = require("bcrypt");

const app = express();
const port = process.env.PORT || 5000;

// Configure CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Other Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Test Route (keep this before other middleware for now)
app.get("/test", (req, res) => {
  console.log("Test route called");
  res.status(200).json({ message: "Test route working!" });
});

// Root Route
app.get("/", (req, res) => {
  res.send("Welcome to the Library Management API!");
});

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Add the secret option from .env
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
    resave: false,
  })
);

// API Routes
app.use("/v1", apiV1);

// 404 Not Found Handler
app.use((req, res) => {
  return res.status(404).json({ error: "Route not found" });
});

// Enhanced Error Handler (with logging for development)
// app.js
app.use((err, req, res, next) => {
  console.error("Error Message:", err.message);
  console.error("Stack Trace:", err.stack);

  // Send detailed error information (for debugging only!)
  return res.status(500).json({
    error: "Unknown server error",
    message: err.message,
    stack: err.stack
  });
});
// Connect to MongoDB and Start Server
connectDb()
  .then(async () => {
    try {
      const saltRounds = 10;

      const admin = await UserModel.findOne({ username: "admin" });
      if (!admin) {
        const hashedPassword = await bcrypt.hash("admin", saltRounds);
        await UserModel.create({
          username: "admin",
          password: hashedPassword,
          role: "admin",
        });
        console.log("Admin user created.");
      }

      const guest = await UserModel.findOne({ username: "guest" });
      if (!guest) {
        const hashedPassword = await bcrypt.hash("guest", saltRounds);
        await UserModel.create({
          username: "guest",
          password: hashedPassword,
          role: "guest",
        });
        console.log("Guest user created.");
      }
    } catch (err) {
      console.error("Error creating default users:", err);
      process.exit(1);
    }

    console.log("Starting server...");
    app.listen(port, () => console.log(`Server is listening on ${port}`));
  })
  .catch((err) => {
    console.error("Failed to connect to database", err);
    process.exit(1);
  });