# Student Support Portal — Deployment Guide

## 🚀 Deploy on Render.com (Free)

### Step 1 — GitHub वर Push करा
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/student-support-portal.git
git push -u origin main
```

### Step 2 — Render.com वर Deploy करा
1. https://render.com वर जा → New Web Service
2. GitHub repo connect करा
3. खालील settings द्या:
   - **Build Command:** `npm install && npm run build --prefix project && npm install --prefix backend`
   - **Start Command:** `npm run start --prefix backend`
   - **Environment:** Node

### Step 3 — Environment Variables set करा
Render Dashboard → Environment मध्ये खालील variables add करा:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | your MongoDB Atlas connection string |
| `JWT_SECRET` | any random secret key |
| `FRONTEND_URL` | your render app URL (e.g., https://student-support-portal.onrender.com) |
| `RESEND_API_KEY` | your Resend API key (from resend.com) |
| `EMAIL_FROM` | your verified domain email from Resend (e.g., `noreply@yourdomain.com`) |

---

## 🧪 College Testing Guide

### Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Main Admin | admin | admin123 |
| CS Dept Admin | csadmin | (set during seed) |
| EC Dept Admin | ecadmin | (set during seed) |

### Testing Steps

**1. Main Admin Test:**
- Login as `admin`
- Add new Department + Department Admin
- View all complaints and students
- Generate Reports (PDF / Excel)

**2. Department Admin Test:**
- Login as department admin
- Register new student
- View only own department's students & complaints
- Update complaint status

**3. Student Test:**
- Login with registered student ID
- Submit a complaint (with file attachment)
- Check email notification
- Track complaint status

---

## 💾 Weekly Backup

Run backup manually:
```bash
cd backend
npm run backup
```

Backup file will be saved in `backend/backups/backup-YYYY-MM-DD.json`

---

## 🛠 Local Development

```bash
# Backend
cd backend
npm install
node server.js

# Frontend (new terminal)
cd project
npm install
npm run dev
```

Frontend: http://localhost:5173
Backend API: http://localhost:5000
