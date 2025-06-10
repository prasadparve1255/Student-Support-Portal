# Digital Complaint Management System

A full-stack application for managing student complaints in educational institutions, built with Firebase, Node.js, Express, React, and Bootstrap.

## Features

- Student and Admin authentication using Firebase Auth
- Role-based access control
- Complaint submission and tracking
- Department-wise complaint filtering
- Email notifications using SendGrid
- File attachments using Firebase Storage
- Dark UI theme with Bootstrap

## Prerequisites

1. Node.js (v14 or higher)
2. Firebase account
3. SendGrid account
4. Git

## Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Email/Password authentication
3. Create a Firestore database
4. Create a Storage bucket
5. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `serviceAccountKey.json` in `backend/config/`

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.sample`:
   ```bash
   cp .env.sample .env
   ```

4. Update the `.env` file with your credentials:
   ```
   PORT=5000
   NODE_ENV=development
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="your-private-key"
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   SENDGRID_API_KEY=your-sendgrid-api-key
   FROM_EMAIL=your-verified-sender@domain.com
   FRONTEND_URL=http://localhost:5173
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

## Frontend Setup

1. Navigate to the project directory:
   ```bash
   cd project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.sample .env
   ```

4. Update the `.env` file with your Firebase config:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_API_URL=http://localhost:5000
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Firebase Security Rules

The project includes security rules for both Firestore and Storage. You can find them in:
- `backend/config/firestore.rules`
- `backend/config/storage.rules`

Deploy these rules using the Firebase CLI:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## Project Structure

```
.
├── backend/
│   ├── config/
│   │   ├── firebase.js
│   │   ├── firestore.rules
│   │   └── storage.rules
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
└── project/
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── hooks/
    │   ├── pages/
    │   └── services/
    └── public/
```

## API Documentation

### Authentication Endpoints

- POST `/api/auth/student/register` - Register a new student
- POST `/api/auth/student/login` - Student login
- POST `/api/auth/admin/register` - Register a new admin (requires main admin)
- POST `/api/auth/admin/login` - Admin login

### Complaint Endpoints

- GET `/api/complaints` - Get all complaints (filtered by role)
- POST `/api/complaints` - Create a new complaint
- GET `/api/complaints/:id` - Get complaint details
- PUT `/api/complaints/:id` - Update complaint status
- DELETE `/api/complaints/:id` - Delete complaint (main admin only)

### Department Endpoints

- GET `/api/departments` - Get all departments
- POST `/api/departments` - Create a new department
- PUT `/api/departments/:id` - Update department
- DELETE `/api/departments/:id` - Delete department

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.