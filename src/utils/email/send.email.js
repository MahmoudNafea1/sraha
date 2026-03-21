import nodemailer from "nodemailer";
export async function sendEmail({
  from = process.env.APP_EMAIL,
  to = "",
  cc = "",
  bcc = "",
  text = "",
  html = "",
  subject = "saraha",
  attachments = [],
} = {}) {
  // Create a transporter using Ethereal test credentials.
  // For production, replace with your actual SMTP server details.
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: `"Sarsha" <${from}>`,
    to,
    cc,
    bcc,
    text,
    html,
    subject,
    attachments,
  });
}
