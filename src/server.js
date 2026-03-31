import express from "express";
import dotenv from "dotenv";
import http from "http";
import { connectDB } from "./config/mongodb.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import khaltiRoutes from "./routes/khaltiRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import cookieParser from "cookie-parser";
import chatRoutes from "./routes/chatRoutes.js";
import ratingReviewRoutes from "./routes/ratingreviewRoutes.js";
import { initSocket } from "./utils/socket.js";
import cors from "cors";

// debuggig issue
const originalRoute = express.Router.prototype.route;
express.Router.prototype.route = function (path) {
  try {
    return originalRoute.call(this, path);
  } catch (err) {
    console.error(" BROKEN ROUTE PATH:", path);
    throw err;
  }
};

const originalUse = express.Router.prototype.use;
express.Router.prototype.use = function (...args) {
  try {
    return originalUse.apply(this, args);
  } catch (err) {
    console.error("❌ BROKEN USE PATH:", args[0]);
    throw err;
  }
};

dotenv.config();

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      "https://healthhaul.netlify.app",
      "http://localhost:3000",
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (!origin) return callback(null, true);

    if (allowed.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked origin:", origin);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// app.options("*", cors());

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
app.use("/uploads", express.static("uploads"));
app.use("/api/reviews", ratingReviewRoutes);

app.get("/", (_req, res) => res.json({ message: "HealthHaul API running" }));

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    const server = http.createServer(app);

    initSocket(server);

    server.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
};

startServer();