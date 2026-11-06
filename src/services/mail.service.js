// import nodemailer from "nodemailer";

// // connects web server and smtp server
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     type: "OAuth2",
//     user: process.env.GOOGLE_USER,
//     clientId: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
//   },
// });

// transporter
//   .verify()
//   .then(() => {
//     console.log("Email transporter is ready");
//   })
//   .catch((_) => {
//     console.log("Error in email transporter", _);
//   });

// export async function sendEmail({ to, subject, html, text }) {
//   await transporter.sendMail({
//     from: process.env.GOOGLE_USER,
//     to,
//     subject,
//     html,
//     text,
//   });
// }

import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});
export async function sendEmail({ to, subject, html, text }) {
  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent: html,
      textContent: text,
      sender: {
        name: "aether-ai",
        email: process.env.GOOGLE_USER,
      },
      to: [{ email: to }],
    });
    console.log(
      "Email sent successfully via Brevo:",
      result?.messageId || result,
    );
    return result;
  } catch (error) {
    console.error("Brevo email sending error:", error);
    throw new Error(error.message || "Failed to send email");
  }
}
