import nodemailer from 'nodemailer';
import config from '../config/env.js';
import logger from '../utils/logger.js';

// Create transporter based on environment
let transporter;

if (config.nodeEnv === 'production' && config.sendgridApiKey) {
  // Production: Use SendGrid
  transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
      user: 'apikey',
      pass: config.sendgridApiKey,
    },
  });
} else {
  // Development: Use Ethereal (fake SMTP for testing)
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'test@ethereal.email',
      pass: 'testpassword',
    },
  });
}

// Base email template
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .button:hover { background: #1d4ed8; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .info-box { background: #f8fafc; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8fafc; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    ${content}
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${config.emailFromName}. All rights reserved.</p>
      <p>This is an automated message. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
`;

// Send email helper
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"${config.emailFromName}" <${config.emailFrom}>`,
      to,
      subject,
      html: baseTemplate(html),
    });

    logger.info(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Contact form notification to admin
export const sendContactNotification = async (contact) => {
  const html = `
    <div class="header">
      <h1>New Contact Submission</h1>
    </div>
    <div class="content">
      <p>You have received a new contact form submission:</p>
      <div class="info-box">
        <p><strong>Name:</strong> ${contact.name}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
        ${contact.phone ? `<p><strong>Phone:</strong> ${contact.phone}</p>` : ''}
        ${contact.subject ? `<p><strong>Subject:</strong> ${contact.subject}</p>` : ''}
      </div>
      <h3>Message:</h3>
      <p style="white-space: pre-wrap;">${contact.message}</p>
      <a href="${config.corsOrigin}/admin/messages" class="button">View in Dashboard</a>
    </div>
  `;

  return sendEmail(config.adminEmail, `New Contact: ${contact.name}`, html);
};

// Contact form confirmation to user
export const sendContactConfirmation = async (contact) => {
  const html = `
    <div class="header">
      <h1>Thank You for Contacting Us</h1>
    </div>
    <div class="content">
      <p>Dear ${contact.name},</p>
      <p>Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.</p>
      <div class="info-box">
        <p><strong>Your message:</strong></p>
        <p style="white-space: pre-wrap;">${contact.message}</p>
      </div>
      <p>If you have any urgent questions, please don't hesitate to call us directly.</p>
      <p>Best regards,<br>The ${config.emailFromName} Team</p>
    </div>
  `;

  return sendEmail(contact.email, 'We received your message', html);
};

// Order confirmation
export const sendOrderConfirmation = async (order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td>${item.service?.title || 'Service'}</td>
      <td>${item.quantity}</td>
      <td>£${item.price.toFixed(2)}</td>
      <td>£${item.total.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div class="header">
      <h1>Order Confirmation</h1>
    </div>
    <div class="content">
      <p>Dear ${order.customerName},</p>
      <p>Thank you for your order! Here are your order details:</p>

      <div class="info-box">
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'long', year: 'numeric'
        })}</p>
      </div>

      <h3>Order Items</h3>
      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
            <td>£${order.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right;"><strong>Tax:</strong></td>
            <td>£${order.tax.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
            <td><strong>£${order.total.toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>

      ${order.paymentUrl ? `<a href="${order.paymentUrl}" class="button">Pay Now</a>` : ''}

      <p>If you have any questions about your order, please don't hesitate to contact us.</p>
      <p>Best regards,<br>The ${config.emailFromName} Team</p>
    </div>
  `;

  return sendEmail(order.customerEmail, `Order Confirmation - ${order.orderNumber}`, html);
};

// Order status update
export const sendOrderStatusUpdate = async (order, oldStatus) => {
  const statusMessages = {
    CONFIRMED: 'Your order has been confirmed and is being processed.',
    IN_PROGRESS: 'We have started working on your order.',
    COMPLETED: 'Your order has been completed. Thank you for your business!',
    CANCELLED: 'Your order has been cancelled. If you have any questions, please contact us.',
  };

  const html = `
    <div class="header">
      <h1>Order Status Update</h1>
    </div>
    <div class="content">
      <p>Dear ${order.customerName},</p>
      <p>${statusMessages[order.status] || `Your order status has been updated to: ${order.status}`}</p>

      <div class="info-box">
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Previous Status:</strong> ${oldStatus}</p>
        <p><strong>New Status:</strong> ${order.status}</p>
      </div>

      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>The ${config.emailFromName} Team</p>
    </div>
  `;

  return sendEmail(order.customerEmail, `Order Update - ${order.orderNumber}`, html);
};

// Password reset email
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${config.corsOrigin}/reset-password?token=${resetToken}`;

  const html = `
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Dear ${user.name},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>

      <a href="${resetUrl}" class="button">Reset Password</a>

      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this password reset, you can safely ignore this email.</p>
      <p>Best regards,<br>The ${config.emailFromName} Team</p>
    </div>
  `;

  return sendEmail(user.email, 'Password Reset Request', html);
};

// Welcome email
export const sendWelcomeEmail = async (user) => {
  const html = `
    <div class="header">
      <h1>Welcome to ${config.emailFromName}!</h1>
    </div>
    <div class="content">
      <p>Dear ${user.name},</p>
      <p>Welcome aboard! We're thrilled to have you join us.</p>
      <p>Your account has been successfully created. You can now:</p>
      <ul>
        <li>Browse our services</li>
        <li>Place orders</li>
        <li>Track your order history</li>
      </ul>

      <a href="${config.corsOrigin}" class="button">Explore Our Services</a>

      <p>If you have any questions, feel free to reach out to us.</p>
      <p>Best regards,<br>The ${config.emailFromName} Team</p>
    </div>
  `;

  return sendEmail(user.email, `Welcome to ${config.emailFromName}!`, html);
};

export default {
  sendContactNotification,
  sendContactConfirmation,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
