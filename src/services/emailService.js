import sgMail from "@sendgrid/mail";
import config from "../config/config.js";

sgMail.setApiKey(config.sendgridApiKey);

export const sendVerificationCode = async (email, code) => {
  if (!email) throw new Error("Email recipient is missing");

  console.log("[Email] Sending to:", email);

  const msg = {
    to: email,
    from: config.emailFrom,
    subject: "Verify your email",
    html: `<p>Your verification code is: <b>${code}</b></p>
           <p>This code will expire in 15 minutes.</p>`,
  };

  await sgMail.send(msg);
  console.log("[Email] Sent successfully");
};