require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: { rejectUnauthorized: false }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Error:', error.message);
    console.error('Full error:', error);
  } else {
    console.log('✅ SMTP connection OK');
    // Test mail pathav
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test Email - Student Support Portal',
      text: 'Email working!'
    }, (err, info) => {
      if (err) console.error('❌ Send error:', err.message);
      else console.log('✅ Test email sent:', info.messageId);
      process.exit(0);
    });
  }
});
