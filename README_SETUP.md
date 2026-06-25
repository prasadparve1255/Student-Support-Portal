# Digital Complaint Management System - Setup Guide

## Project Structure
```
DigitalComplaintSystem_Final_MERN_Atlas/
├── backend/          # Node.js/Express backend
├── project/          # React/TypeScript frontend
├── SECURITY.md       # Security documentation
└── README_SETUP.md   # This setup guide
```

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

## Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
```

### 2. Environment Configuration
Copy and configure environment files:

**Backend (.env):**
```bash
cp .env.example .env
# Edit .env with your actual values
```

**Frontend (.env):**
```bash
cd ../project
cp .env.example .env
# Edit .env with your actual values
```

### 3. Database Setup
```bash
# Start MongoDB locally or use MongoDB Atlas
# Update MONGO_URI in backend/.env

# Seed the database (optional)
cd backend
npm run seed
```

### 4. Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd project
npm run dev
```

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/digital_complaint_system
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Email Configuration
# For production, use RESEND_API_KEY and EMAIL_FROM
# EMAIL_USER and EMAIL_PASSWORD are no longer used

# Default passwords for seeding
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_STUDENT_PASSWORD=student123
```

### Frontend (.env)
```env
VITE_DEFAULT_STUDENT_PASSWORD=student123
VITE_DEFAULT_ADMIN_PASSWORD=admin123
VITE_API_BASE_URL=http://localhost:5000/api
```

## Demo Credentials (Development)
- **Student**: CS001 / student123
- **Main Admin**: admin / admin123
- **Department Admins**: csadmin, ecadmin, meadmin / admin123

## Features
- ✅ Student complaint submission and tracking
- ✅ Admin dashboard for complaint management
- ✅ Department-based access control
- ✅ Email notifications (configurable)
- ✅ Responsive design
- ✅ Secure authentication
- ✅ Real-time status updates

## Security Fixes Applied
- ✅ Removed all hardcoded credentials
- ✅ Implemented environment variable configuration
- ✅ Secure email service setup
- ✅ Production-ready environment templates

## Available Scripts

### Backend
```bash
npm run dev          # Start development server
npm run start        # Start production server
npm run seed         # Seed database with sample data
npm run test         # Run tests
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Run ESLint
```

## Deployment

### Production Environment
1. Set secure environment variables
2. Use HTTPS for all connections
3. Configure MongoDB Atlas with proper security
4. Set up proper email service credentials
5. Use strong, unique passwords

### Docker (Optional)
```bash
# Build and run with Docker
docker-compose up --build
```

## Troubleshooting

### Common Issues
1. **MongoDB Connection**: Ensure MongoDB is running and connection string is correct
2. **Port Conflicts**: Change PORT in .env if 5000 is occupied
3. **Email Service**: Verify email credentials and app-specific passwords
4. **CORS Issues**: Check FRONTEND_URL in backend .env

### Support
- Check SECURITY.md for security guidelines
- Review error logs in console
- Ensure all environment variables are set correctly

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
This project is for educational purposes.