// Simple script to seed sample certificates
require('dotenv').config();
const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');
const connectDB = require('../config/db');

(async function () {
  try {
    await connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/certdb');
    await Certificate.deleteMany({});

    const samples = [
      { serialNumber: 'C-2025-0001', studentName: 'Aman Kumar', course: 'Web Dev', grade: 'A', issueDate: new Date('2025-06-01') },
      { serialNumber: 'C-2025-0002', studentName: 'Priya Singh', course: 'AI Basics', grade: 'A+', issueDate: new Date('2025-07-10') }
    ];

    for (const s of samples) {
      const c = new Certificate(s);
      await c.save();
      console.log('Saved', s.serialNumber);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
