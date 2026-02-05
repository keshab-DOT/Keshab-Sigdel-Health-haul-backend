import express from "express"
import connectDB from "./config/mongodb.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import userRoutes from "./routes/userRoutes.js"
import cors from "cors"

import dotenv from "dotenv"
dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

//
app.use(cors({
    origin: "http://localhost:3003", // URL
    credentials: true // Allow cookies
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./storage"));

app.use(session({
    secret: process.env.SESSION_SECRET || "supersecretkeygoeshere",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 ccday
        httpOnly: true,
        secure: false // Set to true in production with HTTPS
    }
}));

connectDB()

//Routes

app.use("/api", userRoutes)


app.listen(PORT, () => {
    console.log(`Server is running on  the port ${PORT}`)
})
