// Email Notification Service
import nodemailer from 'nodemailer';

// Email Configuration
const config = {
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  from: process.env.SMTP_FROM || 'noreply@consultancy.com',
  fromName: process.env.SMTP_FROM_NAME || 'Consultancy Platform',
};

// Create transporter
let transporter = null;

/**
 * Initialize email transporter
 */
function getTransporter() {
  if (!transporter) {
    // Check if email is configured
    if (!config.auth.user || !config.auth.pass) {
      console.warn('⚠️  Email not configured - notifications will be logged only');
      return null;
    }

    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
  }
  return transporter;
}

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text content
 * @returns {Promise<Object>} Send result
 */
async function sendEmail({ to, subject, html, text }) {
  const transport = getTransporter();

  const mailOptions = {
    from: `"${config.fromName}" <${config.from}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
  };

  // If no transporter, log the email instead
  if (!transport) {
    console.log('📧 Email (not sent - SMTP not configured):');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    return { messageId: 'logged-only', logged: true };
  }

  try {
    const result = await transport.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}: ${subject}`);
    return result;
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    throw error;
  }
}

// ============================================
// EMAIL TEMPLATES
// ============================================

/**
 * Base email template
 */
function baseTemplate(content, title = 'Consultancy Platform') {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: #1e293b; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .footer { background: #f8fafc; padding: 20px 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .button { display: inline-block; background: #d4a853; color: #1e293b; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .button:hover { background: #c49a47; }
    .info-box { background: #f1f5f9; border-left: 4px solid #d4a853; padding: 15px; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Consultancy Platform</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Consultancy Platform. All rights reserved.</p>
      <p>123 Academic Lane, London, EC1A 1BB</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================

/**
 * Send contact form notification to admin
 */
export async function sendContactNotification(contact) {
  const content = `
    <h2>New Contact Form Submission</h2>
    <p>You have received a new message from the website contact form.</p>

    <div class="info-box">
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>
      ${contact.phone ? `<p><strong>Phone:</strong> ${contact.phone}</p>` : ''}
      ${contact.subject ? `<p><strong>Subject:</strong> ${contact.subject}</p>` : ''}
    </div>

    <h3>Message:</h3>
    <p style="white-space: pre-wrap; background: #f8fafc; padding: 15px; border-radius: 6px;">${contact.message}</p>

    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/contacts" class="button">View in Dashboard</a>
  `;

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@consultancy.com';

  return sendEmail({
    to: adminEmail,
    subject: `New Contact: ${contact.name} - ${contact.subject || 'General Inquiry'}`,
    html: baseTemplate(content, 'New Contact Submission'),
  });
}

/**
 * Send contact confirmation to user
 */
export async function sendContactConfirmation(contact) {
  const content = `
    <h2>Thank You for Contacting Us</h2>
    <p>Dear ${contact.name},</p>
    <p>We have received your message and will get back to you within 24 business hours.</p>

    <div class="info-box">
      <h3>Your Message:</h3>
      <p style="white-space: pre-wrap;">${contact.message}</p>
    </div>

    <p>If your matter is urgent, please don't hesitate to call us at <strong>+44 (0) 123 456 7890</strong>.</p>

    <p>Best regards,<br>The Consultancy Team</p>
  `;

  return sendEmail({
    to: contact.email,
    subject: 'Thank you for contacting Consultancy Platform',
    html: baseTemplate(content, 'Message Received'),
  });
}

/**
 * Send order confirmation to customer
 */
export async function sendOrderConfirmation(order, items) {
  const itemsHtml = items.map(item => `
    <tr>
      <td>${item.title || item.name}</td>
      <td>${item.quantity}</td>
      <td>£${parseFloat(item.price).toFixed(2)}</td>
      <td>£${parseFloat(item.total || item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const content = `
    <h2>Order Confirmation</h2>
    <p>Dear ${order.customerName},</p>
    <p>Thank you for your order! We have received your request and will be in touch shortly to confirm the details.</p>

    <div class="info-box">
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', { dateStyle: 'long' })}</p>
    </div>

    <h3>Order Details:</h3>
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
          <td colspan="3" style="text-align: right;"><strong>Estimated Total:</strong></td>
          <td><strong>£${parseFloat(order.total).toFixed(2)}</strong></td>
        </tr>
      </tfoot>
    </table>

    <p><em>Final pricing will be confirmed after consultation.</em></p>

    ${order.paymentUrl ? `<a href="${order.paymentUrl}" class="button">Make Payment</a>` : ''}

    <p>If you have any questions, please contact us at <a href="mailto:info@consultancy.com">info@consultancy.com</a>.</p>

    <p>Best regards,<br>The Consultancy Team</p>
  `;

  return sendEmail({
    to: order.customerEmail,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: baseTemplate(content, 'Order Confirmation'),
  });
}

/**
 * Send order notification to admin
 */
export async function sendOrderNotificationToAdmin(order, items) {
  const itemsHtml = items.map(item => `
    <tr>
      <td>${item.title || item.name}</td>
      <td>${item.quantity}</td>
      <td>£${parseFloat(item.price).toFixed(2)}</td>
    </tr>
  `).join('');

  const content = `
    <h2>New Order Received</h2>
    <p>A new order has been placed on the website.</p>

    <div class="info-box">
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Customer:</strong> ${order.customerName}</p>
      <p><strong>Email:</strong> <a href="mailto:${order.customerEmail}">${order.customerEmail}</a></p>
      ${order.customerPhone ? `<p><strong>Phone:</strong> ${order.customerPhone}</p>` : ''}
      <p><strong>Total:</strong> £${parseFloat(order.total).toFixed(2)}</p>
    </div>

    <h3>Items Ordered:</h3>
    <table>
      <thead>
        <tr>
          <th>Service</th>
          <th>Qty</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/orders" class="button">View Order</a>
  `;

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@consultancy.com';

  return sendEmail({
    to: adminEmail,
    subject: `New Order: ${order.orderNumber} - £${parseFloat(order.total).toFixed(2)}`,
    html: baseTemplate(content, 'New Order'),
  });
}

/**
 * Send order status update to customer
 */
export async function sendOrderStatusUpdate(order, newStatus) {
  const statusMessages = {
    confirmed: 'Your order has been confirmed and is being processed.',
    in_progress: 'Work on your order has begun.',
    completed: 'Your order has been completed. Thank you for your business!',
    cancelled: 'Your order has been cancelled. If you have any questions, please contact us.',
  };

  const content = `
    <h2>Order Status Update</h2>
    <p>Dear ${order.customerName},</p>
    <p>${statusMessages[newStatus.toLowerCase()] || `Your order status has been updated to: ${newStatus}`}</p>

    <div class="info-box">
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Status:</strong> ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1).replace('_', ' ')}</p>
    </div>

    <p>If you have any questions, please contact us at <a href="mailto:info@consultancy.com">info@consultancy.com</a>.</p>

    <p>Best regards,<br>The Consultancy Team</p>
  `;

  return sendEmail({
    to: order.customerEmail,
    subject: `Order ${order.orderNumber} - Status Update`,
    html: baseTemplate(content, 'Order Update'),
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(user, resetToken, resetUrl) {
  const content = `
    <h2>Password Reset Request</h2>
    <p>Dear ${user.name},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>

    <a href="${resetUrl}" class="button">Reset Password</a>

    <p>If you didn't request this, you can safely ignore this email. The link will expire in 1 hour.</p>

    <p style="color: #64748b; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:<br>${resetUrl}</p>

    <p>Best regards,<br>The Consultancy Team</p>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Password Reset Request - Consultancy Platform',
    html: baseTemplate(content, 'Password Reset'),
  });
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(user) {
  const content = `
    <h2>Welcome to Consultancy Platform!</h2>
    <p>Dear ${user.name},</p>
    <p>Thank you for creating an account with us. We're excited to have you on board!</p>

    <p>With your account, you can:</p>
    <ul>
      <li>Browse our services</li>
      <li>Place and track orders</li>
      <li>Access exclusive resources</li>
      <li>Contact our team directly</li>
    </ul>

    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">Visit Website</a>

    <p>If you have any questions, don't hesitate to reach out.</p>

    <p>Best regards,<br>The Consultancy Team</p>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Welcome to Consultancy Platform!',
    html: baseTemplate(content, 'Welcome'),
  });
}

export default {
  sendEmail,
  sendContactNotification,
  sendContactConfirmation,
  sendOrderConfirmation,
  sendOrderNotificationToAdmin,
  sendOrderStatusUpdate,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
