// backend/send_candidate_email.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.EMAIL_PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/send-candidate-email', async (req, res) => {
  const { to, subject, body, company, jobTitle, candidateName } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ 
      success: false,
      error: 'Missing required fields: to, subject, body' 
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid email address' 
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Build professional HTML email with company branding
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(90deg, #004D40 0%, #00A389 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }
          .message-body { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .company-name { font-weight: bold; color: #00A389; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${company || 'CareerCatalyst'}</h1>
          </div>
          <div class="content">
            ${jobTitle ? `<p><strong>Regarding:</strong> ${jobTitle} Position</p>` : ''}
            <div class="message-body">${body}</div>
            ${company ? `<p style="margin-top: 30px;">Best regards,<br/><span class="company-name">${company}</span></p>` : ''}
          </div>
          <div class="footer">
            <p>This email was sent via CareerCatalyst - AI-Powered Career Platform</p>
            <p>© ${new Date().getFullYear()} CareerCatalyst. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${company || 'CareerCatalyst'}" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlBody,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Candidate email sent successfully:', info.messageId);
    res.status(200).json({ 
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error sending candidate email:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to send email. Please try again.',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Candidate Email Service' });
});

app.listen(PORT, () => {
  console.log(`Candidate Email Server running on port ${PORT}`);
  console.log(`Email service: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
});

module.exports = app;
