const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Admin = require('./models/Admin');
const Student = require('./models/Student');
const Department = require('./models/Department');
const Complaint = require('./models/Complaint');
const Class = require('./models/Class');

const backup = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    const [admins, students, departments, complaints, classes] = await Promise.all([
      Admin.find().select('-password').lean(),
      Student.find().select('-password').lean(),
      Department.find().lean(),
      Complaint.find().lean(),
      Class.find().lean(),
    ]);

    const data = {
      exportedAt: new Date().toISOString(),
      counts: {
        admins: admins.length,
        students: students.length,
        departments: departments.length,
        complaints: complaints.length,
        classes: classes.length,
      },
      admins,
      students,
      departments,
      complaints,
      classes,
    };

    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

    const date = new Date().toISOString().slice(0, 10);
    const filePath = path.join(backupDir, `backup-${date}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`✅ Backup saved: ${filePath}`);
    console.log(`   Admins: ${admins.length}, Students: ${students.length}, Complaints: ${complaints.length}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Backup failed:', err.message);
    process.exit(1);
  }
};

backup();
