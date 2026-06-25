const nodemailer = require('nodemailer');
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASSWORD EXISTS =",
  !!process.env.EMAIL_PASSWORD
);

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Error:", error);
  } else {
    console.log("✅ SMTP Ready");
  }
});

const sendMail = async ({ to, subject, html }) => {
  const info = await transporter.sendMail({
    from: `"Student Support Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
  return info;
};

const sendRegistrationEmail = async (student) => {
  try {
    const info = await sendMail({
      to: student.email,
      subject: 'Welcome! You are registered to Student Support Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2563eb;">Welcome to Student Support Portal 🎓</h2>
          <p>Hello <strong>${student.name}</strong>,</p>
          <p>You have been successfully registered. Here are your login credentials:</p>
          <div style="background-color: #f0f4ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p><strong>Student ID:</strong> ${student.studentId}</p>
            <p><strong>Password:</strong> ${student.originalPassword || student.password}</p>
            <p><strong>Department:</strong> ${student.department}</p>
            ${student.className ? `<p><strong>Class:</strong> ${student.className}</p>` : ''}
          </div>
          <p style="color: #e74c3c; font-weight: bold;">⚠️ Please keep these credentials safe and change your password after first login.</p>
          <p>Thank you,<br>Student Support Portal Team</p>
        </div>
      `,
    });
    console.log('✅ Registration email sent to:', student.email, info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Registration email error:', error.message);
    throw error;
  }
};

const sendAdminNotificationEmail = async (data) => {
  try {
    const { student, admin } = data;
    await sendMail({
      to: admin.email,
      subject: 'New Student Registration Notification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333;">New Student Registered</h2>
          <p>Hello ${admin.name || admin.username},</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Name:</strong> ${student.name}</p>
            <p><strong>Email:</strong> ${student.email}</p>
            <p><strong>Student ID:</strong> ${student.studentId}</p>
            <p><strong>Department:</strong> ${student.department}</p>
          </div>
          <p>Thank you,<br>Student Support Portal</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('❌ Admin notification email error:', error.message);
  }
};

const sendComplaintSubmittedEmail = async ({ name, email, subject, complaintId, department, category }) => {
  try {
    await sendMail({
      to: email,
      subject: `Complaint Received: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2563eb;">Complaint Submitted ✅</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your complaint has been received and is being reviewed.</p>
          <div style="background-color: #f0f4ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p><strong>Complaint ID:</strong> ${complaintId}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Department:</strong> ${department}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Status:</strong> Pending</p>
          </div>
          <p>Thank you,<br>Student Support Portal</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('❌ Complaint submitted email error:', error.message);
  }
};

const sendComplaintStatusUpdateEmail = async ({ name, email, subject, complaintId, status, adminResponse }) => {
  const colors = { 'Pending': '#f97316', 'In Progress': '#2563eb', 'Resolved': '#16a34a' };
  const color = colors[status] || '#6b7280';
  try {
    await sendMail({
      to: email,
      subject: `Complaint Update: ${subject} — ${status}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: ${color};">Complaint Status Updated</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>New Status:</strong> <span style="color:${color};font-weight:bold;">${status}</span></p>
            ${adminResponse ? `<p><strong>Admin Response:</strong> ${adminResponse}</p>` : ''}
          </div>
          <p>Thank you,<br>Student Support Portal</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('❌ Status update email error:', error.message);
  }
};

const sendDepartmentAdminWelcomeEmail = async ({ name, email, username, password, department }) => {
  try {
    await sendMail({
      to: email,
      subject: `Welcome! You are assigned as ${department} Department Admin`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #7c3aed;">Welcome, Department Admin! 🎓</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>You have been assigned as the Admin for <strong>${department}</strong> department.</p>
          <div style="background-color: #f5f3ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          <p style="color:#e74c3c;font-weight:bold;">⚠️ Please change your password after first login.</p>
          <p>Thank you,<br>Student Support Portal</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('❌ Dept admin welcome email error:', error.message);
  }
};

const sendPasswordChangeEmail = async ({ name, email, newPassword, role }) => {
  const roleLabel = role === 'MAIN_ADMIN' ? 'Main Admin' : role === 'DEPARTMENT_ADMIN' ? 'Department Admin' : 'Student';
  try {
    await sendMail({
      to: email,
      subject: 'Your Password Has Been Changed — Student Support Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2563eb;">Password Changed 🔐</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <div style="background-color: #f0f4ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p><strong>Role:</strong> ${roleLabel}</p>
            <p><strong>New Password:</strong> <span style="font-family:monospace;font-size:16px;color:#1d4ed8;">${newPassword}</span></p>
          </div>
          <p style="color:#e74c3c;font-weight:bold;">⚠️ Keep this password safe.</p>
          <p>Thank you,<br>Student Support Portal Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('❌ Password change email error:', error.message);
  }
};

module.exports = {
  sendRegistrationEmail,
  sendAdminNotificationEmail,
  sendComplaintSubmittedEmail,
  sendComplaintStatusUpdateEmail,
  sendDepartmentAdminWelcomeEmail,
  sendPasswordChangeEmail,
};
