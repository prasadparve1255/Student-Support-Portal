require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash('Prasad@123', salt);
  const result = await mongoose.connection.collection('students').updateOne(
    { studentId: '26CS01' },
    { $set: { password: hashed } }
  );
  console.log(result.modifiedCount > 0 ? '✅ Password reset for 26CS01' : '❌ Student not found');
  mongoose.disconnect();
}).catch(e => { console.error(e.message); process.exit(1); });
