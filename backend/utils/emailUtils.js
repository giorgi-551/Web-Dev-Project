import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "The mail we create",
      to,
      subject,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export const sendRegistrationConfirmation = async (email, eventTitle, ticketCode) => {
  const htmlContent = `
    <h2>Event Registration Confirmed!</h2>
    <p>Thank you for registering for <strong>${eventTitle}</strong></p>
    <p>Your ticket code: <strong>${ticketCode}</strong></p>
    <p>Please keep this code safe for check-in.</p>
  `;
  return sendEmail(email, `Registration Confirmation - ${eventTitle}`, htmlContent);
};

export const sendPaymentReceipt = async (email, eventTitle, amount) => {
  const htmlContent = `
    <h2>Payment Receipt</h2>
    <p>Thank you for your payment for <strong>${eventTitle}</strong></p>
    <p>Amount: <strong>$${amount}</strong></p>
    <p>Your registration is now complete.</p>
  `;
  return sendEmail(email, `Payment Receipt - ${eventTitle}`, htmlContent);
};