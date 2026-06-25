const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';

/**
 * Generic email sending function
 * @param {string} to - Recipient's email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Skipping email sending.');
    return;
  }
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    console.log(`Email sent successfully to ${to} with subject "${subject}"`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error.message);
    // Don't throw error to avoid blocking the main process
  }
};

/**
 * Sends a registration email to a new student.
 */
exports.sendRegistrationEmail = async ({ name, email, studentId, originalPassword, department, className }) => {
  const subject = 'Welcome to Student Support Portal!';
  const html = `
    <h2>Welcome, ${name}!</h2>
    <p>Your account has been created on the Student Support Portal.</p>
    <p>Here are your login details:</p>
    <ul>
      <li><strong>Student ID:</strong> ${studentId}</li>
      <li><strong>Password:</strong> ${originalPassword}</li>
      <li><strong>Department:</strong> ${department}</li>
      ${className ? `<li><strong>Class:</strong> ${className}</li>` : ''}
    </ul>
    <p>Please login and change your password immediately.</p>
  `;
  await sendEmail({ to: email, subject, html });
};

/**
 * Sends a password change confirmation email.
 */
exports.sendPasswordChangeEmail = async ({ name, email, role }) => {
  const subject = 'Your Password has been Changed';
  const html = `
    <h2>Hello, ${name}!</h2>
    <p>This is a confirmation that the password for your ${role} account has just been changed.</p>
    <p>If you did not make this change, please contact support immediately.</p>
  `;
  await sendEmail({ to: email, subject, html });
};

/**
 * Sends an email to a student when a new complaint is submitted.
 */
exports.sendComplaintSubmittedEmail = async ({ name, email, subject, complaintId, department }) => {
  const emailSubject = `Complaint Submitted: "${subject}"`;
  const html = `
    <h2>Hello, ${name}!</h2>
    <p>Your complaint has been successfully submitted.</p>
    <ul>
      <li><strong>Complaint ID:</strong> ${complaintId}</li>
      <li><strong>Subject:</strong> ${subject}</li>
      <li><strong>Department:</strong> ${department}</li>
    </ul>
    <p>You can track the status of your complaint in the portal.</p>
  `;
  await sendEmail({ to: email, subject: emailSubject, html });
};

/**
 * Sends an email to a student when their complaint status is updated.
 */
exports.sendComplaintStatusUpdateEmail = async ({ name, email, subject, complaintId, status, adminResponse }) => {
  const emailSubject = `Update on your complaint: "${subject}"`;
  const html = `
    <h2>Hello, ${name}!</h2>
    <p>The status of your complaint has been updated.</p>
    <ul>
      <li><strong>Complaint ID:</strong> ${complaintId}</li>
      <li><strong>New Status:</strong> ${status}</li>
    </ul>
    ${adminResponse ? `<p><strong>Admin's Response:</strong><br/>${adminResponse}</p>` : ''}
    <p>Please check the portal for more details.</p>
  `;
  await sendEmail({ to: email, subject: emailSubject, html });
};

/**
 * Notifies the main admin about a new student registration.
 */
exports.sendAdminNotificationEmail = async ({ student, admin }) => {
  const subject = 'New Student Registration';
  const html = `
    <h2>New Student Registered</h2>
    <p>A new student has been registered in the system:</p>
    <ul>
      <li><strong>Name:</strong> ${student.name}</li>
      <li><strong>Email:</strong> ${student.email}</li>
      <li><strong>Student ID:</strong> ${student.studentId}</li>
      <li><strong>Department:</strong> ${student.department}</li>
    </ul>
  `;
  await sendEmail({ to: admin.email, subject, html });
};