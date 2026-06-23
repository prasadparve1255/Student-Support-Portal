const nodemailer = require('nodemailer');

const emailUser = (process.env.EMAIL_USER || '').trim();
const emailPass = (process.env.EMAIL_PASSWORD || '').replace(/\s/g, '');

if (!emailUser || !emailPass) {
  console.warn('⚠️ Email not configured: EMAIL_USER or EMAIL_PASSWORD missing');
} else {
  console.log('✅ Email configured for:', emailUser);
}

const createTransporter = () => nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: { user: emailUser, pass: emailPass },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  tls: { rejectUnauthorized: false }
});

const sendMail = async (options) => {
  const t = createTransporter();
  return t.sendMail({ ...options, from: emailUser });
};

const sendRegistrationEmail = async (student) => {
  try {
    const info = await sendMail({
      to: student.email,
      subject: 'Congratulations! You are registered to Student Support Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #333;">Welcome to Student Support Portal</h2>
          <p>Hello ${student.name},</p>
          <p>You have been successfully registered to the <strong>Student Support Portal</strong>.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Student ID:</strong> ${student.studentId}</p>
            <p><strong>Password:</strong> ${student.originalPassword || student.password}</p>
            <p><strong>Department:</strong> ${student.department}</p>
            ${student.className ? `<p><strong>Class:</strong> ${student.className}</p>` : ''}
          </div>
          <p style="color: #e74c3c; font-weight: bold;">⚠️ Please keep these credentials safe.</p>
          <p>Thank you,<br>Student Support Portal Team</p>
        </div>
      `
    });
    console.log('Registration email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Registration email error:', error.message);
    throw error;
  }
};

const sendAdminNotificationEmail = async (data) => {
  try {
    const { student, admin } = data;
    const info = await sendMail({
      to: admin.email,
      subject: 'New Student Registration Notification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #333;">New Student Registration</h2>
          <p>Hello ${admin.name || admin.username},</p>
          <p>A new student has been registered.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Name:</strong> ${student.name}</p>
            <p><strong>Email:</strong> ${student.email}</p>
            <p><strong>ID:</strong> ${student.studentId}</p>
            <p><strong>Department:</strong> ${student.department}</p>
          </div>
          <p>Thank you,<br>Student Support Portal</p>
        </div>
      `
    });
    console.log('Admin notification sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Admin notification error:', error.message);
    throw error;
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
          <p>Your complaint has been received.</p>
          <div style="background-color: #f0f4ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p><strong>ID:</strong> ${complaintId}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Department:</strong> ${department}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Status:</strong> Pending</p>
          </div>
          <p>Thank you,<br>Student Support Portal</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Complaint submitted email error:', error.message);
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
            <p><strong>Status:</strong> <span style="color:${color};font-weight:bold;">${status}</span></p>
            ${adminResponse ? `<p><strong>Admin Response:</strong> ${adminResponse}</p>` : ''}
          </div>
          <p>Thank you,<br>Student Support Portal</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Status update email error:', error.message);
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
          <p>You are the Admin for <strong>${department}</strong> department.</p>
          <div style="background-color: #f5f3ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          <p style="color:#e74c3c;font-weight:bold;">⚠️ Change your password after first login.</p>
          <p>Thank you,<br>Student Support Portal</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Dept admin welcome email error:', error.message);
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
          <p>Your password has been changed successfully.</p>
          <div style="background-color: #f0f4ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p><strong>Role:</strong> ${roleLabel}</p>
            <p><strong>New Password:</strong> <span style="font-family:monospace;font-size:16px;color:#1d4ed8;">${newPassword}</span></p>
          </div>
          <p style="color:#e74c3c;font-weight:bold;">⚠️ Keep this password safe.</p>
          <p>Thank you,<br>Student Support Portal Team</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Password change email error:', error.message);
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