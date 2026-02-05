import { Resend } from "resend";
import config from "../config/config.js";

async function sendEmail(recipient, subject, message) {
  try {
    const resend = new Resend(config.resendEmailApiKey);

    const { data, error } = await resend.emails.send({
      from: "randomname.co@gmail.com", 
      to: [recipient],
      subject,
      html: body,
    });

    if (error) {
      console.error("Email error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: err };
  }
}

export { sendEmail };