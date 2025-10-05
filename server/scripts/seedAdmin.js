require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const AdminUser = require('../models/AdminUser');

(async function(){
  try{
    await connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/certdb');
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    let user = await AdminUser.findOne({ email });
    if (user) {
      console.log('Admin user already exists:', email);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    user = await AdminUser.create({ email, passwordHash });
    console.log('Created admin user:', email);
    process.exit(0);
  }catch(err){
    console.error(err);
    process.exit(1);
  }
})();
