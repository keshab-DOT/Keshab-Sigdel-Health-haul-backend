import nodemailer from "nodemailer";
import config from "../config/config.js";

export const sendVerificationCode = async (email, code) => {
  if (!email) throw new Error("Email recipient is missing");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
      user: config.smtp_mail,
      pass: config.smtp_password,
    },
  });

  const mailOptions = {
    from: config.smtp_mail,
    to: email,
    subject: "Verify your email",
    html: `<p>Your verification code is: <b>${code}</b></p>
           <p>This code will expire in 15 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};