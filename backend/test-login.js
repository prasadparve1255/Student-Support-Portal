const dotenv = require('dotenv');
dotenv.config();
const Admin = require('./models/Admin');
const connectDB = require('./config/db');

const testLogin = async () => {
  await connectDB();

  const username = 'admin';
  const password = 'admin123';

  const admin = await Admin.findOne({ username });
  console.log('Admin found:', !!admin);
  if (!admin) { process.exit(0); }

  const isMatch = await admin.comparePassword(password);
  console.log('Password match:', isMatch);

  process.exit(0);
};

testLogin().catch(err => { console.error(err); process.exit(1); });
