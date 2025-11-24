// backend/passwordReset.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.RESET_PORT || 5001;

app.use(cors());
app.use(express.json());

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Store OTPs temporarily (in production, use Redis or a database)
const otpStore = new Map();

// Generate random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate password strength
function validatePasswordStrength(password) {
  const minLength = 8;
  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Send OTP to email
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check if user exists in Firebase Authentication
    let userExists = false;
    try {
      await admin.auth().getUserByEmail(email);
      userExists = true;
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    if (!userExists) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiration (10 minutes)
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"CareerCatalyst" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP - CareerCatalyst',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #004D40; margin: 0;">CareerCatalyst</h1>
          </div>
          
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Hello,
          </p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Use the following OTP to reset your password:
          </p>
          
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0;">
            <h1 style="color: #00A389; margin: 0; font-size: 36px; letter-spacing: 8px;">${otp}</h1>
          </div>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            This OTP will expire in <strong>10 minutes</strong>.
          </p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            If you did not request a password reset, please ignore this email or contact support if you have concerns.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          
          <p style="color: #999; font-size: 14px; text-align: center;">
            This is an automated email from CareerCatalyst. Please do not reply.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully to your email' 
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
});

// Verify OTP only (without resetting password)
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  try {
    // Check if OTP exists and is valid
    const storedData = otpStore.get(email);
    
    if (!storedData) {
      return res.status(400).json({ error: 'OTP not found or expired. Please request a new one.' });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP. Please check and try again.' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'OTP verified successfully' 
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP. Please try again.' });
  }
});

// Resend OTP to email
app.post('/resend-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check if user exists in Firebase Authentication
    let userExists = false;
    try {
      await admin.auth().getUserByEmail(email);
      userExists = true;
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    if (!userExists) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    // Generate new OTP
    const otp = generateOTP();
    
    // Store OTP with expiration (10 minutes)
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"CareerCatalyst" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP (Resent) - CareerCatalyst',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #004D40; margin: 0;">CareerCatalyst</h1>
          </div>
          
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request (Resent)</h2>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Hello,
          </p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            As requested, here is your new OTP to reset your password:
          </p>
          
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0;">
            <h1 style="color: #00A389; margin: 0; font-size: 36px; letter-spacing: 8px;">${otp}</h1>
          </div>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            This OTP will expire in <strong>10 minutes</strong>.
          </p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            If you did not request a password reset, please ignore this email or contact support if you have concerns.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          
          <p style="color: #999; font-size: 14px; text-align: center;">
            This is an automated email from CareerCatalyst. Please do not reply.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      success: true, 
      message: 'OTP resent successfully to your email' 
    });

  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ error: 'Failed to resend OTP. Please try again.' });
  }
});

// Verify OTP and reset password
app.post('/verify-otp-and-reset', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(newPassword);
  if (!passwordValidation.isValid) {
    return res.status(400).json({ 
      error: 'Password does not meet security requirements',
      requirements: passwordValidation.errors
    });
  }

  try {
    // Check if OTP exists and is valid
    const storedData = otpStore.get(email);
    
    if (!storedData) {
      return res.status(400).json({ error: 'OTP not found or expired. Please request a new one.' });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP. Please check and try again.' });
    }

    // Get user from Firebase Auth
    const user = await admin.auth().getUserByEmail(email);

    // Update password in Firebase Authentication
    await admin.auth().updateUser(user.uid, {
      password: newPassword,
    });

    // Delete used OTP
    otpStore.delete(email);

    // Send password change confirmation email
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const confirmationMailOptions = {
        from: `"CareerCatalyst" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Changed Successfully - CareerCatalyst',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #004D40; margin: 0;">CareerCatalyst</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Password Changed Successfully</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Hello,
            </p>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              This is to confirm that your password has been successfully changed on <strong>${new Date().toLocaleString()}</strong>.
            </p>
            
            <div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #00A389; border-radius: 4px; margin: 20px 0;">
              <p style="color: #2e7d32; margin: 0; font-size: 16px;">
                ✓ Your account is now secured with your new password.
              </p>
            </div>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              If you did not make this change or if you believe an unauthorized person has accessed your account, please contact our support team immediately.
            </p>
            
            <div style="background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; border-radius: 4px; margin: 20px 0;">
              <p style="color: #e65100; margin: 0; font-size: 14px;">
                <strong>Security Tip:</strong> Never share your password with anyone and use a strong, unique password for your account.
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              This is an automated email from CareerCatalyst. Please do not reply.
            </p>
          </div>
        `,
      };

      await transporter.sendMail(confirmationMailOptions);
      console.log('Password change confirmation email sent to:', email);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the request if email fails, password was already reset
    }

    res.status(200).json({ 
      success: true, 
      message: 'Password reset successfully' 
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password. Please try again.' });
  }
});

// Send account deletion notification email
app.post('/send-deletion-notification', async (req, res) => {
  const { email, userName } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"CareerCatalyst" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Account Deleted - CareerCatalyst',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #004D40; margin: 0;">CareerCatalyst</h1>
          </div>
          
          <h2 style="color: #333; margin-bottom: 20px;">Account Deletion Confirmation</h2>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Hello ${userName || 'User'},
          </p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            This email confirms that your CareerCatalyst account has been successfully deleted on <strong>${new Date().toLocaleString()}</strong>.
          </p>
          
          <div style="background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; border-radius: 4px; margin: 20px 0;">
            <p style="color: #e65100; margin: 0; font-size: 16px;">
              ⚠️ All your data, including profile information, resumes, job applications, and saved jobs have been permanently removed from our system.
            </p>
          </div>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            If you did not request this account deletion or believe this was done in error, please contact our support team immediately at <a href="mailto:${process.env.EMAIL_USER}" style="color: #00A389;">${process.env.EMAIL_USER}</a>.
          </p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            We're sorry to see you go. If you decide to return in the future, you're always welcome to create a new account.
          </p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Thank you for using CareerCatalyst.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          
          <p style="color: #999; font-size: 14px; text-align: center;">
            This is an automated email from CareerCatalyst. Please do not reply.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      success: true, 
      message: 'Deletion notification email sent successfully' 
    });

  } catch (error) {
    console.error('Error sending deletion notification:', error);
    res.status(500).json({ error: 'Failed to send deletion notification. Please contact support.' });
  }
});

// Cleanup expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(email);
    }
  }
}, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Password reset server running on port ${PORT}`);
  console.log(`Send OTP endpoint: http://localhost:${PORT}/send-otp`);
  console.log(`Verify OTP endpoint: http://localhost:${PORT}/verify-otp`);
  console.log(`Resend OTP endpoint: http://localhost:${PORT}/resend-otp`);
  console.log(`Verify OTP and reset password endpoint: http://localhost:${PORT}/verify-otp-and-reset`);
  console.log(`Send deletion notification endpoint: http://localhost:${PORT}/send-deletion-notification`);
});

module.exports = app;
