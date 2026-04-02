import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import express from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/mongodb.js";
import { initSocket } from "./utils/socket.js";

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import khaltiRoutes from "./routes/khaltiRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import ratingReviewRoutes from "./routes/ratingreviewRoutes.js";

dotenv.config();

const app = express();

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const allowed = [
    "http://localhost:5173",
    "http://localhost:3000",
    process.env.FRONTEND_URL,
  ].filter(Boolean);
  return allowed.includes(origin);
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        console.warn("Blocked origin:", origin);
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment/khalti", khaltiRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", ratingReviewRoutes);

app.use("/uploads", express.static("uploads"));

app.get("/", (_req, res) => {
  res.json({ message: "HealthHaul API running" });
});

app.use((err, _req, res, _next) => {
  console.error("Error:", err.message);
  res.status(500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    const server = http.createServer(app);
    const io = initSocket(server);
    app.set("io", io);
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
};

startServer();