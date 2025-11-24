// backend/sendResumeEmail.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.RESUME_EMAIL_PORT || 5002;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for PDF attachments
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.post('/send-resume-email', async (req, res) => {
  const { 
    recipientEmail, 
    senderName, 
    message, 
    pdfData, 
    filename 
  } = req.body;

  // Validation
  if (!recipientEmail || !senderName || !pdfData || !filename) {
    return res.status(400).json({ 
      success: false,
      error: 'Missing required fields: recipientEmail, senderName, pdfData, filename' 
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(recipientEmail)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid email address' 
    });
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfData.split(',')[1] || pdfData, 'base64');

    // Email options
    const mailOptions = {
      from: `"${senderName} via CareerCatalyst" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `${senderName} has shared their resume with you`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(90deg, #16382C 0%, #225144 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }
            .message { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #225144; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; background: #225144; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
            .attachment-info { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📄 Resume Shared</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p><strong>${senderName}</strong> has shared their professional resume with you through CareerCatalyst.</p>
              
              ${message ? `
                <div class="message">
                  <h3>Personal Message:</h3>
                  <p>${message}</p>
                </div>
              ` : ''}
              
              <div class="attachment-info">
                <strong>📎 Attachment:</strong> ${filename}
                <br/>
                <small>The resume is attached as a PDF document to this email.</small>
              </div>
              
              <p>You can review the attached resume at your convenience.</p>
              
              <p style="margin-top: 30px;">Best regards,<br/>
              <strong>${senderName}</strong></p>
            </div>
            <div class="footer">
              <p>This email was sent via CareerCatalyst - AI-Powered Career Platform</p>
              <p>© ${new Date().getFullYear()} CareerCatalyst. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: filename,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Resume email sent successfully:', info.messageId);
    res.status(200).json({ 
      success: true, 
      message: 'Resume sent successfully!',
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('Error sending resume email:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to send email. Please try again.',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Resume Email Service' });
});

app.listen(PORT, () => {
  console.log(`Resume Email Server running on port ${PORT}`);
  console.log(`Email service: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
});

module.exports = app;
