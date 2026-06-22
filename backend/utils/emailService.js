const nodemailer = require('nodemailer');

// Create a transporter object
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Validate email configuration
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.warn('Email service not configured. Set EMAIL_USER and EMAIL_PASSWORD environment variables.');
}

/**
 * Send registration email to student
 * @param {Object} student - Student object with name, email, studentId, and password
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendRegistrationEmail = async (student) => {
  try {
    // Email content for student
    const studentMailOptions = {
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: 'Congratulations! You are registered to Student Support Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #333;">Welcome to Student Support Portal</h2>
          <p>Hello ${student.name},</p>
          <p>Congratulations! You have been successfully registered to the <strong>Student Support Portal</strong>.</p>
          <p>Here are your login credentials:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Student ID:</strong> ${student.studentId}</p>
            <p><strong>Password:</strong> ${student.originalPassword || student.password}</p>
            <p><strong>Department:</strong> ${student.department}</p>
            ${student.className ? `<p><strong>Class:</strong> ${student.className}</p>` : ''}
          </div>
          <p style="color: #e74c3c; font-weight: bold;">⚠️ Please keep these credentials safe and do not share them with anyone.</p>
          <p>Please login using these credentials. If you have any complaints, you can submit them through the portal.</p>
          <p>Thank you,<br>Student Support Portal Team</p>
        </div>
      `
    };

    // Send email to student
    const studentInfo = await transporter.sendMail(studentMailOptions);
    console.log('Registration email sent to student:', studentInfo.messageId);
    
    return studentInfo;
  } catch (error) {
    console.error('Error sending registration email to student:', error);
    throw error;
  }
};

/**
 * Send notification email to admin
 * @param {Object} data - Contains student and admin information
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendAdminNotificationEmail = async (data) => {
  try {
    const { student, admin } = data;
    
    // Email content for admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: admin.email,
      subject: 'New Student Registration Notification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #333;">New Student Registration</h2>
          <p>Hello ${admin.name || admin.username},</p>
          <p>A new student has been registered to the <strong>Student Support Portal</strong>.</p>
          <p>Student details:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Name:</strong> ${student.name}</p>
            <p><strong>Email:</strong> ${student.email}</p>
            <p><strong>ID:</strong> ${student.studentId}</p>
            <p><strong>Department:</strong> ${student.department}</p>
          </div>
          <p>The student has been notified with their login credentials.</p>
          <p>Thank you,<br>Student Support Portal</p>
        </div>
      `
    };

    // Send email to admin
    const adminInfo = await transporter.sendMail(adminMailOptions);
    console.log('Notification email sent to admin:', adminInfo.messageId);
    
    return adminInfo;
  } catch (error) {
    console.error('Error sending notification email to admin:', error);
    throw error;
  }
};

/**
 * Send email to student when complaint is submitted
 */
const sendComplaintSubmittedEmail = async ({ name, email, subject, complaintId, department, category }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Complaint Received: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2563eb;">Complaint Submitted Successfully ✅</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your complaint has been received and will be reviewed shortly.</p>
          <div style="background-color: #f0f4ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p><strong>Complaint ID:</strong> ${complaintId}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Department:</strong> ${department}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Status:</strong> <span style="color: #f97316;">Pending</span></p>
          </div>
          <p>You will receive an email when the status is updated.</p>
          <p>Thank you,<br>Student Support Portal</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Error sending complaint submitted email:', error.message);
  }
};

/**
 * Send email to student when admin updates complaint status
 */
const sendComplaintStatusUpdateEmail = async ({ name, email, subject, complaintId, status, adminResponse }) => {
  const statusColors = {
    'Pending': '#f97316',
    'In Progress': '#2563eb',
    'Resolved': '#16a34a',
  };
  const color = statusColors[status] || '#6b7280';

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Complaint Update: ${subject} — ${status}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: ${color};">Complaint Status Updated</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your complaint status has been updated.</p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p><strong>Complaint ID:</strong> ${complaintId}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>New Status:</strong> <span style="color: ${color}; font-weight: bold;">${status}</span></p>
            ${adminResponse ? `<p><strong>Admin Response:</strong> ${adminResponse}</p>` : ''}
          </div>
          <p>Login to the portal to view full details.</p>
          <p>Thank you,<br>Student Support Portal</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Error sending status update email:', error.message);
  }
};

/**
 * Send welcome email to new Department Admin
 */
const sendDepartmentAdminWelcomeEmail = async ({ name, email, username, password, department }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Welcome! You are assigned as ${department} Department Admin`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #7c3aed;">Welcome, Department Admin! 🎓</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>You have been assigned as the Admin for <strong>${department}</strong> department in the <strong>Student Support Portal</strong>.</p>
          <div style="background-color: #f5f3ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p><strong>Department:</strong> ${department}</p>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          <p style="color: #e74c3c; font-weight: bold;">⚠️ Please keep these credentials safe and change your password after first login.</p>
          <p>You can now login and manage student complaints for your department.</p>
          <p>Thank you,<br>Student Support Portal</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Error sending department admin welcome email:', error.message);
  }
};

module.exports = {
  sendRegistrationEmail,
  sendAdminNotificationEmail,
  sendComplaintSubmittedEmail,
  sendComplaintStatusUpdateEmail,
  sendDepartmentAdminWelcomeEmail,
};