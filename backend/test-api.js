const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware - restrict CORS to localhost only for testing
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/departments', departmentRoutes);

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});