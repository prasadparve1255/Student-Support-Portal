const express = require('express');
const { sendRegistrationEmail } = require('../utils/emailService');
const router = express.Router();

const { verifyToken } = require('../middleware/auth');

// Send registration email - requires auth token
// router.post('/send-registration-email', verifyToken, async (req, res) => {
//   try {
//     const { student } = req.body;
    
//     if (!student || !student.email || !student.name) {
//       return res.status(400).json({ error: 'Student data is required' });
//     }
    
//     await sendRegistrationEmail(student);
//     res.json({ message: 'Registration email sent successfully' });
//   } catch (error) {
//     console.error('Email sending failed:', error);
//     res.status(500).json({ error: 'Failed to send registration email' });
//   }
// });

router.post('/send-registration-email', verifyToken, async (req, res) => {
  try {
    const { student } = req.body;

    console.log("📧 Student Data:", student);

    if (!student || !student.email || !student.name) {
      return res.status(400).json({
        error: 'Student data is required'
      });
    }

    console.log("📨 Sending email to:", student.email);

    const result = await sendRegistrationEmail(student);

    console.log("✅ Email Sent:", result?.messageId);

    res.json({
      message: 'Registration email sent successfully'
    });

  } catch (error) {
    console.error('❌ Email sending failed:', error);

    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;