# Digital Complaint System - Backend

## Email Configuration

To enable email notifications when registering students, you need to configure the email settings:

1. Open the `.env` file in the backend directory
2. Update the following variables:
   ```
   EMAIL_USER=your-gmail-address@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

### How to get an App Password for Gmail:

1. Go to your Google Account settings: https://myaccount.google.com/
2. Select "Security"
3. Under "Signing in to Google," select "2-Step Verification" (you need to have this enabled)
4. At the bottom of the page, select "App passwords"
5. Select "Mail" as the app and "Other" as the device
6. Enter "Digital Complaint System" as the name
7. Click "Generate"
8. Use the 16-character password that appears as your `EMAIL_PASSWORD` in the .env file

## Important Notes:

- Do not use your regular Gmail password as it won't work with nodemailer
- The app password is a 16-character code that gives the app permission to access your Gmail account
- Keep your app password secure and never commit it to version control
- If you're not using Gmail, you'll need to modify the email service configuration in `utils/emailService.js`