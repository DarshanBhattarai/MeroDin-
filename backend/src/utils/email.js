import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,          // smtp.gmail.com
  port: Number(process.env.EMAIL_PORT || 587), // TLS port
  secure: false,                          // false for TLS/STARTTLS
  auth: {
    user: process.env.EMAIL_USER,        // your Gmail
    pass: process.env.EMAIL_PASS,        // App password
  },
});

export const sendEmail = async ({ to, subject, html, text }) => {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER, // show proper sender
    to,
    subject,
    text,
    html,
  });

  console.log("Email sent: %s", info.messageId); // optional log for dev
  return info;
};
