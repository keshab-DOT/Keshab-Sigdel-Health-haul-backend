import express from "express";
import dotenv from "dotenv";
import http from "http";
import { connectDB } from "./config/mongodb.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { initSocket } from "./utils/socket.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "./config/config.js";
import khaltiRoutes   from "./routes/khaltiroutes.js";
import notificationRoutes  from "./routes/notificationroutes.js";
import ratingReviewRoutes from "./routes/ratingreviewroutes.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());
app.use(cookieParser());

// --- Routes ---
app.use("/api/auth",     userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart",     cartRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/chat",     chatRoutes);
app.use("/uploads",      express.static("uploads"));
app.use("/api/payment/khalti", khaltiRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", ratingReviewRoutes);

app.get("/", (_req, res) => {
  res.json({ name: process.env.NAME, version: process.env.VERSION, message: "Server is running" });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    // Use http.createServer so socket.io can attach to the same server
    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
};

console.log("MongoDB URL:", config.mongoDBUrl);
console.log("JWT Secret:", config.jwtSecret);

startServer();