const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
    static async sendComplaintNotification(to, complaintData) {
        const msg = {
            to,
            from: process.env.FROM_EMAIL,
            subject: `Complaint Status Update: ${complaintData.subject}`,
            html: `
                <h2>Complaint Status Update</h2>
                <p>Your complaint regarding "${complaintData.subject}" has been updated.</p>
                <p><strong>Current Status:</strong> ${complaintData.status}</p>
                ${complaintData.adminResponse ? `<p><strong>Admin Response:</strong> ${complaintData.adminResponse}</p>` : ''}
                <p><strong>Department:</strong> ${complaintData.department}</p>
                <hr>
                <p>This is an automated message. Please do not reply to this email.</p>
            `
        };

        try {
            await sgMail.send(msg);
            return true;
        } catch (error) {
            console.error('Email sending failed:', error);
            return false;
        }
    }

    static async sendWelcomeEmail(to, userData) {
        const msg = {
            to,
            from: process.env.FROM_EMAIL,
            subject: 'Welcome to Digital Complaint System',
            html: `
                <h2>Welcome ${userData.name}!</h2>
                <p>Your account has been successfully created in the Digital Complaint System.</p>
                <p><strong>Your Details:</strong></p>
                <ul>
                    <li>Name: ${userData.name}</li>
                    <li>Email: ${userData.email}</li>
                    ${userData.studentId ? `<li>Student ID: ${userData.studentId}</li>` : ''}
                    ${userData.department ? `<li>Department: ${userData.department}</li>` : ''}
                </ul>
                <p>You can now login to the system and start submitting complaints.</p>
                <hr>
                <p>This is an automated message. Please do not reply to this email.</p>
            `
        };

        try {
            await sgMail.send(msg);
            return true;
        } catch (error) {
            console.error('Email sending failed:', error);
            return false;
        }
    }

    static async sendPasswordResetEmail(to, resetLink) {
        const msg = {
            to,
            from: process.env.FROM_EMAIL,
            subject: 'Password Reset Request',
            html: `
                <h2>Password Reset Request</h2>
                <p>You have requested to reset your password.</p>
                <p>Click the link below to reset your password:</p>
                <p><a href="${resetLink}">Reset Password</a></p>
                <p>If you did not request this, please ignore this email.</p>
                <hr>
                <p>This is an automated message. Please do not reply to this email.</p>
            `
        };

        try {
            await sgMail.send(msg);
            return true;
        } catch (error) {
            console.error('Email sending failed:', error);
            return false;
        }
    }
}

module.exports = EmailService;