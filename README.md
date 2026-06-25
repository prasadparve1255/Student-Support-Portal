# 🎓 Student Support Portal

A full-stack **MERN** (MongoDB, Express.js, React, Node.js) web application for managing student complaints and support requests in educational institutions.

---

## 🚀 Live Demo

> Frontend: _Coming Soon (Deploy on Vercel)_  
> Backend API: _Coming Soon (Deploy on Render)_

---

## 📌 Features

- 🔐 **Role-based Authentication** — Admin & Student login with JWT
- 📋 **Complaint Submission** — Students can submit complaints with file attachments
- 📊 **Admin Dashboard** — View, manage, and track all complaints
- 🏫 **Department Management** — Complaints routed to specific departments
- 📧 **Email Notifications** — Auto email on student registration
- 👨‍🎓 **Student Management** — Register, view, and manage student records
- 🏷️ **Class Management** — Organize students by class/section

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Frontend   | React 18, TypeScript, Tailwind CSS, Vite |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB Atlas                        |
| Auth       | JWT (JSON Web Tokens)               |
| Email      | Nodemailer (Gmail)                  |
| File Upload| Multer                              |

---

## 📁 Project Structure

```
Student-Support-Portal/
├── backend/                  # Express.js API server
│   ├── config/               # Database connection
│   ├── controllers/          # Route controllers
│   ├── middleware/           # Auth, error handling, file upload
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   ├── utils/                # Email service
│   ├── server.js             # Entry point
│   └── package.json
├── project/                  # React frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── context/          # React context (Auth)
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API service calls
│   │   ├── types/            # TypeScript types
│   │   └── App.tsx
│   └── package.json
├── package.json              # Root scripts
└── README.md
```

---

## ⚙️ Local Setup Instructions

### Prerequisites

- Node.js v16 or higher
- MongoDB Atlas account
- Gmail account (for email notifications)
- Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/prasadparve1255/Student-Support-Portal.git
cd Student-Support-Portal
```

---

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../project && npm install
cd ..
```

---

### 3. Configure Environment Variables

#### Backend — create `backend/.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/complaintDB?retryWrites=true&w=majority
JWT_SECRET=your_strong_jwt_secret_here
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_STUDENT_PASSWORD=student123
```

> 💡 For Gmail App Password: Go to Google Account → Security → 2-Step Verification → App Passwords

#### Frontend — create `project/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_DEFAULT_STUDENT_PASSWORD=password123
VITE_DEFAULT_ADMIN_PASSWORD=admin123
```

---

### 4. Seed the Database

```bash
cd backend
npm run seed
```

---

### 5. Start the Application

```bash
# From root directory — starts both backend & frontend
npm start
```

- Backend runs on: `http://localhost:5000`
- Frontend runs on: `http://localhost:5173`

---

## 🔑 Default Login Credentials

| Role    | Username / ID | Password   |
|---------|---------------|------------|
| Admin   | admin         | admin123   |
| Student | CS001         | password123 |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint                  | Description        |
|--------|---------------------------|--------------------|
| POST   | `/api/auth/admin/login`   | Admin login        |
| POST   | `/api/auth/student/login` | Student login      |
| GET    | `/api/auth/me`            | Get current user   |

### Students
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| POST   | `/api/students`       | Register new student |
| GET    | `/api/students`       | Get all students     |
| GET    | `/api/students/:id`   | Get student by ID    |

### Complaints
| Method | Endpoint                              | Description                  |
|--------|---------------------------------------|------------------------------|
| POST   | `/api/complaints/submit`              | Submit a complaint           |
| GET    | `/api/complaints/all`                 | Get all complaints           |
| GET    | `/api/complaints/:department`         | Get complaints by department |
| GET    | `/api/complaints/student/:studentId`  | Get complaints by student    |

---

## ☁️ Deployment Guide

### Backend → [Render.com](https://render.com)

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Set:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build --prefix ../project`
   - Start Command: `npm start`
4. Add all environment variables from `backend/.env`

### Frontend → [Vercel](https://vercel.com)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Set:
   - Root Directory: `project`
   - Framework: Vite
4. Add environment variable:
   - `VITE_API_BASE_URL` = your Render backend URL

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Check `MONGO_URI` in `.env`, whitelist IP in Atlas |
| Email not sending | Use Gmail App Password, not regular password |
| Backend not starting | Check port 5000 is free, run `npm install` |
| Frontend API error | Verify `VITE_API_BASE_URL` points to backend |

---

## 👨‍💻 Author

**Prasad Parve**  
GitHub: [@prasadparve1255](https://github.com/prasadparve1255)

---

## 📄 License

This project is for academic purposes.
