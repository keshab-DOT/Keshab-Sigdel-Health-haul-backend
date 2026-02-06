import dotenv from "dotenv";
dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  mongoDBUrl: process.env.MONGODB_URL || "",
  name: process.env.NAME || "Health Haul",
  version: process.env.VERSION || "1.0.0",
  jwtSecret: process.env.JWT_SECRET || "", 

  smtp_mail: process.env.SMTP_MAIL || "",
  smtp_password: process.env.SMTP_PASSWORD || "",
};

export default config;
