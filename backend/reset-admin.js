// One-time script to reset admin password
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const admin = await Admin.findOne({ username: 'admin' });
  if (!admin) {
    console.log('Admin not found');
    process.exit(1);
  }
  admin.password = 'admin123';
  await admin.save();
  console.log('✅ Admin password reset to: admin123');
  console.log('Admin:', admin.username, admin.email);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
