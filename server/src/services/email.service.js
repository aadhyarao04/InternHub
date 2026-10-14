import nodemailer from 'nodemailer';
import config from '../config/index.js';

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (config.email.user && config.email.pass) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass
      }
    });
  } else {
    // Development / mock fallback transporter
    transporter = {
      sendMail: async (mailOptions) => {
        console.log(`[EmailService DEV] Simulated Email to: ${mailOptions.to} | Subject: "${mailOptions.subject}"`);
        return { messageId: 'simulated-' + Date.now() };
      }
    };
  }

  return transporter;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const client = await getTransporter();
    const info = await client.sendMail({
      from: config.email.from,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`
    });
    return info;
  } catch (err) {
    console.warn(`[EmailService] Failed to send email to ${to}:`, err.message);
    return null;
  }
};

export default {
  sendEmail
};
