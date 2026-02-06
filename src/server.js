import express from "express";
import dotenv from "dotenv";
import http from "http";
import {connectDB} from './config/mongodb.js';
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";



dotenv.config();
const app = express();

app.use(express.json());

// --- Routes ---
app.use("/api/auth", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);



app.get("/", (_req, res) => {
  res.json({ name: process.env.NAME, version: process.env.VERSION, message: "Server is running" });
});

const PORT = process.env.PORT || 3000;
const startServer = async () => {
  try {
    await connectDB();
    http.createServer(app).listen(PORT, () =>
      console.log(`${process.env.NAME} running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
};
import config from "./config/config.js";
console.log("MongoDB URL:", config.mongoDBUrl);
console.log("JWT Secret:", config.jwtSecret);

startServer();
