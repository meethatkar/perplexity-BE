import nodemailer from "nodemailer";

// connects web server and smtp server
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GOOGLE_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

transporter
  .verify()
  .then(() => {
    console.log("Email transporter is ready");
  })
  .catch((_) => {
    console.log("Error in email transporter");
  });

export async function sendEmail({ to, subject, html, text }) {
  await transporter.sendMail({
    from: process.env.GOOGLE_USER,
    to,
    subject,
    html,
    text,
  });
}
