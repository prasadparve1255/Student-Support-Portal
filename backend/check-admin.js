const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const Admin = require('./models/Admin');
const connectDB = require('./config/db');

const checkAdmin = async () => {
  await connectDB();

  const admins = await Admin.find({});
  console.log('Total admins in DB:', admins.length);

  for (const admin of admins) {
    console.log('---');
    console.log('Username:', admin.username);
    console.log('Password hash:', admin.password);
    const match = await bcrypt.compare('admin123', admin.password);
    console.log('admin123 matches:', match);
  }

  process.exit(0);
};

checkAdmin().catch(err => { console.error(err); process.exit(1); });
