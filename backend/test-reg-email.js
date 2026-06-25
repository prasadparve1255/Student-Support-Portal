require('dotenv').config();
const nodemailer = require('nodemailer');

const emailPass = process.env.EMAIL_PASSWORD.replace(/\s/g, '');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('PASSWORD (no spaces):', emailPass);
console.log('PASSWORD length:', emailPass.length);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: emailPass
  },
  tls: { rejectUnauthorized: false }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Error:', error.message);
    process.exit(1);
  }
  console.log('✅ SMTP OK - Sending test registration email...');
  
  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'Test: Student Registration Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #333;">Welcome to Student Support Portal</h2>
        <p>Hello <strong>Test Student</strong>,</p>
        <p>You have been successfully registered.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Student ID:</strong> 26CS01</p>
          <p><strong>Password:</strong> Prasad@123</p>
          <p><strong>Department:</strong> Computer Science</p>
        </div>
        <p style="color: #e74c3c; font-weight: bold;">Please keep these credentials safe.</p>
        <p>Thank you,<br>Student Support Portal Team</p>
      </div>
    `
  }, (err, info) => {
    if (err) {
      console.error('❌ Send failed:', err.message);
    } else {
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', info.messageId);
      console.log('Response:', info.response);
    }
    process.exit(0);
  });
});
